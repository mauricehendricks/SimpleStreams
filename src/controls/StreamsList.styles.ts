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
  taxRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  taxBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  taxBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A3FBC',
  },
  autoBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A3FBC',
  },
  deleteButtonDisabled: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
});
