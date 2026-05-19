/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Three.js ships ES modules; transpiling avoids occasional resolution edge cases.
  transpilePackages: ["three"],
  experimental: {
    // Slightly faster builds; safe with our component structure.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
