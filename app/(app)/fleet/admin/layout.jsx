/**
 * ▸ FLEET ADMIN PAGE METADATA & LAYOUT
 * SEO: Admin page - private content (noindex)
 */

export const metadata = {
    robots: {
        index: false, // Don't index admin pages
        follow: false,
    },
};

export default function FleetAdminLayout({ children }) {
    return <>{children}</>;
}
