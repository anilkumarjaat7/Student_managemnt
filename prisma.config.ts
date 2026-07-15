import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // .env may not exist; ignore
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
