import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { formatCurrency } from "@/lib/formatters";
import { useTheme } from "@/hooks/useTheme";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={isDark ? [Colors.dark.primaryDark, Colors.dark.primary] : [Colors.light.primary, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ThemedText style={styles.label} lightColor="#FFFFFF99" darkColor="#FFFFFF99">
          Balance del Mes
        </ThemedText>
        <ThemedText style={styles.balance} lightColor="#FFFFFF" darkColor="#FFFFFF">
          {formatCurrency(balance)}
        </ThemedText>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel} lightColor="#FFFFFF99" darkColor="#FFFFFF99">
              Ingresos
            </ThemedText>
            <ThemedText style={styles.statValue} lightColor="#FFFFFF" darkColor="#FFFFFF">
              +{formatCurrency(income)}
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel} lightColor="#FFFFFF99" darkColor="#FFFFFF99">
              Gastos
            </ThemedText>
            <ThemedText style={styles.statValue} lightColor="#FFFFFF" darkColor="#FFFFFF">
              -{formatCurrency(expenses)}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  gradient: {
    padding: Spacing["2xl"],
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  balance: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: Spacing.lg,
  },
});
