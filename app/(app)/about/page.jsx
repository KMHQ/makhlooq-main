import { getPayloadInstance } from '../../../lib/payload'
import AboutPageClient from './AboutPageClient'

export const dynamic = 'force-dynamic';

async function getAboutPageData() {
  try {
    const payload = await getPayloadInstance();
    const [pageData, siteSettings] = await Promise.all([
      payload.findGlobal({ slug: 'about-page' }),
      payload.findGlobal({ slug: 'site-settings' }),
    ]);
    return { ...pageData, siteSettings };
  } catch {
    return null;
  }
}

async function getNewsPosts() {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'news-posts',
      sort: '-publishedAt',
    })
    return result.docs
  } catch {
    return []
  }
}

export async function generateMetadata() {
  const data = await getAboutPageData()
  
  const defaultTitle = 'About | KHALAI MAKHLOOQ — Elite Star Citizen Organization'
  const defaultDesc = 'Learn about KMHQ, our mission, and our divisions.'

  let title = data?.seo?.title?.trim() || defaultTitle;
  if (title === 'Untitled') title = defaultTitle;
  
  let description = data?.seo?.description?.trim() || defaultDesc;
  if (description === 'Untitled') description = defaultDesc;

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
  const data = await getAboutPageData()
  const newsPosts = await getNewsPosts()
  
  return <AboutPageClient data={data} newsPosts={newsPosts} />
}
