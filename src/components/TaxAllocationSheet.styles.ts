import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalFormScroll: {
    flex: 1,
  },
  modalForm: {
    gap: 16,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101A3A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#101A3A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 16,
    color: '#1A3FBC',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1A3FBC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
