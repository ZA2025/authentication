/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
        { protocol: 'https', hostname: 'fakestoreapi.com', pathname: '/**' },
        { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
      ],
    },
  
    async headers() {
      return [
        {
          source: '/(.*)', // applies to all routes
          headers: [
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
                connect-src 'self' https://api.stripe.com;
                frame-src https://js.stripe.com https://hooks.stripe.com;
                img-src 'self' data: https://*.stripe.com;
                style-src 'self' 'unsafe-inline';
                object-src 'none';
              `.replace(/\s{2,}/g, ' ').trim(),
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  