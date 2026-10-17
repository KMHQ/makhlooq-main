"use client";

import Image from "next/image";
import { getImageProps, IMAGE_SIZES } from "../../lib/imageOptimization";

/**
 * ▸ OPTIMIZED BACKGROUND IMAGE COMPONENT
 * Performance: Lazy-loads background images with blur placeholder
 * Accessibility: Includes alt text and proper semantic HTML
 */
export default function OptimizedBackground({ src, alt, children, priority = false, quality = 75 }) {
    return (
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
            {/* ▸ BACKGROUND IMAGE - Lazy loaded with blur placeholder */}
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                quality={quality}
                sizes={IMAGE_SIZES.background}
                loading={priority ? "eager" : "lazy"}
                style={{
                    objectFit: "cover",
                    objectPosition: "center",
                }}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
            />

            {/* ▸ OVERLAY - Optional overlay gradient for text readability */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
                    pointerEvents: "none",
                }}
            />

            {/* ▸ CONTENT - Children render on top of background */}
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </div>
    );
}

/**
 * ▸ OPTIMIZED HERO IMAGE COMPONENT
 * Performance: Priority load with high quality
 * Improves: LCP (Largest Contentful Paint)
 */
export function HeroImage({ src, alt, width = 1920, height = 1080 }) {
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority
            quality={90}
            sizes="100vw"
            loading="eager"
            style={{
                width: "100%",
                height: "auto",
            }}
        />
    );
}

/**
 * ▸ OPTIMIZED CARD IMAGE COMPONENT
 * Performance: Lazy-loaded thumbnail with medium blur
 */
export function CardImage({ src, alt, width = 400, height = 300 }) {
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            quality={80}
            sizes={IMAGE_SIZES.card}
            style={{
                width: "100%",
                height: "auto",
            }}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23222' width='400' height='300'/%3E%3C/svg%3E"
        />
    );
}
