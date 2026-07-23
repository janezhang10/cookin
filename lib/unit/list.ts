import { prisma } from "@/lib/db/client";

export async function listUnits() {
  return prisma.unit.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
