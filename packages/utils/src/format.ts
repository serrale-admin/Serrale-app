export function formatCurrency(value: number, currency = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function truncateText(value: string, maxLength = 120): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(maxLength - 3, 1))}...`;
}
