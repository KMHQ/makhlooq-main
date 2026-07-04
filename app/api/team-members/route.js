import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireFleetAdmin, getAdminSession } from '../../../lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  const url = new URL(request.url);
  const discordUid = url.searchParams.get('discord_uid');

  if (discordUid) {
    let { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('discord_uid', discordUid)
      .maybeSingle();

    if (!data) {
      const fallback = await supabase
        .from('team_members')
        .select('*')
        .ilike('name', discordUid)
        .maybeSingle();
      if (fallback.data) data = fallback.data;
    }

    if (error) {
      console.error(`Supabase error fetching member by discord_uid ${discordUid}:`, error.message);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const showAll = url.searchParams.get('all') === '1';

  // Only admins can request all members (including unapproved)
  if (showAll) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('joined_at');

    if (error) {
      console.error('Supabase error fetching all members:', error.message);
      return NextResponse.json({ error: 'Database connection failed. Please check your Supabase credentials.' }, { status: 500 });
    }
    return NextResponse.json(data || []);
  }

  // Public: only return approved members
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_approved', true)
    .order('joined_at');

  if (error) {
    console.error('Supabase error fetching approved members:', error.message);
    return NextResponse.json({ error: 'Database connection failed. Please check your Supabase credentials.' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(request) {
  const auth = await requireFleetAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { data, error } = await supabase
    .from('team_members')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
