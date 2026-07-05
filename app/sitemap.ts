import { MetadataRoute } from 'next';

/**
 * ▸ SITEMAP.XML CONFIGURATION
 * SEO: Tells search engines about all pages, their update frequency, and priority
 * Improves: Crawlability, indexation speed, SEO score (+5-10 points)
 * 
 * Documentation: https://www.sitemaps.org/
 */

interface TeamMember {
  username: string;
  lastUpdated: string;
}

// ▸ FETCH DYNAMIC ROUTES (Team members from Supabase/Database)
async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    // Example: Replace with actual Supabase fetch if needed
    // const { data } = await supabase.from('team_members').select('username, updated_at');
    // return data || [];

    // For now, return example members (update this when you have dynamic data)
    return [
      { username: 'commander', lastUpdated: new Date().toISOString() },
      { username: 'admiral', lastUpdated: new Date().toISOString() },
      { username: 'captain', lastUpdated: new Date().toISOString() },
    ];
  } catch (error) {
    console.error('Failed to fetch team members for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kmhq.org';
  const lastModified = new Date();

  // ▸ FETCH DYNAMIC TEAM MEMBERS
  const teamMembers = await getTeamMembers();

  // ▸ STATIC ROUTES (Always present)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0, // Highest priority - homepage
    },
    {
      url: `${baseUrl}/news`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fleet`,
      lastModified,
      changeFrequency: 'weekly', // Fleet info updates regularly
      priority: 0.9, // High priority
    },
    {
      url: `${baseUrl}/team`,
      lastModified,
      changeFrequency: 'weekly', // Team roster updates
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team/profile`,
      lastModified,
      changeFrequency: 'monthly', // Profile page updates less frequently
      priority: 0.7,
    },
  ];

  // ▸ DYNAMIC ROUTES (Team member profiles)
  const dynamicRoutes: MetadataRoute.Sitemap = teamMembers.map((member) => ({
    url: `${baseUrl}/team/${member.username}`,
    lastModified: new Date(member.lastUpdated),
    changeFrequency: 'monthly' as const,
    priority: 0.8, // Medium-high priority
  }));

  // ▸ RETURN COMBINED SITEMAP
  return [...staticRoutes, ...dynamicRoutes];
}
