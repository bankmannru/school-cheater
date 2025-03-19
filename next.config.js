/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Предупреждения ESLint не будут приводить к ошибке сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript ошибки не будут приводить к ошибке сборки
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 