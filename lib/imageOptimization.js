/**
 * ▸ IMAGE OPTIMIZATION UTILITIES
 * Performance: Ensures all images are optimized for LCP (Largest Contentful Paint)
 *
 * Guidelines:
 * 1. Use `priority={true}` ONLY for above-the-fold images (Hero, Header)
 * 2. Use `loading="lazy"` for below-fold images (default, but explicit is better)
 * 3. Always include `width`, `height`, `alt`, and `sizes` attributes
 * 4. Provide blur placeholder for images without instant loading
 * 5. Use `fill` prop only for background images with proper aspect ratio
 */

// ▸ RESPONSIVE IMAGE SIZES CONFIGURATION
export const IMAGE_SIZES = {
    // Hero & header images (full width)
    hero: "100vw",

    // Large sections (full width)
    full: "(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, 1200px",

    // Standard sections
    section: "(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1100px",

    // Cards & components
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",

    // Thumbnails
    thumb: "(max-width: 640px) 150px, 200px",

    // Mobile-first (backgrounds)
    background: "(max-width: 768px) 100vw, (max-width: 1920px) 100vw, 1920px",
};

// ▸ DEVICE SIZES FOR SRCSET GENERATION (in pixels)
// Next.js automatically generates srcset at these sizes for responsive loading
export const RESPONSIVE_DEVICE_SIZES = [
    320, // Mobile small
    375, // Mobile
    425, // Mobile large
    640, // Tablet small
    768, // Tablet
    1024, // Tablet large / Small laptop
    1280, // Laptop
    1536, // Large laptop
    1920, // Desktop
    2560, // 4K
];

// ▸ BLUR PLACEHOLDER CONFIGURATION
// Blur placeholders improve perceived performance (CLS prevention)
export const BLUR_CONFIGS = {
    // Low blur for crisp images (better for logos, text)
    low: {
        blurDataURL:
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"%3E%3Crect fill="%23000" width="1200" height="630"/%3E%3C/svg%3E',
        placeholder: "blur",
    },

    // Medium blur for standard images
    medium: {
        blurDataURL:
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"%3E%3Cfilter id="blur"%3E%3CfeGaussianBlur in="SourceGraphic" stdDeviation="10"/%3E%3C/filter%3E%3Crect fill="%23111" width="1200" height="630" filter="url(%23blur)"/%3E%3C/svg%3E',
        placeholder: "blur",
    },

    // High blur for background images (performance: faster rendering)
    high: {
        blurDataURL:
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"%3E%3Crect fill="%23222" width="1200" height="630"/%3E%3C/svg%3E',
        placeholder: "blur",
    },
};

// ▸ IMAGE OPTIMIZATION PROFILES
// Use these as templates for different image types
export const IMAGE_PROFILES = {
    // Hero banner: Critical, above-the-fold
    hero: {
        priority: true,
        quality: 90,
        sizes: IMAGE_SIZES.hero,
        loading: "eager",
        ...BLUR_CONFIGS.low,
    },

    // Header logo: Critical, always visible
    logo: {
        priority: true,
        quality: 95,
        sizes: IMAGE_SIZES.thumb,
        loading: "eager",
    },

    // Section backgrounds: Important but not critical
    background: {
        priority: false,
        quality: 75,
        sizes: IMAGE_SIZES.background,
        loading: "lazy",
        ...BLUR_CONFIGS.high,
    },

    // Standard content images: Standard optimization
    content: {
        priority: false,
        quality: 85,
        sizes: IMAGE_SIZES.section,
        loading: "lazy",
        ...BLUR_CONFIGS.medium,
    },

    // Card images: Smaller, batch loaded
    card: {
        priority: false,
        quality: 80,
        sizes: IMAGE_SIZES.card,
        loading: "lazy",
        ...BLUR_CONFIGS.medium,
    },

    // Thumbnails: Smallest, lowest priority
    thumbnail: {
        priority: false,
        quality: 70,
        sizes: IMAGE_SIZES.thumb,
        loading: "lazy",
        ...BLUR_CONFIGS.high,
    },
};

/**
 * ▸ HELPER FUNCTION: Get optimized image props
 * Usage: <Image {...getImageProps('hero', 1200, 630)} src="/image.jpg" alt="..." />
 */
export function getImageProps(profileName, width, height) {
    const profile = IMAGE_PROFILES[profileName] || IMAGE_PROFILES.content;
    return {
        width,
        height,
        ...profile,
    };
}

/**
 * ▸ HELPER FUNCTION: Create srcSet for manual optimization
 * For cases where Next.js Image component can't be used
 */
export function createSrcSet(basePath, ext = "webp") {
    return RESPONSIVE_DEVICE_SIZES.map((size) => {
        // Example: /images/bg.webp -> /images/bg-640w.webp
        const [path, filename] = basePath.split(/(?=[^/]*$)/);
        const [name] = filename.split(".");
        return `${path}${name}-${size}w.${ext} ${size}w`;
    }).join(", ");
}

/**
 * ▸ BEST PRACTICES SUMMARY
 *
 * 1. ALWAYS USE NEXT/IMAGE COMPONENT
 *    ❌ <img src="/images/bg.jpg" />
 *    ✅ <Image src="/images/bg.jpg" alt="..." width={1200} height={630} />
 *
 * 2. PRIORITY IMAGES (Above-the-fold, block FCP)
 *    - Hero images: priority={true}
 *    - Header elements: priority={true}
 *    - Below-fold: priority={false} or omit
 *
 * 3. ALWAYS INCLUDE SIZES ATTRIBUTE
 *    - Tells browser optimal size for viewport
 *    - Prevents oversized downloads on mobile
 *    - Critical for responsive images
 *
 * 4. USE QUALITY ATTRIBUTE STRATEGICALLY
 *    - Hero images: 90-95 (users see first)
 *    - Content: 75-85 (normal viewing)
 *    - Thumbnails: 60-70 (small size)
 *
 * 5. LAZY LOAD NON-CRITICAL IMAGES
 *    <Image
 *      src="/backgrounds/image.jpg"
 *      alt="Background"
 *      width={1920}
 *      height={1080}
 *      loading="lazy"
 *      sizes="100vw"
 *      quality={75}
 *    />
 *
 * 6. PROVIDE BLUR PLACEHOLDER FOR BETTER UX
 *    - Reduces Cumulative Layout Shift (CLS)
 *    - Improves perceived performance
 *    - Use low blur for text/logos, high for backgrounds
 *
 * 7. RESPONSIVE IMAGES WITH FILL
 *    - For background images or when size is dynamic
 *    - MUST wrap container in: style={{ position: 'relative' }}
 *    - Use: <Image fill sizes="100vw" ... />
 */

// ▸ CONVERSION GUIDE: RAW IMG TAGS TO NEXT/IMAGE
export const CONVERSION_EXAMPLES = {
    // Hero background
    before: `<img src="/backgrounds/hero.jpg" style={{ width: '100%' }} />`,
    after: `<Image
    src="/backgrounds/hero.jpg"
    alt="Hero background"
    width={1920}
    height={1080}
    priority
    sizes="100vw"
    quality={90}
    loading="eager"
  />`,

    // Below-fold background with lazy loading
    before2: `<img src="/backgrounds/section.jpg" className="w-full" />`,
    after2: `<Image
    src="/backgrounds/section.jpg"
    alt="Section background"
    width={1920}
    height={1080}
    loading="lazy"
    sizes="(max-width: 768px) 100vw, 1920px"
    quality={75}
    placeholder="blur"
  />`,
};
