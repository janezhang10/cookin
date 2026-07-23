const COMMON_FRACTIONS = [
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 6, label: "1/6" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 3, label: "1/3" },
  { value: 3 / 8, label: "3/8" },
  { value: 1 / 2, label: "1/2" },
  { value: 5 / 8, label: "5/8" },
  { value: 2 / 3, label: "2/3" },
  { value: 3 / 4, label: "3/4" },
  { value: 5 / 6, label: "5/6" },
  { value: 7 / 8, label: "7/8" },
] as const;

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function scaleQuantity(
  quantity: number | null,
  divisor: number,
): number | null {
  if (quantity === null) {
    return null;
  }

  if (!Number.isFinite(divisor) || divisor <= 0) {
    throw new RangeError("Divisor must be greater than zero.");
  }

  return quantity / divisor;
}

export function formatQuantity(quantity: number | null): string {
  if (quantity === null) {
    return "";
  }

  const nearestInteger = Math.round(quantity);

  if (Math.abs(quantity - nearestInteger) < 0.01) {
    return String(nearestInteger);
  }

  const whole = Math.floor(quantity);
  const remainder = quantity - whole;
  const nearestFraction = COMMON_FRACTIONS.reduce((nearest, fraction) =>
    Math.abs(fraction.value - remainder) < Math.abs(nearest.value - remainder)
      ? fraction
      : nearest,
  );

  if (Math.abs(nearestFraction.value - remainder) < 0.02) {
    return whole > 0
      ? `${whole} ${nearestFraction.label}`
      : nearestFraction.label;
  }

  return decimalFormatter.format(quantity);
}
