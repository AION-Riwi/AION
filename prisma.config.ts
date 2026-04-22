import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Usa aquí tu enlace directo temporalmente o de forma definitiva para desarrollo
    // Asegúrate de que en tu .env la variable DIRECT_URL tenga el puerto 5432 en lugar del 6543
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
