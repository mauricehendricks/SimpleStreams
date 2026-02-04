import React from 'react';
import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Stream } from '../state/types';
import { formatCurrency, formatPercent } from '../utils/format';
import { styles } from './ChartCard.styles';

type TabType = 'income' | 'expense' | 'net';

interface ChartCardProps {
  activeTab: TabType;
  chartData: Array<{
    value: number;
    color: string;
    label: string;
    stream?: Stream;
  }>;
  total: number;
  netMarginPercent: number;
}

export function ChartCard({
  activeTab,
  chartData,
  total,
  netMarginPercent,
}: ChartCardProps) {
  return (
    <View style={styles.card}>
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={[...chartData]}
            donut
            radius={120}
            innerRadius={80}
            innerCircleColor="#F7F8FC"
            initialAngle={0}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerValue}>
                  {formatCurrency(total)}
                </Text>
                {activeTab === 'net' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {formatPercent(netMarginPercent)} Margin
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Add your first stream to see the breakdown.
          </Text>
        </View>
      )}
    </View>
  );
}
