import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ConditionalStudioWrapper from '@/components/ConditionalStudioWrapper';
import PayloadRefresh from '@/components/PayloadRefresh';

// ▸ FONT OPTIMIZATION (Performance: Prevents layout shift)
// display: 'swap' shows fallback font immediately, then swaps to custom font (avoids FOUT)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap', // Prevents Cumulative Layout Shift (CLS)
  preload: true,
  fallback: ['monospace'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap', // Prevents Cumulative Layout Shift (CLS)
  preload: true,
  fallback: ['sans-serif'],
});

// ▸ STRUCTURED DATA (SEO: +5 points)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kmhq.org';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Khalai Makhlooq',
  alternateName: 'KMHQ',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Star Citizen crew with big ships, clean ops, and full KMHQ vibe.',
  sameAs: ['https://discord.gg/example'], // Add your Discord/social links
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Community',
    url: SITE_URL,
  },
};

export const metadata = {
  // ▸ CORE SEO
  title: 'KHALAI MAKHLOOQ — Elite Star Citizen Organization',
  description: 'Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination when the scene gets spicy.',
  keywords: ['Star Citizen', 'Organization', 'KMHQ', 'Khalai Makhlooq', 'Gaming Community'],
  
  metadataBase: new URL(SITE_URL),
  canonical: SITE_URL,

  // ▸ OG TAGS (Social Media & Crawlers)
  openGraph: {
    title: 'KHALAI MAKHLOOQ — Elite Star Citizen Organization',
    description: 'Star Citizen crew [KMHQ]. Hangar is open.',
    url: SITE_URL,
    type: 'website',
    siteName: 'Khalai Makhlooq',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Khalai Makhlooq - Star Citizen Crew',
        type: 'image/jpeg',
      },
    ],
  },

  // ▸ TWITTER CARD (Social Media)
  twitter: {
    card: 'summary_large_image',
    title: 'KHALAI MAKHLOOQ — Elite Star Citizen Organization',
    description: 'Star Citizen crew [KMHQ]',
    images: ['/opengraph-image.jpg'],
    creator: '@makhlooq', // Update with your Twitter handle
  },

  // ▸ SEO CRAWLING
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ▸ MANIFEST & ICONS
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',

  // ▸ VERIFICATION (For Google Search Console, etc.)
  verification: {
    // google: 'google-site-verification-code',
    // Add your verification codes here
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* ▸ PRECONNECT TO EXTERNAL DOMAINS (Performance: DNS lookup speedup) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://cdn.discordapp.com" />

        {/* ▸ CANONICAL URL (SEO: Prevents duplicate content) */}
        <link rel="canonical" href={SITE_URL} />

        {/* ▸ ALTERNATE LINKS (SEO: Multi-language support if needed) */}
        <link rel="alternate" hrefLang="en" href={SITE_URL} />

        {/* ▸ SITEMAP (SEO: Crawlability) */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {/* ▸ FAVICON */}
        <link rel="icon" href="/favicon.ico" />

        {/* ▸ STRUCTURED DATA (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* ▸ RUNTIME ENVIRONMENT VARIABLES INJECTION FOR PAYLOAD LIVE PREVIEW */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SERVER_URL__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SERVER_URL || 'https://kmhq.org')};
            `,
          }}
        />
      </head>
      <body>
        <PayloadRefresh />
        <ConditionalStudioWrapper>
        </ConditionalStudioWrapper>
        {children}
      </body>
    </html>
  );
}
