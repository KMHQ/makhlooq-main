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

  const allowedMediaTypes = ['image', 'video', 'link'];
  let normalizedMediaType = null;
  let storedMediaUrl = mediaUrl;

  if (mediaFile && typeof mediaFile !== 'string' && typeof mediaFile.arrayBuffer === 'function') {
    if (!mediaType || !['image', 'video'].includes(mediaType)) {
      return NextResponse.json({ error: 'Media type must be image or video when uploading a file.' }, { status: 400 });
    }

    const ext = String(mediaFile.name || '').split('.').pop() || (mediaType === 'image' ? 'png' : 'mp4');
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `about-news/${fileName}`;
    const bytes = Buffer.from(await mediaFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, bytes, { contentType: mediaFile.type || (mediaType === 'image' ? 'image/png' : 'video/mp4'), upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(path);
    storedMediaUrl = publicData?.publicUrl || null;
    normalizedMediaType = mediaType;
  } else if (mediaUrl) {
    if (mediaType && allowedMediaTypes.includes(mediaType)) {
      normalizedMediaType = mediaType;
    } else {
      const url = mediaUrl.trim().toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/)) normalizedMediaType = 'image';
      else if (url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/)) normalizedMediaType = 'video';
      else normalizedMediaType = 'link';
    }
  }

  const insertPayload = {
    title: title.trim(),
    body: newsBody.trim(),
    media_url: storedMediaUrl ? storedMediaUrl.trim() : null,
    media_type: normalizedMediaType,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    category: category,
    author_handle: authorHandle,
  };

  const { data, error } = await supabase
    .from('about_news')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    // If category/author_handle columns don't exist in Supabase table yet, fallback without them
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('about_news')
      .insert({
        title: title.trim(),
        body: newsBody.trim(),
        media_url: storedMediaUrl ? storedMediaUrl.trim() : null,
        media_type: normalizedMediaType,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      })
      .select()
      .single();

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }
    return NextResponse.json(fallbackData, { status: 201 });
  }

  return NextResponse.json(data, { status: 201 });
}
