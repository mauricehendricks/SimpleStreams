import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF0F6',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#101A3A',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A3FBC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  resetButtonText: {
    color: '#101A3A',
    fontSize: 16,
    fontWeight: '600',
  },
});
