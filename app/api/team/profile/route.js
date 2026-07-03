import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminSession } from '../../../../lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(request) {
  const session = await getAdminSession();
  if (!session?.discordId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = await request.json();
  const allowed = {};
  for (const key of ['node_color', 'flair_color', 'bio', 'status', 'avatar_url']) {
    if (body[key] !== undefined) allowed[key] = body[key];
  }

  const { data, error } = await supabase
    .from('team_members')
    .update(allowed)
    .eq('discord_uid', session.discordId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session?.discordId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar');
  if (!file || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'avatar file is required' }, { status: 400 });
  }

  // Size restriction (20MB = 20,971,520 bytes)
  if (file.size > 20971520) {
    return NextResponse.json({ error: 'File size exceeds the 20MB limit.' }, { status: 400 });
  }

  // Mimetype and Extension safety restrictions
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const ext = String(file.name || 'png').split('.').pop()?.toLowerCase() || 'png';

  if (!allowedMimes.includes(file.type) || !allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP, and GIF images are allowed.' }, { status: 400 });
  }

  const path = `avatars/${session.discordId}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type || 'image/png', upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

  const { data, error } = await supabase
    .from('team_members')
    .update({ avatar_url: publicUrl })
    .eq('discord_uid', session.discordId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
