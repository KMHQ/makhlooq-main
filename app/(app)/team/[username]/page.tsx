"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import ProfileModal from "@/app/components/team/ProfileModal";
import type { TeamMember } from "@/types/db";

export default function TeamMemberProfile() {
    const params = useParams<{ username: string }>();
    const router = useRouter();
    const [member, setMember] = useState<TeamMember | null>(null);
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
                console.error("Failed to fetch member details:", err);
                setMember(null);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [params.username]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#040806] text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#040806] text-white">
                <h1 className="text-2xl font-bold">Member Not Found</h1>
                <Link href="/team" className="text-sm text-emerald-400 hover:underline">
                    ← Back to Team
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040806] text-white">
            <Header />
            <ProfileModal member={member} onClose={() => router.push("/team")} />
        </div>
    );
}
