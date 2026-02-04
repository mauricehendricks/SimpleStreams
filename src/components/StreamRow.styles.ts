import { StyleSheet } from 'react-native';

export const streamRowStyles = StyleSheet.create({
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  streamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101A3A',
    marginBottom: 2,
  },
  streamAmount: {
    fontSize: 14,
    color: '#666',
  },
  streamOriginal: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  streamActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
