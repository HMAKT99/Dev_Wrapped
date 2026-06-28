/** @type {import('next').NextConfig} */
const nextConfig = {
  // The wrapped route + image routes read themes/*.css and templates/base.html
  // from the filesystem at runtime. Ensure those files are bundled into the
  // serverless functions on Vercel.
  experimental: {
    outputFileTracingIncludes: {
      "/api/wrapped/**": ["./themes/**", "./templates/**"],
      "/u/**": ["./themes/**", "./templates/**"],
    },
  },
};

export default nextConfig;
