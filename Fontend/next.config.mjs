/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bật TypeScript checking nghiêm ngặt để phát hiện lỗi sớm
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
