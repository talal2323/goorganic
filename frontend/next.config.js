/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Turbopack configuration
    turbopack: {
        root: process.cwd(),
    },
    // Optimize images
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },
    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Performance optimizations
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['@heroicons/react'],
    },
    async rewrites() {
        return {
            beforeFiles: [
                // Proxy API requests to backend
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:5000/api/:path*',
                },
            ],
            // Removed afterFiles that was breaking App Router
        }
    },
}

module.exports = nextConfig
