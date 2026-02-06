import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F8FC',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101A3A',
    marginBottom: 16,
  },
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
    color: '#8E8E93',
  },
});
