import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TabType } from '../state/types';
import { styles } from './TabSelector.styles';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.segment, activeTab === 'income' && styles.segmentActive]}
        onPress={() => onTabChange('income')}
      >
        <Text
          style={[
            styles.segmentText,
            activeTab === 'income' && styles.segmentTextActive,
          ]}
        >
          Income
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segment, activeTab === 'expense' && styles.segmentActive]}
        onPress={() => onTabChange('expense')}
      >
        <Text
          style={[
            styles.segmentText,
            activeTab === 'expense' && styles.segmentTextActive,
          ]}
        >
          Expenses
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segment, activeTab === 'net' && styles.segmentActive]}
        onPress={() => onTabChange('net')}
      >
        <Text
          style={[
            styles.segmentText,
            activeTab === 'net' && styles.segmentTextActive,
          ]}
        >
          Cash Flow
        </Text>
      </TouchableOpacity>
    </View>
  );
}
