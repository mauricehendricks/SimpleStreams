import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { DrawerModal } from './DrawerModal';
import { styles } from './TaxAllocationSheet.styles';

interface TaxAllocationSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function TaxAllocationSheet({
  visible,
  onClose,
}: TaxAllocationSheetProps) {
  const view = useSimpleStreamsStore((state) => state.getActiveView());
  const setTaxAllocationRate = useSimpleStreamsStore(
    (state) => state.setTaxAllocationRate
  );
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (visible && view) {
      setInputValue(view.taxAllocationRate.toString());
    }
  }, [visible, view]);

  const handleSave = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      setTaxAllocationRate(value);
      onClose();
    }
  };

  const handleQuickSet = (value: number) => {
    setInputValue(value.toString());
  };

  return (
    <DrawerModal visible={visible} onClose={onClose} title="Tax Allocation">
      <ScrollView
        style={styles.modalFormScroll}
        contentContainerStyle={styles.modalForm}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
                <Text style={styles.inputLabel}>
                  Tax rate as percentage of income (0-100)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor="#999"
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="numeric"
                  autoFocus={Platform.OS === 'ios'}
                  showSoftInputOnFocus={true}
                />
                <View style={styles.quickButtons}>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleQuickSet(20)}
                  >
                    <Text style={styles.quickButtonText}>20%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleQuickSet(30)}
                  >
                    <Text style={styles.quickButtonText}>30%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => handleQuickSet(40)}
                  >
                    <Text style={styles.quickButtonText}>40%</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
      </ScrollView>
    </DrawerModal>
  );
}
