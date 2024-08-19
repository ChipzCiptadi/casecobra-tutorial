/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: "use-credentials",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
