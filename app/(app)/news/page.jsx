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
  return <NewsPageClient newsPosts={newsPosts} siteSettings={siteSettings} />;
}
