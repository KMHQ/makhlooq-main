import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireFleetAdmin } from '../../../lib/adminAuth';
import { getPayloadInstance } from '../../../lib/payload';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const payload = await getPayloadInstance();
    const result = await payload.find({
      collection: 'news-posts',
      sort: '-publishedAt',
      limit: 100,
      depth: 2,
    });

    const formatted = result.docs.map((item) => ({
      id: item.id,
      title: item.title,
      body: typeof item.body === 'string' ? item.body : JSON.stringify(item.body || ''),
      published_at: item.publishedAt || new Date().toISOString(),
      media_url: item.coverImage?.url || null,
      media_type: item.coverImage ? 'image' : null,
      category: item.category || 'announcement',
      author_handle: item.authorHandle || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireFleetAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const contentType = request.headers.get('content-type') || '';
  let title;
  let newsBody;
  let mediaUrl;
  let mediaType;
  let mediaFile;
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
    publishedAt = formData.get('published_at');
    category = String(formData.get('category') || '').trim() || 'announcement';
    authorHandle = String(formData.get('author_handle') || '').trim() || null;
  } else {
    const body = await request.json();
    title = String(body.title || '');
    newsBody = String(body.body || '');
    mediaUrl = String(body.media_url || '').trim() || null;
    mediaType = String(body.media_type || '').trim() || null;
    publishedAt = body.published_at;
    category = String(body.category || '').trim() || 'announcement';
    authorHandle = String(body.author_handle || '').trim() || null;
  }

  if (!title?.trim() || !newsBody?.trim()) {
    return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 });
  }

  try {
    const payload = await getPayloadInstance();

    let mediaDocId = null;
    if (mediaFile && typeof mediaFile !== 'string' && typeof mediaFile.arrayBuffer === 'function') {
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
    } else if (mediaUrl && mediaUrl.startsWith('http')) {
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
        console.error('Failed to download external media URL:', e);
      }
    }

    const createdPost = await payload.create({
      collection: 'news-posts',
      data: {
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        category,
        authorHandle,
        coverImage: mediaDocId || null,
        body: newsBody.trim(),
      },
    });

    const populatedPost = await payload.findByID({
      collection: 'news-posts',
      id: createdPost.id,
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

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
