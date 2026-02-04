import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { styles } from './ProfileScenarioHeader.styles';
import { ViewPickerSheet } from './ViewPickerSheet';

export function ProfileScenarioHeader() {
  const [showViewPicker, setShowViewPicker] = useState(false);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const view = useSimpleStreamsStore((state) => state.getActiveView());

  // Truncate to 20 characters max
  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const viewName = truncateText(view?.name || 'Dashboard');

  if (!isPremium) {
    // Free tier: show only "Dashboard"
    return (
      <View style={styles.container}>
        <Text
          style={[styles.text, styles.textTruncate]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {"Dashboard"}
        </Text>
      </View>
    );
  }

  // Premium: interactive with chevron
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => setShowViewPicker(true)}
        >
          <Text
            style={[styles.text, styles.touchableText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {viewName}
          </Text>
          <ChevronDown size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      <ViewPickerSheet
        visible={showViewPicker}
        onClose={() => setShowViewPicker(false)}
      />
    </>
  );
}
