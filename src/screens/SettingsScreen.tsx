import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createDefaultState } from '../state/defaultState';
import { CURRENT_SCHEMA_VERSION } from '../state/migrations';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { APP_STORAGE_KEY } from '../utils/constants';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = usePremiumStore((state) => state.isPremium);
  const setIsPremium = usePremiumStore((state) => state.setIsPremium);
  const resetAllDataToDefaults = useSimpleStreamsStore(
    (state) => state.resetAllDataToDefaults
  );

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to reset all data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage key (removes Zustand persist data and any legacy data)
              await AsyncStorage.removeItem(APP_STORAGE_KEY);
              // Reset in-memory state to defaults
              resetAllDataToDefaults();
              // Force save default state in Zustand persist format
              // This ensures the storage is in sync and clears any legacy format
              const defaultState = createDefaultState();
              await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
                state: defaultState,
                version: CURRENT_SCHEMA_VERSION,
              }));
              Alert.alert('Success', 'Data has been reset.');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('Error', 'Failed to reset data.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 12 }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#101A3A" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Premium (Testing)</Text>
              <Text style={styles.settingDescription}>
                Enable premium features for testing
              </Text>
            </View>
            <Switch
              value={isPremium}
              onValueChange={setIsPremium}
              trackColor={{ false: '#E0E0E0', true: '#1A3FBC' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <Text style={styles.resetButtonText}>Reset Data</Text>
          </TouchableOpacity>
          <Text style={styles.resetDescription}>
            This will delete all dashboard views and cash flow streams. Premium status will not be affected.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
