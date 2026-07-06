import { NextResponse } from 'next/server';
import { requireFleetAdmin } from '../../../../lib/adminAuth';
import { getPayloadInstance } from '../../../../lib/payload';

export async function PUT(request, { params }) {
  const auth = await requireFleetAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'News ID is required.' }, { status: 400 });
  }

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

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    title = String(formData.get('title') || '');
    newsBody = String(formData.get('body') || '');
    mediaUrl = String(formData.get('media_url') || '').trim() || null;
    mediaType = String(formData.get('media_type') || '').trim() || null;
    mediaFile = formData.get('media_file');
    keepMedia = formData.get('keep_media') !== 'false';
    publishedAt = formData.get('published_at');
    category = String(formData.get('category') || '').trim() || 'announcement';
    authorHandle = String(formData.get('author_handle') || '').trim() || null;
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
  }

  if (!title?.trim() || !newsBody?.trim()) {
    return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 });
  }

  try {
    const payload = await getPayloadInstance();

    // Get current post
    const currentPost = await payload.findByID({
      collection: 'news-posts',
      id,
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

    await payload.update({
      collection: 'news-posts',
      id,
      data: {
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        category,
        authorHandle,
        coverImage: mediaDocId,
        body: newsBody.trim(),
      },
    });

    const populatedPost = await payload.findByID({
      collection: 'news-posts',
      id,
      depth: 2,
    });

    const formatted = {
      id: populatedPost.id,
      title: populatedPost.title,
      body: typeof populatedPost.body === 'string' ? populatedPost.body : JSON.stringify(populatedPost.body || ''),
      published_at: populatedPost.publishedAt,
      media_url: populatedPost.coverImage?.url || null,
      media_type: populatedPost.coverImage ? 'image' : null,
      category: populatedPost.category,
      author_handle: populatedPost.authorHandle,
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

  try {
    const payload = await getPayloadInstance();
    await payload.delete({
      collection: 'news-posts',
      id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
