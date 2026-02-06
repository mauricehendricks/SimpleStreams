import { RefreshCw } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useHydrationGate } from '../hooks/useHydrationGate';
import { styles } from './HydrationErrorState.styles';

export function HydrationErrorState() {
  const { retry, resetData } = useHydrationGate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Failed to load data</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <RefreshCw size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetData}>
          <Text style={styles.resetButtonText}>Reset Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
