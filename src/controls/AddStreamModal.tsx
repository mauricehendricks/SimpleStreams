import React from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerModal } from '../components/DrawerModal';
import { ViewPeriod } from '../state/types';
import { getViewPeriodLabel } from '../utils/periodConversion';
import { styles } from './AddStreamModal.styles';

type TabType = 'income' | 'expense' | 'net';

interface AddStreamModalProps {
  visible: boolean;
  activeTab: TabType;
  editingStreamId: string | null;
  streamName: string;
  streamAmount: string;
  streamPeriod: ViewPeriod;
  onNameChange: (name: string) => void;
  onAmountChange: (amount: string) => void;
  onPeriodChange: (period: ViewPeriod) => void;
  onSave: () => void;
  onClose: () => void;
}

export function AddStreamModal({
  visible,
  activeTab,
  editingStreamId,
  streamName,
  streamAmount,
  streamPeriod,
  onNameChange,
  onAmountChange,
  onPeriodChange,
  onSave,
  onClose,
}: AddStreamModalProps) {
  return (
    <DrawerModal
      visible={visible}
      onClose={onClose}
      title={`${editingStreamId ? 'Edit' : 'Add'} ${activeTab === 'income' ? 'Income' : 'Expense'}`}
    >
      <ScrollView
        style={styles.modalFormScroll}
        contentContainerStyle={styles.modalForm}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        <TextInput
          style={styles.input}
          placeholder="Stream name"
          placeholderTextColor="#999"
          value={streamName}
          onChangeText={onNameChange}
          autoFocus={Platform.OS === 'ios'}
          showSoftInputOnFocus={true}
          keyboardType="default"
          editable={true}
        />
        <Text style={styles.inputLabel}>Amount Period:</Text>
                <View style={styles.modalPeriodSelector}>
                  {(['monthly', 'weekly', 'biweekly', 'yearly'] as ViewPeriod[]).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.modalPeriodButton,
                        streamPeriod === period && styles.modalPeriodButtonActive,
                      ]}
                      onPress={() => onPeriodChange(period)}
                    >
                      <Text
                        style={[
                          styles.modalPeriodButtonText,
                          streamPeriod === period && styles.modalPeriodButtonTextActive,
                        ]}
                      >
                        {getViewPeriodLabel(period)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
        <TextInput
          style={styles.input}
          placeholder={`Amount (${getViewPeriodLabel(streamPeriod)})`}
          placeholderTextColor="#999"
          value={streamAmount}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          showSoftInputOnFocus={true}
        />
        <TouchableOpacity style={styles.addButton} onPress={onSave}>
          <Text style={styles.addButtonText}>
            {editingStreamId ? 'Save Changes' : 'Add Stream'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </DrawerModal>
  );
}
