"use client";
import { MSpaint as DrawingCanvas } from "../ui/ms-paint";

export function MSpaintDemo() {
    return (
        <div className="w-full flex flex-col items-center py-16 px-4 space-y-10">
            <div className="text-center space-y-3">
                <h2 className="text-4xl font-bold text-white tracking-tight">Drawing Board</h2>
                <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">Classic collaborative drawing environment.</p>
            </div>

            <div className="w-full max-w-6xl mx-auto overflow-hidden relative border border-white/5 rounded-[2.5rem] bg-[#111] p-4 sm:p-8">
                <DrawingCanvas
                    title="My Drawing App"
                    menuItems={["File", "Edit", "Tools", "Help"]}
                    width="100%"
                    height="75vh"
                    className="min-h-[400px] max-h-[800px]"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl mt-4">
                {[
                    { label: "Sync Status", value: "Active", icon: "01" },
                    { label: "Latency", value: "14ms", icon: "02" },
                    { label: "Encryption", value: "AES-256", icon: "03" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.05] transition-colors"
                    >
                        <div className="space-y-1">
                            <p className="text-[10px] text-white/20 font-bold tracking-[0.2em] uppercase">{stat.label}</p>
                            <p className="text-sm text-white/80 font-bold tracking-tight">{stat.value}</p>
                        </div>
                        <div className="text-2xl font-black text-white/[0.02] transition-colors group-hover:text-white/5">{stat.icon}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
