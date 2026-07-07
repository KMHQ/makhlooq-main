import { getPayloadInstance } from '../../../lib/payload';
import NewsPageClient from './NewsPageClient';

export const dynamic = 'force-dynamic';

async function getNewsPageData() {
  try {
    const payload = await getPayloadInstance();
    const [newsPosts, siteSettings, newsPage] = await Promise.all([
      payload.find({
        collection: 'news-posts',
        sort: '-publishedAt',
        limit: 100,
        depth: 3,
      }),
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'news-page' }),
    ]);
    return {
      newsPosts: newsPosts.docs || [],
      siteSettings,
      newsPage,
    };
  } catch (error) {
    console.error('Failed to fetch news page data:', error);
    return {
      newsPosts: [],
      siteSettings: null,
      newsPage: null,
    };
  }
}

export async function generateMetadata() {
  let newsPage = null;
  try {
    const payload = await getPayloadInstance();
    newsPage = await payload.findGlobal({ slug: 'news-page' });
  } catch (e) {
    console.error("Error fetching news page settings for metadata:", e);
  }

  const title = newsPage?.seo?.title?.trim() && newsPage.seo.title !== 'Untitled' 
    ? newsPage.seo.title.trim() 
    : 'News & Intel | KHALAI MAKHLOOQ — Elite Star Citizen Organization';
    
  const description = newsPage?.seo?.description?.trim() && newsPage.seo.description !== 'Untitled' 
    ? newsPage.seo.description.trim() 
    : 'Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command.';
    
  const imageUrl = newsPage?.seo?.imageUrl?.trim() || '/opengraph-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page() {
  const { newsPosts, siteSettings, newsPage } = await getNewsPageData();

  // Determine critical images to preload (default background + first few cover images)
  const preloadUrls = [newsPage?.hero?.backgroundImage || '/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg'];
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
      <NewsPageClient 
        newsPosts={newsPosts} 
        siteSettings={siteSettings} 
        newsPage={newsPage}
      />
    </>
  );
}
