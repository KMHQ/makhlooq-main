import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireFleetAdmin } from '../../../../lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const updateData = {
    title: title.trim(),
    body: newsBody.trim(),
    category: category,
    author_handle: authorHandle,
  };

  if (!keepMedia && !mediaFile && !mediaUrl) {
    updateData.media_url = null;
    updateData.media_type = null;
  } else if (storedMediaUrl) {
    updateData.media_url = storedMediaUrl;
    updateData.media_type = normalizedMediaType;
  }

  if (publishedAt) {
    updateData.published_at = new Date(publishedAt).toISOString();
  }

  const { data, error } = await supabase
    .from('about_news')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Fallback if category/author_handle columns do not exist in table schema
    delete updateData.category;
    delete updateData.author_handle;
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('about_news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }
    return NextResponse.json(fallbackData, { status: 200 });
  }

  return NextResponse.json(data, { status: 200 });
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

  const { error } = await supabase
    .from('about_news')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
