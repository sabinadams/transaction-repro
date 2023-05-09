# Reproduction of an issue

The issue [here](https://github.com/prisma/prisma/issues/19145) here describes unexpected behavioral differences between Array transactions and Interactive transactions when a middleware is involved.

The Tl;dr of the problem is that the following results in two different behaviors:

```ts
import { PrismaClient } from "@prisma/client";
import { retryMiddleware } from "./middleware";
const db = new PrismaClient();
db.$use(retryMiddleware);

// array
await db.$transaction([
  createARecord, 
  failAQuery
])
// itx
await db.$transaction((tx) => {
  await createARecord()
  await failAQuery()
})
```

The array-based transaction leaves one record in the database when you would expect the failure to roll back any data changes.

The interactive transaction correctly rolls back the changes.

## Findings

In this repo I have set up two tests.

> **Note**
>
> To run the tests, run `npm run test:ui`. If prompted to, install `@vitest/ui` by selecting `'y'` and run the command again.

I've added logging in the middleware to log each attempt and an indicator about whether or not that attempt passed. It then logs the entire table to see if any data is left.

### Interactive Transaction

![](./images/itx.png)

We can see here the attempt with a proper name provided passes successfully. 

Next, the failure-inducing invocation occurs, triggering a retry. These happen until the retry limit is reached and the function fails. 

The table at the end shows no records, indicating the rollback was successful.

### Array Transaction
![](./images/array.png)


When using an array transaction, we can see that the different operations in the array are not invoked in the same way the interactive transaction are. 

When using an array transaction, we can see rather than running the first function in the array, checking if it was successful and then moving on to the next one if it was, it actually runs _BOTH_ functions right away. If one of them fails, it rolls back both. 

> **Note**
>
> This is already different behavior from interactive transactions, however I don't think this is the cause of the problem. Curious to know why this behaves differently than iTX.

The **first attempt** of this has 1 success and 1 failure. This causes both to be failures and roll back.

_Here is where it begins to get wonky_. The **second attempt** again has 1 success and 1 failure. We see only one failure though. The invocation that was provided a name is successful and the one using a null value fails. This is expected for the individual functions, but we'd expect both to fail and be rolled back.

Instead, the failed one continues to retry until the retry limit is reached.

Because **Attempt 2** did have a successful run that was not rolled back, that record is still in the database. No rollback occurred there (_BAD_).

## Theories

When using array transactions in a middleware, both functions are not depend on each other's success after the first attempt. More specifically, after the first invocation of `next` in the middleware is called. 
