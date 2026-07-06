import { getPayloadInstance } from '../../../lib/payload';
import NewsPageClient from './NewsPageClient';

export const dynamic = 'force-dynamic';

async function getNewsPageData() {
  try {
    const payload = await getPayloadInstance();
    const [newsPosts, siteSettings] = await Promise.all([
      payload.find({
        collection: 'news-posts',
        sort: '-publishedAt',
        limit: 100,
      }),
      payload.findGlobal({ slug: 'site-settings' }),
    ]);
    return {
      newsPosts: newsPosts.docs || [],
      siteSettings,
    };
  } catch (error) {
    console.error('Failed to fetch news page data:', error);
    return {
      newsPosts: [],
      siteSettings: null,
    };
  }
}

export async function generateMetadata() {
  const defaultTitle = 'News & Intel | KHALAI MAKHLOOQ — Elite Star Citizen Organization';
  const defaultDesc = 'Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command.';

  return {
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      images: [{ url: '/opengraph-image.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDesc,
      images: ['/opengraph-image.jpg'],
    },
  };
}

export default async function Page() {
  const { newsPosts, siteSettings } = await getNewsPageData();

  // Determine critical images to preload (default background + first few cover images)
  const preloadUrls = ['/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg'];
  newsPosts.forEach((post) => {
    const url = post.coverImage?.url || post.coverImage?.asset?.url || (post.media_type === 'image' ? post.media_url : null);
    if (url && preloadUrls.length < 8) {
      preloadUrls.push(url);
    }
  });

  return (
    <>
      {preloadUrls.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      <NewsPageClient newsPosts={newsPosts} siteSettings={siteSettings} />
    </>
  );
}
