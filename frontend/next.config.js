/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: function (config, options) {
    config.experiments = { asyncWebAssembly: true };
    return config;
  }
}

module.exports = nextConfig
