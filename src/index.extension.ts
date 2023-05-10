import { PrismaClient } from "@prisma/client";
import retryExtension from "./extension";
const prisma = new PrismaClient();
const xprisma = prisma.$extends(retryExtension);
export const arrayTrans = async () => {
  try {
    await xprisma.$transaction([
      xprisma.test.create({ data: { foo: "hello" } }),
      xprisma.test.create({ data: { foo: null } }),
    ]);
  } catch (e) {
    /* noop */
  }
  console.table(await xprisma.test.findMany());
  return await xprisma.test.count();
};

export const arrayItx = async () => {
  try {
    await xprisma.$transaction(async (tx) => {
      await tx.test.create({ data: { foo: "hello" } });
      await tx.test.create({ data: { foo: null } });
    });
  } catch (e) {
    /* noop */
  }
  console.table(await xprisma.test.findMany());
  return await xprisma.test.count();
};
