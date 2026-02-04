import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ViewPeriod } from '../state/types';
import { getViewPeriodLabel } from '../utils/periodConversion';
import { styles } from './PeriodSelector.styles';

interface PeriodSelectorProps {
  viewPeriod: ViewPeriod;
  onPeriodChange: (period: ViewPeriod) => void;
}

export function PeriodSelector({ viewPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>View Period:</Text>
      <View style={styles.buttons}>
        {(['monthly', 'weekly', 'biweekly', 'yearly'] as ViewPeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.button,
              viewPeriod === period && styles.buttonActive,
            ]}
            onPress={() => onPeriodChange(period)}
          >
            <Text
              style={[
                styles.buttonText,
                viewPeriod === period && styles.buttonTextActive,
              ]}
            >
              {getViewPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
