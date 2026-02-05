import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { TabType } from '../state/types';
import { styles } from './DeleteDialog.styles';

interface DeleteDialogProps {
  visible: boolean;
  activeTab: TabType;
  streamName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({
  visible,
  activeTab,
  streamName,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.content}>
          <Text style={styles.title}>
            Delete {activeTab === 'income' ? 'Income' : 'Expense'}?
          </Text>
          <Text style={styles.message}>
            Are you sure you want to delete "{streamName}"? This action cannot be undone.
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
