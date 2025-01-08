/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:false,
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*', // Replace with your Socket.IO server URL
      },
    ];
  },
};

export default nextConfig;
