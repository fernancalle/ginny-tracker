import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.xs,
  style,
}: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.6]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSecondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <View style={styles.transactionContainer}>
      <SkeletonLoader width={44} height={44} borderRadius={BorderRadius.sm} />
      <View style={styles.transactionContent}>
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
      <View style={styles.transactionAmount}>
        <SkeletonLoader width={80} height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width={50} height={12} />
      </View>
    </View>
  );
}

export function BalanceCardSkeleton() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
      <SkeletonLoader width={100} height={14} style={{ marginBottom: 8, opacity: 0.3 }} />
      <SkeletonLoader width={180} height={40} style={{ marginBottom: 20, opacity: 0.3 }} />
      <View style={styles.statsRow}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width={60} height={12} style={{ marginBottom: 6, opacity: 0.3 }} />
          <SkeletonLoader width={100} height={18} style={{ opacity: 0.3 }} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width={60} height={12} style={{ marginBottom: 6, opacity: 0.3 }} />
          <SkeletonLoader width={100} height={18} style={{ opacity: 0.3 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  transactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  transactionContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  balanceCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
  },
  statsRow: {
    flexDirection: "row",
  },
});
