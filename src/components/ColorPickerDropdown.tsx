import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { COLOR_PALETTE } from '../utils/constants';
import { styles } from './ColorPickerDropdown.styles';

interface ColorPickerDropdownProps {
  visible: boolean;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

export function ColorPickerDropdown({
  visible,
  selectedColor,
  onColorSelect,
  onClose,
}: ColorPickerDropdownProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
          {COLOR_PALETTE.map((color) => (
            <TouchableOpacity
              key={color}
              style={styles.dropdownItem}
              onPress={() => {
                onColorSelect(color);
                onClose();
              }}
            >
              <View style={[styles.colorDot, { backgroundColor: color }]} />
              <Text style={styles.dropdownItemText}>Color</Text>
              {selectedColor === color && (
                <Check size={20} color="#1A3FBC" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
