import React from 'react';
import { Switch, Text, View } from 'react-native';
import { styles } from './PremiumRow.styles';

interface PremiumRowProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function PremiumRow({ label, description, value, onValueChange }: PremiumRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.switchContainer}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#1A3FBC' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
