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
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { DrawerModal } from './DrawerModal';
import { styles } from './ProfilePickerSheet.styles';

interface ProfilePickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfilePickerSheet({
  visible,
  onClose,
}: ProfilePickerSheetProps) {
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editProfileName, setEditProfileName] = useState('');
  const profiles = useSimpleStreamsStore((state) => state.profiles);
  const activeProfileId = useSimpleStreamsStore((state) => state.activeProfileId);
  const setActiveProfile = useSimpleStreamsStore((state) => state.setActiveProfile);
  const addProfile = useSimpleStreamsStore((state) => state.addProfile);
  const updateProfile = useSimpleStreamsStore((state) => state.updateProfile);
  const deleteProfile = useSimpleStreamsStore((state) => state.deleteProfile);
  const isPremium = usePremiumStore((state) => state.isPremium);

  const handleSelectProfile = (profileId: string) => {
    setActiveProfile(profileId);
    onClose();
  };

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim());
      setNewProfileName('');
      setShowAddInput(false);
      onClose();
    }
  };

  const handleEditProfile = (profileId: string, currentName: string) => {
    setEditingProfileId(profileId);
    setEditProfileName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingProfileId && editProfileName.trim()) {
      updateProfile(editingProfileId, editProfileName.trim());
      setEditingProfileId(null);
      setEditProfileName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingProfileId(null);
    setEditProfileName('');
  };

  const handleDeleteProfile = (profileId: string, profileName: string) => {
    if (profiles.length <= 1) {
      return; // Can't delete the last profile
    }

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profileName}"? This will delete all views and streams in this profile.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProfile(profileId);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <DrawerModal visible={visible} onClose={onClose} title="Select Profile">
      <ScrollView
        style={styles.modalFormScroll}
        contentContainerStyle={styles.modalForm}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
              {profiles.map((profile) => {
                const isEditing = editingProfileId === profile.id;
                const canDelete = profiles.length > 1;

                if (isEditing && isPremium) {
                  return (
                    <View key={profile.id} style={styles.item}>
                      <TextInput
                        style={styles.editInput}
                        value={editProfileName}
                        onChangeText={setEditProfileName}
                        autoFocus
                        placeholder="Profile name"
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
                  <View key={profile.id} style={styles.item}>
                    <TouchableOpacity
                      style={styles.itemContent}
                      onPress={() => handleSelectProfile(profile.id)}
                    >
                      <Text
                        style={styles.itemText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {profile.name}
                      </Text>
                      {profile.id === activeProfileId && (
                        <Check size={20} color="#1A3FBC" />
                      )}
                    </TouchableOpacity>
                    {isPremium && (
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={styles.itemActionButton}
                          onPress={() => handleEditProfile(profile.id, profile.name)}
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
                              ? handleDeleteProfile(profile.id, profile.name)
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
                    )}
                  </View>
                );
              })}
              {isPremium && (
                <>
                  {!showAddInput ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => setShowAddInput(true)}
                    >
                      <Plus size={20} color="#1A3FBC" />
                      <Text style={styles.addButtonText}>Add Profile</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.item}>
                      <TextInput
                        style={styles.editInput}
                        placeholder="Profile name"
                        placeholderTextColor="#999"
                        value={newProfileName}
                        onChangeText={setNewProfileName}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={handleAddProfile}
                        >
                          <Text style={styles.editActionButtonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editActionButton}
                          onPress={() => {
                            setNewProfileName('');
                            setShowAddInput(false);
                          }}
                        >
                          <Text style={styles.editActionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
      </ScrollView>
    </DrawerModal>
  );
}
