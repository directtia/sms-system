/** @type {import('next').NextConfig} */
// Force rebuild - fixes Supabase type errors
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
