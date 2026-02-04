/**
 * Color assignment utilities for auto-coloring streams based on values
 */

// Primary colors
const PRIMARY_BLUE = '#1A3FBC';
const PRIMARY_RED = '#EF5350';
const TAX_COLOR = '#8E8E93';

// Lightest colors (almost white with tint)
const LIGHTEST_BLUE = '#E3F2FD';
const LIGHTEST_RED = '#FFEBEE';

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Parse hex colors
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * Get color for income stream based on value rank
 * @param rank - 0 (smallest) to 1 (largest)
 */
export function getIncomeColor(rank: number): string {
  // Largest values (rank = 1) get darkest color, smallest (rank = 0) get lightest
  return interpolateColor(LIGHTEST_BLUE, PRIMARY_BLUE, rank);
}

/**
 * Get color for expense stream based on value rank
 * @param rank - 0 (smallest) to 1 (largest)
 */
export function getExpenseColor(rank: number): string {
  // Largest values (rank = 1) get darkest color, smallest (rank = 0) get lightest
  return interpolateColor(LIGHTEST_RED, PRIMARY_RED, rank);
}

/**
 * Get tax color (always grey)
 */
export function getTaxColor(): string {
  return TAX_COLOR;
}

/**
 * Get primary blue for cash flow chart
 */
export function getCashFlowIncomeColor(): string {
  return PRIMARY_BLUE;
}

/**
 * Get primary red for cash flow chart
 */
export function getCashFlowExpenseColor(): string {
  return PRIMARY_RED;
}

/**
 * Assign colors to streams based on their values
 * @param streams - Array of streams with amounts (and optionally id)
 * @param type - 'income' or 'expense'
 */
export function assignColorsToStreams<T extends { amount: number; id?: string }>(
  streams: T[],
  type: 'income' | 'expense'
): Array<T & { color: string }> {
  if (streams.length === 0) return [];
  
  // Sort by amount to determine ranks
  const sorted = [...streams].sort((a, b) => a.amount - b.amount);
  
  return sorted.map((stream, index) => {
    // When there's only one stream, it should get the darkest color (rank = 1)
    // since it's the largest (and only) value
    const rank = streams.length > 1 ? index / (streams.length - 1) : 1;
    const color = type === 'income' ? getIncomeColor(rank) : getExpenseColor(rank);
    return { ...stream, color };
  });
}
