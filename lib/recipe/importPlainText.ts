export interface ImportUnitOption {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ParsedRecipeDraft {
  title: string;
  tags: string[];
  ingredients: Array<{
    quantity: number | null;
    unitId: string | null;
    ingredient: string;
  }>;
  steps: Array<{
    text: string;
  }>;
}

export type PlainTextParseResult =
  | {
      success: true;
      draft: ParsedRecipeDraft;
      warnings: string[];
    }
  | {
      success: false;
      errors: string[];
    };

const unicodeFractions: Record<string, string> = {
  "¼": "1/4",
  "½": "1/2",
  "¾": "3/4",
  "⅐": "1/7",
  "⅑": "1/9",
  "⅒": "1/10",
  "⅓": "1/3",
  "⅔": "2/3",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

const ingredientHeadings = new Set(["ingredient", "ingredients"]);
const instructionHeadings = new Set([
  "direction",
  "directions",
  "instruction",
  "instructions",
  "method",
  "steps",
]);

function normalizeHeading(line: string) {
  return line.trim().toLowerCase().replace(/:$/, "").trim();
}

function stripListPrefix(line: string) {
  return line.replace(/^\s*(?:(?:[-*•])\s+|\d+[.)]\s+)/, "").trim();
}

function parseFraction(value: string) {
  const [numerator, denominator] = value.split("/").map(Number);

  if (!denominator) {
    return null;
  }

  return numerator / denominator;
}

function parseLeadingQuantity(line: string) {
  const normalized = line.replace(
    /(\d)?([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g,
    (_, whole: string | undefined, fraction: string) =>
      `${whole ? `${whole} ` : ""}${unicodeFractions[fraction]}`,
  );
  const match = normalized.match(
    /^\s*(?:(\d+(?:\.\d+)?)\s+(\d+\/\d+)|(\d+\/\d+)|(\d+(?:\.\d+)?))(?=\s|$)/,
  );

  if (!match) {
    return { quantity: null, rest: line.trim() };
  }

  const quantity = match[1]
    ? Number(match[1]) + (parseFraction(match[2]) ?? 0)
    : match[3]
      ? parseFraction(match[3])
      : Number(match[4]);

  return {
    quantity,
    rest: normalized.slice(match[0].length).trim(),
  };
}

function createUnitAliases(units: ImportUnitOption[]) {
  return units
    .flatMap((unit) => {
      const aliases = new Set([
        unit.name.toLowerCase(),
        unit.abbreviation.toLowerCase(),
      ]);

      if (!unit.name.toLowerCase().endsWith("s")) {
        aliases.add(`${unit.name.toLowerCase()}s`);
      }

      return Array.from(aliases, (alias) => ({ alias, unitId: unit.id }));
    })
    .sort((first, second) => second.alias.length - first.alias.length);
}

function parseIngredientLine(
  line: string,
  unitAliases: ReturnType<typeof createUnitAliases>,
) {
  const { quantity, rest } = parseLeadingQuantity(stripListPrefix(line));
  const normalizedRest = rest.toLowerCase();
  const matchedUnit = unitAliases.find(
    ({ alias }) =>
      normalizedRest === alias ||
      normalizedRest.startsWith(`${alias} `) ||
      normalizedRest.startsWith(`${alias},`),
  );
  const ingredient = matchedUnit
    ? rest.slice(matchedUnit.alias.length).replace(/^,\s*/, "").trim()
    : rest;

  return {
    quantity,
    unitId: matchedUnit?.unitId ?? null,
    ingredient,
  };
}

export function parsePlainTextRecipe(
  text: string,
  units: ImportUnitOption[],
): PlainTextParseResult {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const warnings: string[] = [];
  const errors: string[] = [];
  const ingredientLines: string[] = [];
  const stepLines: string[] = [];
  let title = "";
  let tags: string[] = [];
  let section: "ingredients" | "instructions" | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const heading = normalizeHeading(line);

    if (ingredientHeadings.has(heading)) {
      section = "ingredients";
      continue;
    }

    if (instructionHeadings.has(heading)) {
      section = "instructions";
      continue;
    }

    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    const tagsMatch = line.match(/^tags?\s*:\s*(.+)$/i);
    if (tagsMatch && section === null) {
      tags = tagsMatch[1]
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      continue;
    }

    if (section === "ingredients") {
      ingredientLines.push(line);
    } else if (section === "instructions") {
      stepLines.push(line);
    } else if (!title) {
      title = stripListPrefix(line);
    } else {
      warnings.push(`Skipped unrecognized line before a section: "${line}"`);
    }
  }

  if (!title) {
    errors.push("Add a recipe title before the Ingredients section.");
  }

  if (ingredientLines.length === 0) {
    errors.push('Add an "Ingredients:" section with at least one ingredient.');
  }

  if (stepLines.length === 0) {
    errors.push(
      'Add an "Instructions:" or "Directions:" section with at least one step.',
    );
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const unitAliases = createUnitAliases(units);
  const ingredients = ingredientLines
    .map((line) => parseIngredientLine(line, unitAliases))
    .filter((ingredient) => {
      if (ingredient.ingredient) {
        return true;
      }

      warnings.push(`Skipped an ingredient with no name.`);
      return false;
    });
  const steps = stepLines
    .map((line) => ({ text: stripListPrefix(line) }))
    .filter((step) => step.text);

  if (ingredients.length === 0) {
    return {
      success: false,
      errors: ["No usable ingredient names were found."],
    };
  }

  if (steps.length === 0) {
    return {
      success: false,
      errors: ["No usable instruction steps were found."],
    };
  }

  return {
    success: true,
    draft: {
      title,
      tags,
      ingredients,
      steps,
    },
    warnings,
  };
}
