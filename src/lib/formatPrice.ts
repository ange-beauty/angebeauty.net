export function toArabicNumerals(value: string | number): string {
  const arabicNumerals = [
    "\u0660",
    "\u0661",
    "\u0662",
    "\u0663",
    "\u0664",
    "\u0665",
    "\u0666",
    "\u0667",
    "\u0668",
    "\u0669",
  ];
  return String(value).replace(/[0-9]/g, (digit) => arabicNumerals[Number(digit)]);
}

export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === "number" ? price : parseFloat(price || "0");
  return toArabicNumerals(Math.round(Number.isFinite(numericPrice) ? numericPrice : 0));
}
