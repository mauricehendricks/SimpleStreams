import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#101A3A',
  },
  textTruncate: {
    maxWidth: 140,
  },
  separator: {
    fontSize: 20,
    color: '#8E8E93',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  touchableText: {
    flexShrink: 1,
    minWidth: 0,
  },
});
