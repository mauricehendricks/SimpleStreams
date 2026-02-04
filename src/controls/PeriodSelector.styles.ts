import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101A3A',
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonActive: {
    backgroundColor: '#1A3FBC',
    borderColor: '#1A3FBC',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});
