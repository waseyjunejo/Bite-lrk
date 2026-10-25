/**
 * Security & Sanitization Utilities
 * Bite Restaurant Larkana - Inventory & Demand Management
 * 
 * Protects against:
 * - CSV Injection / Spreadsheet Formula Injection (CWE-1236)
 * - Prototype Pollution via JSON imports (CWE-1321)
 * - XSS & Control Character Injection
 * - Numeric Underflow/Overflow & Division by Zero (CWE-369)
 */

import { SectionCategory, SlipEntry, ItemMaster, DepartmentTracker } from '../types/inventory';

export const VALID_SECTION_CATEGORIES: SectionCategory[] = [
  'BBQ Section',
  'Roll Section',
  'Naan Section',
  'Karahi Section',
  'Pizza & Fast Food',
  'Disposal Demand',
  'Vegetables & Misc',
  'Department Trackers',
];

/**
 * Strips dangerous control characters and null bytes from user input.
 * Trims excess whitespace.
 */
export function sanitizeString(val: unknown, maxLength = 250): string {
  if (typeof val !== 'string') return '';
  // Remove null bytes and non-printable control characters except newline and tab
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Protects against CSV Formula Injection (CWE-1236).
 * If a cell string starts with '=', '+', '-', '@', tab, or carriage return,
 * Excel / LibreOffice will execute it as a formula.
 * Prepends a single quote "'" to neutralize formula interpretation.
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(val) : '0';
  }
  let str = String(val);
  const trimmed = str.trimStart();
  // Neutralize spreadsheet formula trigger characters
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    str = "'" + str;
  }
  // Escape double quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates a safe CSV blob download to avoid URI encoding size limits and injection.
 */
export function downloadSafeCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvRows = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  // Add UTF-8 BOM so Excel correctly renders Urdu/Sindhi and foreign script names
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Recursively protects against Prototype Pollution by removing '__proto__',
 * 'constructor', and 'prototype' properties.
 */
export function sanitizeParsedObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeParsedObject) as unknown as T;
  }

  const cleanObj = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleanObj[key] = sanitizeParsedObject(value);
  }
  return cleanObj as T;
}

/**
 * Validates whether an imported slip matches the expected SlipEntry schema.
 */
export function validateImportedSlip(raw: any): SlipEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = sanitizeString(raw.id || `slip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, 64);
  const slipNumber = sanitizeString(raw.slipNumber || raw.slip_number || `SLIP-LKN-${Date.now().toString().slice(-6)}`, 64);
  const date = sanitizeString(raw.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const itemName = sanitizeString(raw.itemName || raw.item_name, 120);
  if (!itemName) return null;

  const category = (VALID_SECTION_CATEGORIES.includes(raw.category)
    ? raw.category
    : 'BBQ Section') as SectionCategory;

  const qty = Number(raw.quantity);
  const quantity = Number.isFinite(qty) && qty > 0 ? Math.min(qty, 1000000) : 1;

  const unit = sanitizeString(raw.unit || 'Kg', 30);
  const price = Number(raw.priceRs || raw.price_rs);
  const priceRs = Number.isFinite(price) && price >= 0 ? Math.min(price, 100000000) : 0;

  const unitPrice = quantity > 0 ? Math.round((priceRs / quantity) * 100) / 100 : 0;
  const remarks = sanitizeString(raw.remarks || '', 500);
  const loggedBy = sanitizeString(raw.loggedBy || raw.logged_by || 'IB Junejo (Store Manager)', 80);
  const status = raw.status === 'Procured' || raw.status === 'Verified' ? raw.status : 'Logged';
  const timestamp = typeof raw.timestamp === 'number' && Number.isFinite(raw.timestamp) ? raw.timestamp : Date.now();

  return {
    id,
    slipNumber,
    date,
    itemName,
    category,
    quantity,
    unit,
    priceRs,
    unitPriceRs: unitPrice,
    remarks,
    loggedBy,
    status,
    timestamp,
  };
}

/**
 * Validates whether an imported item matches the ItemMaster schema.
 */
export function validateImportedItem(raw: any): ItemMaster | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = sanitizeString(raw.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, 64);
  const name = sanitizeString(raw.name, 120);
  if (!name) return null;

  const section = (VALID_SECTION_CATEGORIES.includes(raw.section)
    ? raw.section
    : 'BBQ Section') as SectionCategory;

  const subCategory = raw.subCategory ? sanitizeString(raw.subCategory, 60) : undefined;
  const unit = sanitizeString(raw.unit || 'Kg', 30);
  const currentStock = Number.isFinite(Number(raw.currentStock)) ? Math.max(0, Number(raw.currentStock)) : 0;
  const minThreshold = Number.isFinite(Number(raw.minThreshold)) ? Math.max(0, Number(raw.minThreshold)) : 0;
  const pendingDemand = Number.isFinite(Number(raw.pendingDemand)) ? Math.max(0, Number(raw.pendingDemand)) : 0;
  const estimatedPriceRs = Number.isFinite(Number(raw.estimatedPriceRs)) ? Math.max(0, Number(raw.estimatedPriceRs)) : 0;
  const lastUpdated = sanitizeString(raw.lastUpdated || '', 30);
  const remarks = raw.remarks ? sanitizeString(raw.remarks, 500) : undefined;

  return {
    id,
    name,
    section,
    subCategory,
    unit,
    currentStock,
    minThreshold,
    pendingDemand,
    estimatedPriceRs,
    lastUpdated,
    remarks,
  };
}

/**
 * Safe division with zero/NaN guards.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}
