import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import PayloadRefresh from "@/src/components/PayloadRefresh";

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
    fallback: ["monospace"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
    fallback: ["sans-serif"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kmhq.org";

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Khalai Makhlooq",
    alternateName: "KMHQ",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Star Citizen crew with big ships, clean ops, and full KMHQ vibe.",
};

const title = "KHALAI MAKHLOOQ — Elite Star Citizen Organization";
const description =
    "Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination when the scene gets spicy.";

// Defaults for every page; the CMS-driven pages override these with their own Payload SEO fields.
export const metadata: Metadata = {
    title,
    description,
    keywords: ["Star Citizen", "Organization", "KMHQ", "Khalai Makhlooq", "Gaming Community"],
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    openGraph: {
        title,
        description,
        url: SITE_URL,
        type: "website",
        siteName: "Khalai Makhlooq",
        locale: "en_US",
        images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Khalai Makhlooq - Star Citizen Crew", type: "image/jpeg" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image.jpg"], creator: "@makhlooq" },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    icons: {
        icon: [{ url: "/favicon.ico" }, { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
            <body>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

                {/* The deploy is built locally, so expose the runtime server URL to Payload live preview. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.__SERVER_URL__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org")};`,
                    }}
                />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://cdn.discordapp.com" />

                <PayloadRefresh />
                {children}
            </body>
        </html>
    );
}
