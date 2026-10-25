import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatETB(amount: number | string | undefined | null): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return "ETB 0.00";
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace("ETB", "ETB ");
}

export function formatNumber(val: number | string | undefined | null): string {
  const num = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatFaydaFin(fin: string): string {
  const cleaned = fin.replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}`;
}

export function validateEthiopianPhone(phone: string): boolean {
  // Matches +251 9XX XXX XXX or 09XX XXX XXX or +251 7XX XXX XXX (Safaricom)
  const regex = /^(\+251|0)(9|7)\d{8}$/;
  return regex.test(phone.replace(/\s+/g, ""));
}
