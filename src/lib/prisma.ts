import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL
if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
  throw new Error(
    "DATABASE_URL não está definida. Defina em .env ou no ambiente (ex.: postgres://user:senha@localhost:5432/db).",
  )
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
