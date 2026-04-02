import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cni.co.uk';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  ['/account', '/checkout', '/admin'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
