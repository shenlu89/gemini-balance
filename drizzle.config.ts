import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'libsql',
  dbCredentials: {
    url: `${process.env.TURSO_DATABASE_URL!}?authToken=${process.env.TURSO_AUTH_TOKEN!}`,
  },
} satisfies Config