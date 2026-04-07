import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DMap - Bản Đồ Vì Cộng Đồng',
    short_name: 'DMap',
    description: 'Bản đồ tiếp cận cho người khuyết tật tại Việt Nam',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b57d0',
    icons: [
      {
        src: '/globe.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
