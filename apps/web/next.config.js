/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'storage.googleapis.com', 's3.amazonaws.com'],
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
        ],
    },
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
