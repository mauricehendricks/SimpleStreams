import { Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from './FloatingAddButton.styles';

interface FloatingAddButtonProps {
  onPress: () => void;
  visible: boolean;
}

export function FloatingAddButton({ onPress, visible }: FloatingAddButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Plus size={32} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
