import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { ProfilePickerSheet } from './ProfilePickerSheet';
import { styles } from './ProfileScenarioHeader.styles';
import { ViewPickerSheet } from './ViewPickerSheet';

export function ProfileScenarioHeader() {
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showViewPicker, setShowViewPicker] = useState(false);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const profile = useSimpleStreamsStore((state) => state.getActiveProfile());
  const view = useSimpleStreamsStore((state) => state.getActiveView());

  // Truncate to 20 characters max
  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const profileName = truncateText(profile?.name || 'Personal');
  const viewName = truncateText(view?.name || 'View');

  if (!isPremium) {
    // Free tier: show only profile name (View is not editable)
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

  // Premium: interactive with chevrons
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => setShowProfilePicker(true)}
        >
          <Text
            style={[styles.text, styles.touchableText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profileName}
          </Text>
          <ChevronDown size={16} color="#666" />
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
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
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <ProfilePickerSheet
              visible={showProfilePicker}
              onClose={() => setShowProfilePicker(false)}
            />
            <ViewPickerSheet
              visible={showViewPicker}
              onClose={() => setShowViewPicker(false)}
            />
    </>
  );
}
