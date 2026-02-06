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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#101A3A',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#1A3FBC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
