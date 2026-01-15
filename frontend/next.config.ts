import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'api.dicebear.com',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
		],
		localPatterns: [
			{
				pathname: '/posts/**',
			},
		],
	},
};

export default nextConfig;
