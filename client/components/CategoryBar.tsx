import React from "react";
import { StyleSheet, View, Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { formatCompactCurrency, getCategoryLabel, getCategoryColor } from "@/lib/formatters";

interface CategoryBarProps {
  category: string;
  amount: number;
  percentage: number;
}

export function CategoryBar({ category, amount, percentage }: CategoryBarProps) {
  const { theme, isDark } = useTheme();
  const color = getCategoryColor(category, isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText style={styles.label}>
            {getCategoryLabel(category)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.amount, { color: theme.textSecondary }]}>
          {formatCompactCurrency(amount)}
        </ThemedText>
      </View>
      <View style={[styles.barBackground, { backgroundColor: theme.backgroundSecondary }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: `${Math.min(percentage, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});
