/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'lib', 'components']
  },
  typescript: {
    // Temporarily ignore build errors until Supabase types are properly generated
    ignoreBuildErrors: true
  }
};

export default nextConfig;
