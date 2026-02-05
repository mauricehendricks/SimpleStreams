import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101A3A',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
