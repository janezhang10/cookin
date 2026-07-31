import { asc } from "drizzle-orm";

import { units } from "@/db/schema";
import { getDb } from "@/lib/db/client";

export async function listUnits() {
  const db = await getDb();
  return db.select().from(units).orderBy(asc(units.name));
}
