import { Prisma } from "@prisma/client";
const MAX_ATTEMPTS = 3;
const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

export const retryMiddleware = async (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<unknown>
) => {
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    try {
      if (params.args.data.foo != null) {
        params.args.data.foo = `Attempt ${i}`;
      }
      console.log(
        `🔁 Attempt ${i} of ${MAX_ATTEMPTS} with name ${params.args.data.foo}`
      );
      return await next(params);
    } catch (e) {
      console.log("Failed");
      if (i === MAX_ATTEMPTS) {
        throw e;
      }
      await sleep(100);
    }
  }
};
