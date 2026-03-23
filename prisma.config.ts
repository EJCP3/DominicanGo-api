import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma v7 Configuration
 * DATABASE_URL should be defined in your .env file.
 * During `prisma generate`, the URL is optional (schema is read for types only).
 */
export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://placeholder:placeholder@localhost:5432/dominicango',
  },
});
