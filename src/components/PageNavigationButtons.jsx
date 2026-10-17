import Link from "next/link";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/team", label: "Team" },
    { href: "/fleet", label: "Fleet" },
    { href: "/news", label: "News" },
];

export default function PageNavigationButtons({ current }) {
    return (
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap justify-center gap-3">
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                        link.href === current
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 cursor-not-allowed"
                            : "border-white/10 bg-white/5 text-white hover:border-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300"
                    }`}
                    aria-current={link.href === current ? "page" : undefined}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}
