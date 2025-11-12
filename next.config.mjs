/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'lib', 'components']
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

export default nextConfig;
