import { withPayload } from "@payloadcms/next/withPayload";

const FLEETYARDS = "fleetyards.net api.fleetyards.net storage.fltyrd.net";

const siteCsp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' ${FLEETYARDS}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob: https: ${FLEETYARDS}`,
    "font-src 'self' data: fonts.googleapis.com fonts.gstatic.com",
    `connect-src 'self' data: blob: *.discordapp.com ${FLEETYARDS}`,
    "frame-src 'self' fleetyards.net",
    `media-src 'self' data: blob: https: ${FLEETYARDS}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
].join("; ");

// Payload's admin UI needs eval and broader connect/img access.
const adminCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: fonts.googleapis.com fonts.gstatic.com",
    "connect-src 'self' data: blob:",
    "frame-src 'self'",
    "media-src 'self' data: blob: https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
].join("; ");

const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    poweredByHeader: false,
    // Webpack can't concatenate Payload's ESM og route with Next's CJS `next/og` ("Cannot get final name for export 'ImageResponse'").
    webpack(config, { isServer }) {
        if (isServer) config.optimization.concatenateModules = false;
        return config;
    },
    images: {
        // Keep in sync with OPTIMIZED_HOSTS in app/lib/media.ts.
        remotePatterns: [
            { protocol: "https", hostname: "cdn.discordapp.com" },
            { protocol: "https", hostname: "api.fleetyards.net" },
            { protocol: "https", hostname: "fleetyards.net" },
            { protocol: "https", hostname: "storage.fltyrd.net" },
        ],
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            // Separate sources so /admin gets exactly one CSP; two CSP headers would both be enforced.
            { source: "/((?!admin).*)", headers: [{ key: "Content-Security-Policy", value: siteCsp }] },
            { source: "/admin/:path*", headers: [{ key: "Content-Security-Policy", value: adminCsp }] },
        ];
    },
};

export default withPayload(nextConfig);
