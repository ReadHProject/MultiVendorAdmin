export function generateEAN13() {
  let barcode = "";
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return barcode + checkDigit;
}

export function generateBarcode(prefix = "PRD") {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateSKU(name, existingCount = 0) {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 6);
  const num = String(existingCount + 1).padStart(3, "0");
  return `${base}-${num}`;
}