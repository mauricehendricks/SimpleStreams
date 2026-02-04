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
  containerCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    minWidth: 0,
    width: '100%',
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
    color: '#666',
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
