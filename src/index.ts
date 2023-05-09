import { PrismaClient } from "@prisma/client";
import { retryMiddleware } from "./middleware";
const prisma = new PrismaClient();
const prismaWithRetry = new PrismaClient();

prismaWithRetry.$use(retryMiddleware);

export const arrayTrans = async () => {
  try {
    await prismaWithRetry.$transaction([
      prismaWithRetry.test.create({ data: { foo: "hello" } }),
      prismaWithRetry.test.create({ data: { foo: null } }),
    ]);
  } catch (e) {
    /* noop */
  }
  console.table(await prisma.test.findMany());
  return await prisma.test.count();
};

export const arrayItx = async () => {
  try {
    await prismaWithRetry.$transaction(async (tx) => {
      await tx.test.create({ data: { foo: "hello" } });
      await tx.test.create({ data: { foo: null } });
    });
  } catch (e) {
    /* noop */
  }
  console.table(await prisma.test.findMany());
  return await prisma.test.count();
};
