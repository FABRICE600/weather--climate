// Temperature unit helpers. The backend always returns Celsius; the UI
// converts for display based on the user's selected unit.

export type TempUnit = "C" | "F";

export function cToF(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  if (unit === "F") {
    return `${Math.round(cToF(celsius))}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

// Returns just the number (no unit symbol) in the selected unit.
export function tempValue(celsius: number, unit: TempUnit): number {
  if (unit === "F") return Math.round(cToF(celsius));
  return Math.round(celsius);
}

export function unitLabel(unit: TempUnit): string {
  return unit === "F" ? "°F" : "°C";
}
