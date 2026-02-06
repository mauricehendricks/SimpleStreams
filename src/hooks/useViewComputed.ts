import { useMemo } from 'react';
import { ViewPeriod } from '../state/types';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { convertAmount } from '../utils/periodConversion';

export function useViewComputed(viewPeriod: ViewPeriod) {
  const view = useSimpleStreamsStore((state) => state.getActiveView());

  return useMemo(() => {
    if (!view) {
      return {
        incomeTotal: 0,
        taxAmount: 0,
        expenseTotalWithTax: 0,
        netTotal: 0,
        netMarginPercent: 0,
      };
    }

    // Calculate income total (converted to viewPeriod)
    const incomeTotal = view.income.reduce((sum, stream) => {
      return sum + convertAmount(stream.amount, stream.viewPeriod, viewPeriod);
    }, 0);

    // Calculate expense total (converted to viewPeriod)
    const expenseTotal = view.expenses.reduce((sum, stream) => {
      return sum + convertAmount(stream.amount, stream.viewPeriod, viewPeriod);
    }, 0);

    // Calculate tax amount
    const taxAmount = incomeTotal * (view.taxAllocationRate / 100);

    // Expense total including tax
    const expenseTotalWithTax = expenseTotal + taxAmount;

    // Net total
    const netTotal = incomeTotal - expenseTotalWithTax;

    // Net margin percent
    const netMarginPercent =
      incomeTotal > 0 ? (netTotal / incomeTotal) * 100 : 0;

    return {
      incomeTotal,
      taxAmount,
      expenseTotalWithTax,
      netTotal,
      netMarginPercent,
    };
  }, [view, viewPeriod]);
}
