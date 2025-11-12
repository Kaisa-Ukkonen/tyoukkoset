// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// 🔹 Luodaan globaali tyyppi, johon voidaan tallentaa Prisma-instanssi
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🔹 Käytetään olemassa olevaa Prisma-instanssia, jos sellainen on
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error", "warn"], // vähemmän lokia tuotannossa
  });

// 🔹 Kehitystilassa tallennetaan Prisma global-muistiin (säilyy hot reloadissa)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
