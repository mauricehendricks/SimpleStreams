import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './DashboardSkeleton.styles';

function SkeletonItem({ style }: { style: any }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]} />
  );
}

export function DashboardSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 12 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SkeletonItem style={styles.headerTitle} />
          </View>
          <SkeletonItem style={styles.settingsButton} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonItem key={i} style={styles.periodButton} />
          ))}
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          {[1, 2, 3].map((i) => (
            <SkeletonItem key={i} style={styles.tabButton} />
          ))}
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <SkeletonItem style={styles.chartCircle} />
            <View style={styles.chartCenter}>
              <SkeletonItem style={styles.chartValue} />
              <SkeletonItem style={styles.chartBadge} />
            </View>
          </View>
        </View>

        {/* Stream List Items */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.streamRow}>
            <View style={styles.streamLeft}>
              <SkeletonItem style={styles.streamColor} />
              <View style={styles.streamInfo}>
                <SkeletonItem style={styles.streamName} />
                <SkeletonItem style={styles.streamAmount} />
              </View>
            </View>
            <SkeletonItem style={styles.streamPercent} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
