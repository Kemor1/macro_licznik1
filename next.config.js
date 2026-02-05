/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Ostrzeżenie: To pozwala na wdrożenie produkcyjne, nawet jeśli
      // projekt ma błędy ESLint.
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Ostrzeżenie: To pozwala na wdrożenie produkcyjne, nawet jeśli
      // projekt ma błędy TypeScript.
      ignoreBuildErrors: true,
    },
  };
  
  module.exports = nextConfig;