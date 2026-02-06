import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetAllData } from '../utils/dataReset';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
              Alert.alert(
                'Reset Failed',
                'Failed to reset data. Please try again. If the problem persists, you may need to reinstall the app.',
                [{ text: 'OK' }]
              );
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
