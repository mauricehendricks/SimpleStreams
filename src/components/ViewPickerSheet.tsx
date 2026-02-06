import { Check, Pencil, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { DrawerModal } from './DrawerModal';
import { styles } from './ViewPickerSheet.styles';

interface ViewPickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ViewPickerSheet({
  visible,
  onClose,
}: ViewPickerSheetProps) {
  const [newViewName, setNewViewName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editViewName, setEditViewName] = useState('');
  const views = useSimpleStreamsStore((state) => state.views);
  const activeViewId = useSimpleStreamsStore((state) => state.activeViewId);
  const setActiveView = useSimpleStreamsStore((state) => state.setActiveView);
  const addView = useSimpleStreamsStore((state) => state.addView);
  const updateView = useSimpleStreamsStore((state) => state.updateView);
  const deleteView = useSimpleStreamsStore((state) => state.deleteView);

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    onClose();
  };

  const handleAddView = () => {
    if (newViewName.trim()) {
      addView(newViewName.trim());
      setNewViewName('');
      setShowAddInput(false);
      onClose();
    }
  };

  const handleEditView = (viewId: string, currentName: string) => {
    setEditingViewId(viewId);
    setEditViewName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingViewId && editViewName.trim()) {
      updateView(editingViewId, editViewName.trim());
      setEditingViewId(null);
      setEditViewName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingViewId(null);
    setEditViewName('');
  };

  const handleDeleteView = (viewId: string, viewName: string) => {
    if (views.length <= 1) {
      return; // Can't delete the last view
    }

    Alert.alert(
      'Delete View',
      `Are you sure you want to delete "${viewName}"? This will delete all income and expense streams in this view.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteView(viewId);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <DrawerModal visible={visible} onClose={onClose} title="Select View">
      <ScrollView
        style={styles.modalFormScroll}
        contentContainerStyle={styles.modalForm}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
              {views.map((view) => {
                const isEditing = editingViewId === view.id;
                const canDelete = views.length > 1;

                if (isEditing) {
                  return (
                    <View key={view.id} style={styles.item}>
                      <TextInput
                        style={styles.editInput}
                        value={editViewName}
                        onChangeText={setEditViewName}
                        autoFocus
                        placeholder="View name"
                        placeholderTextColor="#999"
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={handleSaveEdit}
                        >
                          <Text style={styles.editActionButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.editActionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={view.id} style={styles.item}>
                    <TouchableOpacity
                      style={styles.itemContent}
                      onPress={() => handleSelectView(view.id)}
                    >
                      <Text
                        style={styles.itemText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {view.name}
                      </Text>
                      {view.id === activeViewId && (
                        <Check size={20} color="#1A3FBC" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={styles.itemActionButton}
                          onPress={() => handleEditView(view.id, view.name)}
                        >
                          <Pencil size={18} color="#8E8E93" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.itemActionButton,
                            !canDelete && styles.itemActionButtonDisabled,
                          ]}
                          onPress={() =>
                            canDelete
                              ? handleDeleteView(view.id, view.name)
                              : undefined
                          }
                          disabled={!canDelete}
                        >
                          <Trash2
                            size={18}
                            color={canDelete ? '#B71C1C' : '#D0D0D0'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                );
              })}
              {!showAddInput ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => setShowAddInput(true)}
                    >
                      <Plus size={20} color="#1A3FBC" />
                      <Text style={styles.addButtonText}>Add View</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.item}>
                      <TextInput
                        style={styles.editInput}
                        placeholder="View name"
                        placeholderTextColor="#999"
                        value={newViewName}
                        onChangeText={setNewViewName}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={handleAddView}
                        >
                          <Text style={styles.editActionButtonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={() => {
                            setNewViewName('');
                            setShowAddInput(false);
                          }}
                        >
                          <Text style={styles.editActionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
      </ScrollView>
    </DrawerModal>
  );
}
