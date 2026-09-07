import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adision — Community Ad Marketplace',
    short_name: 'Adision',
    description: 'Run targeted ads across verified WhatsApp groups and channels.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#090d16',
    theme_color: '#8fc822',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
