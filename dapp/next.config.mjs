const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.arweave.net",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: [
    "wallet-adapter-react",
    "wallet-adapter-plugin",
  ],
  assetPrefix: "",
  basePath: "",
  webpack: (config) => {
    config.resolve.fallback = { "@solana/web3.js": false };
    return config;
  },
};

export default nextConfig;
