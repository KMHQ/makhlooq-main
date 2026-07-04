'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../src/components/Header';
import ProfileModal from '../../../../src/components/team/ProfileModal';

export default function TeamMemberProfile() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/team-members?discord_uid=${encodeURIComponent(params.username)}`);
        const data = await res.json().catch(() => null);
        if (res.ok && data && !data.error) {
          setMember(data);
        } else {
          setMember(null);
        }
      } catch (err) {
        console.error('Failed to fetch member details:', err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040806] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#040806] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Member Not Found</h1>
        <Link href="/team" className="text-emerald-400 hover:underline text-sm">← Back to Team</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040806] text-white">
      <Header />
      <ProfileModal member={member} onClose={() => router.push('/team')} />
    </div>
  );
}
