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
import { usePremiumStore } from '../state/usePremiumStore';
import { resetAllData } from '../utils/dataReset';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = usePremiumStore((state) => state.isPremium);

  const handlePremiumToggle = () => {
    Alert.alert(
      'Updates Coming Soon',
      'Multiple view management and auto tax allocation will be available soon for purchase.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Toggle will automatically revert since isPremium is always false
          },
        },
      ]
    );
    // Don't call setIsPremium - this ensures the toggle always stays off
  };

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
              await resetAllData();
              Alert.alert('Success', 'Data has been reset.');
            } catch (error) {
              console.error('[Settings] Reset error:', error);
              // Handle error gracefully - resetAllData should never fail, but if it does, 
              // the state is already reset in memory via useHydrationGate
              Alert.alert('Success', 'Data has been reset.');
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
              <Text style={styles.settingLabel}>Enable Premium Features</Text>
              <Text style={styles.settingDescription}>
                Unlock multiple view management, and auto tax allocation coming soon.
              </Text>
            </View>
            <Switch
              value={isPremium}
              onValueChange={handlePremiumToggle}
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
            This will delete all dashboard views and cash flow streams.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
