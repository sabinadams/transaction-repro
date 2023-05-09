import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { it, expect, beforeEach } from "vitest";
import { arrayTrans } from "../index";

beforeEach(async () => {
  console.log("♻️ Resetting database");
  await prisma.test.deleteMany();
});

it("Retry middleware violates transactions in array form", async () => {
  const count = await arrayTrans();
  expect(count).toEqual(0); // fails
});
