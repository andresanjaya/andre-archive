/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;
