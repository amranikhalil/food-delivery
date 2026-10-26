/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Dish photos uploaded from the dashboard (Cloudinary) or pasted links
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
  },
};

module.exports = nextConfig;
