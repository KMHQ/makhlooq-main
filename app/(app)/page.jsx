import { getPayloadInstance } from '../../lib/payload'
import HomePageClient from './HomePageClient'

export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    const payload = await getPayloadInstance();
    const [pageData, siteSettings] = await Promise.all([
      payload.findGlobal({ slug: 'home-page' }),
      payload.findGlobal({ slug: 'site-settings' }),
    ]);
    return { ...pageData, siteSettings };
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const data = await getHomePageData()
  
  const defaultTitle = 'KHALAI MAKHLOOQ — Elite Star Citizen Organization'
  const defaultDesc = 'Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination.'

  const title = data?.seo?.title?.trim() ? data.seo.title.trim() : defaultTitle
  const description = data?.seo?.description?.trim() ? data.seo.description.trim() : defaultDesc

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data?.seo?.imageUrl ? [{ url: data.seo.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data?.seo?.imageUrl ? [data.seo.imageUrl] : [],
    },
  }
}

export default async function Page() {
  const data = await getHomePageData()
  
  return <HomePageClient data={data} />
}
