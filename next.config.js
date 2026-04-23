/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.BASE_PATH || "/ChatVRM/",
  basePath: process.env.BASE_PATH || "/ChatVRM",
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || "/ChatVRM",
  },
  output: "export",
  images: {
    unoptimized: true,
    domains: ["vroid-hub.pximg.net"],
  },
};

module.exports = nextConfig;
