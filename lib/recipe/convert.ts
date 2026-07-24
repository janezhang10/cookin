export type UnitDimension = "mass" | "volume";

export type ConversionUnit =
  "g" | "kg" | "oz" | "lb" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "fl-oz";

interface UnitDefinition {
  label: string;
  abbreviation: string;
  dimension: UnitDimension;
  baseFactor: number;
}

export const CONVERSION_UNITS: Record<ConversionUnit, UnitDefinition> = {
  g: {
    label: "Grams",
    abbreviation: "g",
    dimension: "mass",
    baseFactor: 1,
  },
  kg: {
    label: "Kilograms",
    abbreviation: "kg",
    dimension: "mass",
    baseFactor: 1000,
  },
  oz: {
    label: "Ounces",
    abbreviation: "oz",
    dimension: "mass",
    baseFactor: 28.349523125,
  },
  lb: {
    label: "Pounds",
    abbreviation: "lb",
    dimension: "mass",
    baseFactor: 453.59237,
  },
  ml: {
    label: "Milliliters",
    abbreviation: "mL",
    dimension: "volume",
    baseFactor: 1,
  },
  l: {
    label: "Liters",
    abbreviation: "L",
    dimension: "volume",
    baseFactor: 1000,
  },
  tsp: {
    label: "Teaspoons",
    abbreviation: "tsp",
    dimension: "volume",
    baseFactor: 4.92892159375,
  },
  tbsp: {
    label: "Tablespoons",
    abbreviation: "tbsp",
    dimension: "volume",
    baseFactor: 14.78676478125,
  },
  cup: {
    label: "US cups",
    abbreviation: "cups",
    dimension: "volume",
    baseFactor: 236.5882365,
  },
  "fl-oz": {
    label: "US fluid ounces",
    abbreviation: "fl oz",
    dimension: "volume",
    baseFactor: 29.5735295625,
  },
};

export const DENSITY_PRESETS = {
  water: { label: "Water", gramsPerMilliliter: 1 },
  milk: { label: "Milk", gramsPerMilliliter: 1.03 },
  flour: { label: "All-purpose flour", gramsPerMilliliter: 0.53 },
  sugar: { label: "Granulated sugar", gramsPerMilliliter: 0.85 },
  butter: { label: "Butter", gramsPerMilliliter: 0.96 },
  honey: { label: "Honey", gramsPerMilliliter: 1.42 },
  oil: { label: "Cooking oil", gramsPerMilliliter: 0.92 },
  salt: { label: "Table salt", gramsPerMilliliter: 1.2 },
} as const;

export type DensityPreset = keyof typeof DENSITY_PRESETS;

export const MASS_UNITS: ConversionUnit[] = ["g", "kg", "oz", "lb"];
export const VOLUME_UNITS: ConversionUnit[] = [
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "fl-oz",
];

export function conversionNeedsDensity(
  from: ConversionUnit,
  to: ConversionUnit,
): boolean {
  return CONVERSION_UNITS[from].dimension !== CONVERSION_UNITS[to].dimension;
}

export function convertUnit(
  amount: number,
  from: ConversionUnit,
  to: ConversionUnit,
  gramsPerMilliliter?: number,
): number | null {
  if (!Number.isFinite(amount)) {
    return null;
  }

  const fromUnit = CONVERSION_UNITS[from];
  const toUnit = CONVERSION_UNITS[to];
  const sourceInBaseUnits = amount * fromUnit.baseFactor;

  if (fromUnit.dimension === toUnit.dimension) {
    return sourceInBaseUnits / toUnit.baseFactor;
  }

  if (
    gramsPerMilliliter === undefined ||
    !Number.isFinite(gramsPerMilliliter) ||
    gramsPerMilliliter <= 0
  ) {
    return null;
  }

  if (fromUnit.dimension === "mass") {
    const milliliters = sourceInBaseUnits / gramsPerMilliliter;
    return milliliters / toUnit.baseFactor;
  }

  const grams = sourceInBaseUnits * gramsPerMilliliter;
  return grams / toUnit.baseFactor;
}
