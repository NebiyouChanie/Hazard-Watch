/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['tile.openstreetmap.org'],
    },
    // Required for Leaflet
    webpack: (config) => {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
      return config
    }
  }
  
  export default nextConfig
