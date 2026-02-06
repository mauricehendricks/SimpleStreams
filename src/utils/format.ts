/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as currency for chart display with truncation
 * Supports up to 9 digits (999,999,999), truncates beyond that
 */
export function formatChartCurrency(amount: number): string {
  const MAX_DIGITS = 9;
  const amountStr = Math.floor(amount).toString();
  
  if (amountStr.length > MAX_DIGITS) {
    // Truncate to 9 digits and add ellipsis
    const truncated = amountStr.substring(0, MAX_DIGITS);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(truncated));
    return formatted + '...';
  }
  
  return formatCurrency(amount);
}

/**
 * Get the number of digits in a number (excluding decimals)
 */
export function getDigitCount(value: number): number {
  return Math.floor(Math.abs(value)).toString().length;
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
