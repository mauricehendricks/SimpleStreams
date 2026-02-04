import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './DrawerModal.styles';

interface DrawerModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string | ReactNode;
}

export function DrawerModal({
  visible,
  onClose,
  children,
  title,
}: DrawerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity
          style={styles.drawerOverlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.drawerContainer}
          keyboardVerticalOffset={0}
        >
          <View style={styles.drawerContent} onStartShouldSetResponder={() => true}>
            <View style={styles.drawerHandle} />
            <View style={styles.modalContent}>
              {title && (
                <View style={styles.modalHeader}>
                  {typeof title === 'string' ? (
                    <Text style={styles.modalTitle}>{title}</Text>
                  ) : (
                    <View style={styles.modalTitleContainer}>{title}</View>
                  )}
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
