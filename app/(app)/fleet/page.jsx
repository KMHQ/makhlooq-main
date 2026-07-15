import { getPayloadInstance } from '../../../lib/payload'
import nextDynamic from 'next/dynamic'

const FleetPageClient = nextDynamic(() => import('./FleetPageClient'), {
  ssr: true,
})

export const dynamic = 'force-dynamic';

async function getFleetPageData() {
  try {
    const payload = await getPayloadInstance();
    const [pageData, siteSettings] = await Promise.all([
      payload.findGlobal({ slug: 'fleet-page' }),
      payload.findGlobal({ slug: 'site-settings' }),
    ]);
    return { ...pageData, siteSettings };
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const data = await getFleetPageData()
  
  const defaultTitle = 'Fleet | KHALAI MAKHLOOQ — Elite Star Citizen Organization'
  const defaultDesc = 'Explore the KMHQ fleet.'

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
  const data = await getFleetPageData()
  
  return <FleetPageClient data={data} />
}
