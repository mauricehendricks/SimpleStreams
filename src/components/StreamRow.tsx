import { Pencil, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Stream, ViewPeriod } from '../state/types';
import { formatCurrency, formatPercent } from '../utils/format';
import { convertAmount, getViewPeriodLabel } from '../utils/periodConversion';
import { streamRowStyles } from './StreamRow.styles';

interface StreamRowProps {
  stream: Stream;
  streamColor: string;
  viewPeriod: ViewPeriod;
  percent: number;
  onEdit: (stream: Stream) => void;
  onDelete: (stream: Stream) => void;
}

export function StreamRow({
  stream,
  streamColor,
  viewPeriod,
  percent,
  onEdit,
  onDelete,
}: StreamRowProps) {
  const convertedAmount = convertAmount(stream.amount, stream.viewPeriod, viewPeriod);

  return (
    <View style={streamRowStyles.streamRow}>
      <View style={[streamRowStyles.streamDot, { backgroundColor: streamColor }]} />
      <View style={streamRowStyles.streamInfo}>
        <Text
          style={streamRowStyles.streamName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {stream.name}
        </Text>
        <Text style={streamRowStyles.streamAmount}>
          {formatCurrency(convertedAmount)} / {getViewPeriodLabel(viewPeriod)} • {formatPercent(percent)}
        </Text>
        {stream.viewPeriod !== viewPeriod && (
          <Text style={streamRowStyles.streamOriginal}>
            ({formatCurrency(stream.amount)} / {getViewPeriodLabel(stream.viewPeriod)})
          </Text>
        )}
      </View>
      <View style={streamRowStyles.streamActions}>
        <TouchableOpacity
          style={streamRowStyles.editButton}
          onPress={() => onEdit(stream)}
        >
          <Pencil size={18} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity
          style={streamRowStyles.deleteButton}
          onPress={() => onDelete(stream)}
        >
          <Trash2 size={18} color="#B71C1C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
