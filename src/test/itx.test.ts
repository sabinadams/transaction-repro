import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { it, expect, beforeEach } from "vitest";
import { arrayItx } from "../index";

beforeEach(async () => {
  console.log("♻️ Resetting database");
  await prisma.test.deleteMany();
});

it("Retry middleware does not violate transactions in itx form", async () => {
  const count = await arrayItx();
  expect(count).toEqual(0); // passees
});
