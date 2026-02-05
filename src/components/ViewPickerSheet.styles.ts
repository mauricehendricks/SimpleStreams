import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalFormScroll: {
    flex: 1,
  },
  modalForm: {
    gap: 0,
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 0,
  },
  itemText: {
    fontSize: 16,
    color: '#101A3A',
    fontWeight: '500',
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginLeft: 12,
  },
  itemActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActionButtonDisabled: {
    opacity: 0.5,
  },
  editInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#101A3A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    height: 52, // Fixed height for consistency
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editActionButton: {
    backgroundColor: '#1A3FBC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70, // Fixed minimum width for consistency
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#1A3FBC',
    fontWeight: '600',
  },
});
