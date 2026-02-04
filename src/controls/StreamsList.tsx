import { Pencil, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StreamRow } from '../components/StreamRow';
import { streamRowStyles } from '../components/StreamRow.styles';
import { Stream, ViewPeriod } from '../state/types';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { formatCurrency, formatPercent } from '../utils/format';
import { getViewPeriodLabel } from '../utils/periodConversion';
import { styles } from './StreamsList.styles';

type TabType = 'income' | 'expense' | 'net';

interface StreamsListProps {
  activeTab: TabType;
  streams: Stream[];
  viewPeriod: ViewPeriod;
  taxAmount: number;
  taxColor: string;
  incomeColorMap?: Map<string, string>;
  expenseColorMap?: Map<string, string>;
  getConvertedAmount: (stream: Stream) => number;
  getStreamPercent: (amount: number) => number;
  onEdit: (stream: Stream) => void;
  onDelete: (stream: Stream) => void;
  onTaxPress: () => void;
}

export function StreamsList({
  activeTab,
  streams,
  viewPeriod,
  taxAmount,
  taxColor,
  incomeColorMap,
  expenseColorMap,
  getConvertedAmount,
  getStreamPercent,
  onEdit,
  onDelete,
  onTaxPress,
}: StreamsListProps) {
  if (activeTab === 'net') {
    return null;
  }

  const view = useSimpleStreamsStore((state) => state.getActiveView());
  const taxAllocationRate = view?.taxAllocationRate ?? 30;

  // Create a list that includes streams and taxes (for expenses)
  // Sort from largest to smallest for UI display
  const allItems: Array<{
    id: string;
    name: string;
    amount: number;
    color: string;
    isTax: boolean;
    stream?: Stream;
  }> = [];

  // Add regular streams
  // Use recalculated colors from color maps (single source of truth)
  // This ensures colors match between chart and list
  streams.forEach(stream => {
    let color = stream.color; // Fallback to stored color
    
    if (activeTab === 'income' && incomeColorMap) {
      color = incomeColorMap.get(stream.id) || stream.color;
    } else if (activeTab === 'expense' && expenseColorMap) {
      color = expenseColorMap.get(stream.id) || stream.color;
    }
    
    allItems.push({
      id: stream.id,
      name: stream.name,
      amount: getConvertedAmount(stream),
      color,
      isTax: false,
      stream,
    });
  });

  // Add taxes as a virtual item for expenses
  if (activeTab === 'expense') {
    allItems.push({
      id: 'taxes',
      name: 'Taxes',
      amount: taxAmount,
      color: taxColor,
      isTax: true,
    });
  }

  // Sort from largest to smallest
  const sortedItems = allItems.sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {activeTab === 'income' ? 'Income' : 'Expense'} Streams
      </Text>
      {sortedItems.map((item) => {
        const percent = getStreamPercent(item.amount);
        
        if (item.isTax) {
          return (
            <View key={item.id} style={streamRowStyles.streamRow}>
              <View style={[streamRowStyles.streamDot, { backgroundColor: item.color }]} />
              <TouchableOpacity
                style={streamRowStyles.streamInfo}
                onPress={onTaxPress}
                activeOpacity={0.7}
              >
                <View style={styles.taxRowHeader}>
                  <Text style={streamRowStyles.streamName}>{item.name}</Text>
                  <View style={styles.taxBadge}>
                    <Text style={styles.taxBadgeText}>{formatPercent(taxAllocationRate)}</Text>
                  </View>
                  <View style={styles.autoBadge}>
                    <Text style={styles.autoBadgeText}>Auto</Text>
                  </View>
                </View>
                <Text style={streamRowStyles.streamAmount}>
                  {formatCurrency(item.amount)} / {getViewPeriodLabel(viewPeriod)} • {formatPercent(percent)}
                </Text>
              </TouchableOpacity>
              <View style={streamRowStyles.streamActions}>
                <TouchableOpacity
                  style={streamRowStyles.editButton}
                  onPress={onTaxPress}
                >
                  <Pencil size={18} color="#8E8E93" />
                </TouchableOpacity>
                <View style={styles.deleteButtonDisabled}>
                  <Trash2 size={18} color="#D0D0D0" />
                </View>
              </View>
            </View>
          );
        }

        return (
          <StreamRow
            key={item.id}
            stream={item.stream!}
            streamColor={item.color}
            viewPeriod={viewPeriod}
            percent={percent}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </View>
  );
}
