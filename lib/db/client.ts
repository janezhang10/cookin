import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import { cache } from "react";

export const getDb = cache(async () => {
  await connection();
  const database = getCloudflareContext().env.DB;

  if (!database) {
    throw new Error("Cloudflare D1 binding `DB` is not configured.");
  }

  return drizzle(database);
});

export type CookinDb = Awaited<ReturnType<typeof getDb>>;
