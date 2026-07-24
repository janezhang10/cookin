"use client";

import { useState } from "react";

import {
  CONVERSION_UNITS,
  conversionNeedsDensity,
  convertUnit,
  DENSITY_PRESETS,
  type DensityPreset,
  MASS_UNITS,
  type ConversionUnit,
  VOLUME_UNITS,
} from "@/lib/recipe/convert";

const resultFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

function UnitOptions() {
  return (
    <>
      <optgroup label="Weight">
        {MASS_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {CONVERSION_UNITS[unit].label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Volume">
        {VOLUME_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {CONVERSION_UNITS[unit].label}
          </option>
        ))}
      </optgroup>
    </>
  );
}

export function UnitConverter() {
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState<ConversionUnit>("lb");
  const [toUnit, setToUnit] = useState<ConversionUnit>("kg");
  const [densityPreset, setDensityPreset] = useState<DensityPreset>("water");
  const parsedAmount = Number(amount);
  const needsDensity = conversionNeedsDensity(fromUnit, toUnit);
  const density = DENSITY_PRESETS[densityPreset];
  const result = convertUnit(
    parsedAmount,
    fromUnit,
    toUnit,
    needsDensity ? density.gramsPerMilliliter : undefined,
  );
  const hasValidAmount = amount.trim() !== "" && result !== null;

  return (
    <div className="unit-converter">
      <div className="unit-converter-fields">
        <label>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <label>
          <span>From</span>
          <select
            value={fromUnit}
            onChange={(event) =>
              setFromUnit(event.target.value as ConversionUnit)
            }
          >
            <UnitOptions />
          </select>
        </label>

        <button
          type="button"
          className="unit-swap-button"
          aria-label="Swap units"
          onClick={() => {
            setFromUnit(toUnit);
            setToUnit(fromUnit);
          }}
        >
          ⇄
        </button>

        <label>
          <span>To</span>
          <select
            value={toUnit}
            onChange={(event) =>
              setToUnit(event.target.value as ConversionUnit)
            }
          >
            <UnitOptions />
          </select>
        </label>
      </div>

      {needsDensity && (
        <label className="density-field">
          <span>Ingredient</span>
          <select
            value={densityPreset}
            onChange={(event) =>
              setDensityPreset(event.target.value as DensityPreset)
            }
          >
            {Object.entries(DENSITY_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <output className="conversion-result" aria-live="polite">
        {hasValidAmount ? (
          <>
            <strong>
              {resultFormatter.format(result)}{" "}
              {CONVERSION_UNITS[toUnit].abbreviation}
            </strong>
            {needsDensity && (
              <span>Approximate, using {density.label.toLowerCase()}.</span>
            )}
          </>
        ) : (
          <span>Enter an amount to convert.</span>
        )}
      </output>
    </div>
  );
}
