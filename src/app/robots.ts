import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adisionads.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/waitlist'],
        disallow: ['/admin/', '/advertiser/', '/partner/', '/api/', '/login', '/signup', '/r/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/pricing', '/waitlist'],
        disallow: ['/admin/', '/advertiser/', '/partner/', '/api/', '/login', '/signup', '/r/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
