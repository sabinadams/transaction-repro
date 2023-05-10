import { Prisma } from "@prisma/client";
const MAX_ATTEMPTS = 3;
const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

export default Prisma.defineExtension((prisma) =>
  prisma.$extends({
    model: {
      test: {
        create: async (...args: any) => {
          for (let i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
              if (args.data.foo != null) {
                args.data.foo = `Attempt ${i}`;
              }
              console.log(
                `🔁 Attempt ${i} of ${MAX_ATTEMPTS} with name ${args.data.foo}`
              );
              return await prisma.test.create.apply(prisma, args);
            } catch (e) {
              console.log("Failed");
              if (i === MAX_ATTEMPTS) {
                throw e;
              }
              await sleep(100);
            }
          }
        },
      },
    },
  })
);
