import React from 'react';
import { Text, View } from 'react-native';
import { ViewPeriod } from '../state/types';
import { usePremiumStore } from '../state/usePremiumStore';
import { getCashFlowExpenseColor, getCashFlowIncomeColor } from '../utils/colorAssignment';
import { formatCurrency, formatPercent } from '../utils/format';
import { getViewPeriodLabel } from '../utils/periodConversion';
import { styles } from './NetMarginSummary.styles';

interface NetMarginSummaryProps {
  incomeTotal: number;
  expenseTotalWithTax: number;
  viewPeriod: ViewPeriod;
  getStreamPercent: (amount: number) => number;
}

export function NetMarginSummary({
  incomeTotal,
  expenseTotalWithTax,
  viewPeriod,
  getStreamPercent,
}: NetMarginSummaryProps) {
  const isPremium = usePremiumStore((state) => state.isPremium);

  if (incomeTotal === 0 && expenseTotalWithTax === 0) {
    return null;
  }

  // Create items array and sort from largest to smallest (consistent with StreamsList)
  const items = [];
  if (incomeTotal > 0) {
    items.push({
      id: 'income',
      name: 'Income',
      amount: incomeTotal,
      color: getCashFlowIncomeColor(),
    });
  }
  if (expenseTotalWithTax > 0) {
    items.push({
      id: 'expense',
      name: isPremium ? 'Expenses (with tax)' : 'Expenses',
      amount: expenseTotalWithTax,
      color: getCashFlowExpenseColor(),
    });
  }

  // Sort from largest to smallest
  const sortedItems = items.sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Summary</Text>
      {sortedItems.map((item) => (
        <View key={item.id} style={styles.streamRow}>
          <View style={[styles.streamDot, { backgroundColor: item.color }]} />
          <View style={styles.streamInfo}>
            <Text style={styles.streamName}>{item.name}</Text>
            <Text style={styles.streamAmount}>
              {formatCurrency(item.amount)} / {getViewPeriodLabel(viewPeriod)} • {formatPercent(getStreamPercent(item.amount))}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
