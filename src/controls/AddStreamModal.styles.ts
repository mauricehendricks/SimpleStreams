import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalFormScroll: {
    flex: 1,
  },
  modalForm: {
    gap: 16,
    paddingBottom: 8,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101A3A',
    marginBottom: 8,
  },
  colorPickerContainer: {
    position: 'relative',
    marginBottom: 8,
    zIndex: 1000,
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorPickerPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  colorPickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#101A3A',
    fontWeight: '500',
  },
  colorPickerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  colorPickerDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  colorPickerPopupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  colorPickerDropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#101A3A',
  },
  colorPickerPopupCheck: {
    marginLeft: 8,
  },
  modalPeriodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modalPeriodButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalPeriodButtonActive: {
    backgroundColor: '#1A3FBC',
    borderColor: '#1A3FBC',
  },
  modalPeriodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalPeriodButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#1A3FBC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
