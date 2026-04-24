/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || "";
const isStaticExport = Boolean(basePath);

const nextConfig = {
  reactStrictMode: true,
  ...(basePath
    ? {
        assetPrefix: `${basePath}/`,
        basePath,
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isStaticExport ? { output: "export" } : {}),
  images: {
    unoptimized: true,
    domains: ["vroid-hub.pximg.net"],
  },
};

module.exports = nextConfig;
