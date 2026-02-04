import { ViewPeriod } from '../state/types';

// View Period conversion factors (payments per year)
export const VIEW_PERIOD_FACTORS: Record<ViewPeriod, number> = {
  monthly: 12,
  weekly: 52,
  semimonthly: 24,
  yearly: 1,
};

/**
 * Convert amount from one view period to another using yearly normalization
 */
export function convertAmount(
  amount: number,
  fromViewPeriod: ViewPeriod,
  toViewPeriod: ViewPeriod
): number {
  if (fromViewPeriod === toViewPeriod) return amount;
  const fromFactor = VIEW_PERIOD_FACTORS[fromViewPeriod];
  const toFactor = VIEW_PERIOD_FACTORS[toViewPeriod];
  // Convert to yearly first, then to target period
  const yearlyAmount = amount * fromFactor;
  return yearlyAmount / toFactor;   
}

/**
 * Get period label for display
 */
export function getViewPeriodLabel(viewPeriod: ViewPeriod): string {
  switch (viewPeriod) {
    case 'monthly':
      return 'Month';
    case 'weekly':
      return 'Week';
    case 'semimonthly':
      return 'Semi-month';
    case 'yearly':
      return 'Year';
  }
}
