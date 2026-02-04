import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { styles } from './DashboardSkeleton.styles';

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A3FBC" />
    </View>
  );
}
