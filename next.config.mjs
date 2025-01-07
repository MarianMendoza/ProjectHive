/** @type {import('next').NextConfig} */
import { createServer } from 'http';
import express from 'express';

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      import('./server').then(() => {
        console.log('Server imported successfully');
      }).catch(err => {
        console.error('Failed to import server:', err);
      });
    }
    return config;
  },
};

export default nextConfig;
