import { Prisma, PrismaClient } from "@prisma/client";

const logOptions: Prisma.LogLevel[] = process.env.DEBUG
  ? ["query", "error"]
  : ["error"];

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: logOptions,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
