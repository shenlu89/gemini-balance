/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ['@libsql/client'],
  env: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  }
}

module.exports = nextConfig