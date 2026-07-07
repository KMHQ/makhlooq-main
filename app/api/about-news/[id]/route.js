import { NextResponse } from 'next/server';
import { requireFleetAdmin } from '../../../../lib/adminAuth';
import { getPayloadInstance } from '../../../../lib/payload';

function stringToLexical(text) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  if (typeof text === 'string' && text.trim().startsWith('{')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // Treat as plain text
    }
  }

  const paragraphs = text.split(/\n\s*\n/);
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map(p => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: p,
            version: 1
          }
        ]
      }))
    }
  };
}

async function processContentBlocks(contentBlocksJson, formData, payload, title) {
  if (!contentBlocksJson) return [];
  let blocks = [];
  try {
    blocks = typeof contentBlocksJson === 'string' ? JSON.parse(contentBlocksJson) : contentBlocksJson;
  } catch (e) {
    console.error('Failed to parse content blocks JSON:', e);
    return [];
  }

  const processedBlocks = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    if (block.blockType === 'textBlock') {
      processedBlocks.push({
        blockType: 'textBlock',
        content: stringToLexical(block.content),
      });
    } 
    else if (block.blockType === 'imageBlock') {
      let imageId = block.image || null;

      // Check if there is an uploaded file
      const fileKey = block.fileKey;
      const file = fileKey && formData ? formData.get(fileKey) : null;

      if (file && typeof file !== 'string' && typeof file.arrayBuffer === 'function') {
        const bytes = Buffer.from(await file.arrayBuffer());
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: (block.caption || title || 'Image block').trim(),
          },
          file: {
            data: bytes,
            name: file.name,
            mimetype: file.type,
            size: file.size,
          },
        });
        imageId = mediaDoc.id;
      } 
      else if (block.imageUrl && block.imageUrl.startsWith('http') && (!block.image || block.imageUrl !== block.prevImageUrl)) {
        try {
          const res = await fetch(block.imageUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const bytes = Buffer.from(arrayBuffer);
            const mime = res.headers.get('content-type') || 'image/png';
            const ext = mime.split('/')[1] || 'png';
            const fileName = `block-image-${Date.now()}.${ext}`;

            const mediaDoc = await payload.create({
              collection: 'media',
              data: {
                alt: (block.caption || title || 'Image block').trim(),
              },
              file: {
                data: bytes,
                name: fileName,
                mimetype: mime,
                size: bytes.length,
              },
            });
            imageId = mediaDoc.id;
          }
        } catch (e) {
          console.error('Failed to download block image:', e);
        }
      }

      processedBlocks.push({
        blockType: 'imageBlock',
        image: imageId,
        caption: block.caption || null,
        fullWidth: !!block.fullWidth,
      });
    } 
    else if (block.blockType === 'videoBlock') {
      let videoFileId = block.videoFile || null;
      
      const fileKey = block.fileKey;
      const file = fileKey && formData ? formData.get(fileKey) : null;

      if (file && typeof file !== 'string' && typeof file.arrayBuffer === 'function') {
        const bytes = Buffer.from(await file.arrayBuffer());
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: (block.caption || title || 'Video block').trim(),
          },
          file: {
            data: bytes,
            name: file.name,
            mimetype: file.type,
            size: file.size,
          },
        });
        videoFileId = mediaDoc.id;
      }

      processedBlocks.push({
        blockType: 'videoBlock',
        videoSource: block.videoSource || 'upload',
        videoFile: videoFileId,
        videoUrl: block.videoUrl || null,
        caption: block.caption || null,
        autoplay: !!block.autoplay,
      });
    } 
    else if (block.blockType === 'embedBlock') {
      processedBlocks.push({
        blockType: 'embedBlock',
        url: block.url || null,
        caption: block.caption || null,
      });
    }
  }

  return processedBlocks;
}

export async function PUT(request, { params }) {
  const auth = await requireFleetAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'News ID is required.' }, { status: 400 });
  }

  const parsedId = isNaN(id) ? id : Number(id);

  const contentType = request.headers.get('content-type') || '';
  let title;
  let newsBody;
  let mediaUrl;
  let mediaType;
  let mediaFile;
  let keepMedia = true;
  let publishedAt;
  let category;
  let authorHandle;
  let authorSource = 'external';
  let authorMemberId = null;
  let authorExternal = null;
  let contentBlocksRaw = null;
  let formData = null;

  if (contentType.includes('multipart/form-data')) {
    formData = await request.formData();
    title = String(formData.get('title') || '');
    newsBody = String(formData.get('body') || '');
    mediaUrl = String(formData.get('media_url') || '').trim() || null;
    mediaType = String(formData.get('media_type') || '').trim() || null;
    mediaFile = formData.get('media_file');
    keepMedia = formData.get('keep_media') !== 'false';
    publishedAt = formData.get('published_at');
    category = String(formData.get('category') || '').trim() || 'announcement';
    authorHandle = String(formData.get('author_handle') || '').trim() || null;
    authorSource = String(formData.get('author_source') || 'external');
    authorMemberId = String(formData.get('author_member_id') || '').trim() || null;
    authorExternal = String(formData.get('author_external') || '').trim() || null;
    contentBlocksRaw = formData.get('content_blocks');
  } else {
    const body = await request.json();
    title = String(body.title || '');
    newsBody = String(body.body || '');
    mediaUrl = String(body.media_url || '').trim() || null;
    mediaType = String(body.media_type || '').trim() || null;
    keepMedia = body.keep_media !== false;
    publishedAt = body.published_at;
    category = String(body.category || '').trim() || 'announcement';
    authorHandle = String(body.author_handle || '').trim() || null;
    authorSource = body.author_source || 'external';
    authorMemberId = body.author_member_id || null;
    authorExternal = body.author_external || null;
    contentBlocksRaw = typeof body.content_blocks === 'string' ? body.content_blocks : JSON.stringify(body.content_blocks || []);
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  try {
    const payload = await getPayloadInstance();

    // Get current post
    const currentPost = await payload.findByID({
      collection: 'news-posts',
      id: parsedId,
      depth: 1,
    });

    let mediaDocId = currentPost.coverImage?.id || currentPost.coverImage || null;

    if (!keepMedia && !mediaFile && !mediaUrl) {
      mediaDocId = null;
    } else if (mediaFile && typeof mediaFile !== 'string' && typeof mediaFile.arrayBuffer === 'function') {
      const bytes = Buffer.from(await mediaFile.arrayBuffer());
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: title.trim(),
        },
        file: {
          data: bytes,
          name: mediaFile.name,
          mimetype: mediaFile.type,
          size: mediaFile.size,
        },
      });
      mediaDocId = mediaDoc.id;
    } else if (mediaUrl && mediaUrl.startsWith('http') && mediaUrl !== currentPost.coverImage?.url) {
      try {
        const res = await fetch(mediaUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const bytes = Buffer.from(arrayBuffer);
          const mime = res.headers.get('content-type') || 'image/png';
          const ext = mime.split('/')[1] || 'png';
          const fileName = `${Date.now()}.${ext}`;

          const mediaDoc = await payload.create({
            collection: 'media',
            data: {
              alt: title.trim(),
            },
            file: {
              data: bytes,
              name: fileName,
              mimetype: mime,
              size: bytes.length,
            },
          });
          mediaDocId = mediaDoc.id;
        }
      } catch (e) {
        console.error('Failed to download external media:', e);
      }
    }

    // 2. Handle block contents
    const processedBlocks = await processContentBlocks(contentBlocksRaw, formData, payload, title);

    // If body isn't provided, build a basic summary from blocks
    let finalBody = newsBody.trim();
    if (!finalBody && processedBlocks.length > 0) {
      const firstTextBlock = processedBlocks.find(b => b.blockType === 'textBlock');
      if (firstTextBlock && firstTextBlock.content) {
        finalBody = typeof firstTextBlock.content === 'string' 
          ? firstTextBlock.content 
          : "Structured dispatch report.";
      } else {
        finalBody = "Dispatch update.";
      }
    }

    // 3. Resolve authorHandle fallback
    let resolvedAuthorHandle = authorHandle;
    if (!resolvedAuthorHandle) {
      if (authorSource === 'member' && authorMemberId) {
        try {
          const member = await payload.findByID({
            collection: 'team_members',
            id: authorMemberId,
          });
          resolvedAuthorHandle = member?.discord_tag || member?.name || '';
        } catch {}
      } else {
        resolvedAuthorHandle = authorExternal || '';
      }
    }

    await payload.update({
      collection: 'news-posts',
      id: parsedId,
      data: {
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        category,
        authorSource,
        authorMember: authorSource === 'member' ? authorMemberId : null,
        authorExternal: authorSource === 'external' ? authorExternal : null,
        authorHandle: resolvedAuthorHandle,
        coverImage: mediaDocId,
        contentBlocks: processedBlocks,
        body: stringToLexical(finalBody),
      },
    });

    const populatedPost = await payload.findByID({
      collection: 'news-posts',
      id: parsedId,
      depth: 3,
    });

    const formatted = {
      id: populatedPost.id,
      title: populatedPost.title,
      body: typeof populatedPost.body === 'string' ? populatedPost.body : JSON.stringify(populatedPost.body || ''),
      contentBlocks: populatedPost.contentBlocks || [],
      published_at: populatedPost.publishedAt,
      media_url: populatedPost.coverImage?.url || null,
      media_type: populatedPost.coverImage ? 'image' : null,
      category: populatedPost.category,
      author_handle: resolvedAuthorHandle,
      authorSource: populatedPost.authorSource || 'external',
      authorMember: populatedPost.authorMember || null,
      authorExternal: populatedPost.authorExternal || null,
      coverImage: populatedPost.coverImage || null,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  const auth = await requireFleetAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'News ID is required.' }, { status: 400 });
  }

  const parsedId = isNaN(id) ? id : Number(id);

  try {
    const payload = await getPayloadInstance();
    await payload.delete({
      collection: 'news-posts',
      id: parsedId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
