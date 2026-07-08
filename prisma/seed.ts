import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const units = [
    { name: "teaspoon", abbreviation: "tsp" },
    { name: "tablespoon", abbreviation: "tbsp" },
    { name: "cup", abbreviation: "cup" },
    { name: "fluid ounce", abbreviation: "fl oz" },
    { name: "ounce", abbreviation: "oz" },
    { name: "pound", abbreviation: "lb" },
    { name: "gram", abbreviation: "g" },
    { name: "kilogram", abbreviation: "kg" },
    { name: "milliliter", abbreviation: "mL" },
    { name: "liter", abbreviation: "L" },
    { name: "pinch", abbreviation: "pinch" },
    { name: "dash", abbreviation: "dash" },
    { name: "clove", abbreviation: "clove" },
    { name: "slice", abbreviation: "slice" },
    { name: "piece", abbreviation: "piece" },
    { name: "whole", abbreviation: "whole" },
    { name: "stick", abbreviation: "stick" },
    { name: "can", abbreviation: "can" },
    { name: "package", abbreviation: "pkg" },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    });
  }

  console.log(`Seeded ${units.length} units.`);
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());