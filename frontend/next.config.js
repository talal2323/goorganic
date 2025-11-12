/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return {
            beforeFiles: [
                // Proxy API requests to backend
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:5000/api/:path*',
                },
            ],
            afterFiles: [
                // Rewrite all other routes to the root page for client-side routing
                {
                    source: '/:path*',
                    destination: '/',
                },
            ],
        }
    },
}

module.exports = nextConfig
