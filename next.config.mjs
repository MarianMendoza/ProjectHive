/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*', // Replace with your Socket.IO server URL
      },
    ];
  },
  async headers() {
    return [
      {
        // Match all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store,no-cache, must-revalidate', // Disable caching
          },
        ],
      },
    ];
  },
};

export default nextConfig;
