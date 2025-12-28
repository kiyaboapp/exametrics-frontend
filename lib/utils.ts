import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

export function formatGPA(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) return 'N/A';
  return gpa.toFixed(4);
}

export function getDivisionColor(division: string): string {
  switch (division) {
    case 'I': return 'text-green-600 bg-green-50';
    case 'II': return 'text-blue-600 bg-blue-50';
    case 'III': return 'text-yellow-600 bg-yellow-50';
    case 'IV': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}
