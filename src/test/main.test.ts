import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { it, expect, beforeEach, describe } from "vitest";
import * as mwf from "../index.middleware";
import * as exf from "../index.extension";

beforeEach(async () => {
  console.log("♻️ Resetting database");
  await prisma.test.deleteMany();
});

describe("Middleware", () => {
  it("Retry middleware violates transactions in array form", async () => {
    const count = await mwf.arrayTrans();
    expect(count).toEqual(0); // fails
  });

  it("Retry middleware does not violate transactions in itx form", async () => {
    const count = await mwf.arrayItx();
    expect(count).toEqual(0); // passees
  });
});

describe("Extension", () => {
  it("Retry extension violates transactions in array form", async () => {
    const count = await exf.arrayTrans();
    expect(count).toEqual(0); // fails
  });

  it("Retry extension does not violate transactions in itx form", async () => {
    const count = await exf.arrayItx();
    expect(count).toEqual(0); // passees
  });
});
