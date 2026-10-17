"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PortableTextRenderer } from "../PortableTextRenderer";

export default function AboutNews({ initialNews }) {
    const [news, setNews] = useState(initialNews || []);
    const [loading, setLoading] = useState(!initialNews);

    useEffect(() => {
        if (initialNews) return;
        let mounted = true;

        fetch("/api/about-news")
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                setNews(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!mounted) return;
                setNews([]);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [initialNews]);

    return (
        <section className="relative overflow-hidden bg-[#040806] text-white border-t border-white/5">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
                <div className="mb-12 text-center">
                    <div className="font-mono text-[10px] uppercase tracking-[0.45em] text-lime-400/50 mb-4">◈ Latest Dispatches ◈</div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">News from the bridge</h2>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {loading ? (
                        <div className="col-span-2 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-gray-400">
                            Loading news...
                        </div>
                    ) : news.length === 0 ? (
                        <div className="col-span-2 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-gray-400">
                            No news has been posted yet.
                        </div>
                    ) : (
                        news.map((item) => (
                            <motion.article
                                key={item._id || item.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 shadow-[0_24px_90px_rgba(0,0,0,0.25)]"
                            >
                                {/* Cover Image — supports both Payload URL and old Sanity format */}
                                {(item.coverImage?.url || item.coverImage?.asset?.url) && (
                                    <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 aspect-video">
                                        <img
                                            src={item.coverImage?.url || item.coverImage.asset.url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="font-mono text-xs font-black uppercase tracking-[0.35em] text-lime-400/60">
                                        {new Date(item.publishedAt || item.published_at).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                    {(item.category || item.media_type) && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-white/10 text-gray-300 border border-white/5">
                                            {item.category || item.media_type}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>

                                {Array.isArray(item.body) ? (
                                    <PortableTextRenderer content={item.body} />
                                ) : (
                                    <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{item.body}</p>
                                )}

                                {item.media_url ? (
                                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                                        {item.media_type === "image" ? (
                                            <img src={item.media_url} alt={item.title} className="w-full rounded-3xl object-cover" />
                                        ) : item.media_type === "video" ? (
                                            <video controls src={item.media_url} className="w-full rounded-3xl bg-black" />
                                        ) : (
                                            <a
                                                href={item.media_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lime-300 underline hover:text-white"
                                            >
                                                {item.media_url}
                                            </a>
                                        )}
                                    </div>
                                ) : null}

                                {item.authorHandle && (
                                    <div className="mt-6 font-mono text-[10px] text-gray-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                        Posted by: <span className="text-lime-400/80">{item.authorHandle}</span>
                                    </div>
                                )}
                            </motion.article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
