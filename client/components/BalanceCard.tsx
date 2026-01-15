import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { formatCurrency, getMonthName } from "@/lib/formatters";
import { useTheme } from "@/hooks/useTheme";

interface BalanceCardProps {
  balance: number;
  monthName?: string;
  year?: number;
}

export function BalanceCard({ balance, monthName, year }: BalanceCardProps) {
  const { theme, isDark } = useTheme();
  const now = new Date();
  const displayMonth = monthName || getMonthName(now.getMonth() + 1);
  const displayYear = year || now.getFullYear();

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={[
        styles.container, 
        { backgroundColor: theme.backgroundDefault },
        !isDark && Shadows.card
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          Balance al último mes
        </ThemedText>
        <Feather name="info" size={16} color={theme.textTertiary} />
      </View>
      
      <View style={styles.dateRow}>
        <Feather name="calendar" size={14} color={theme.textSecondary} />
        <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
          {displayMonth} {displayYear}
        </ThemedText>
      </View>
      
      <ThemedText style={[styles.balance, { color: theme.text }]}>
        {formatCurrency(balance)}
      </ThemedText>
    </Animated.View>
  );
}

interface QuickStatsProps {
  income: number;
  expenses: number;
}

export function QuickStats({ income, expenses }: QuickStatsProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
        <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
          Ingresos
        </ThemedText>
        <ThemedText style={[styles.statValue, { color: theme.success }]}>
          {formatCurrency(income)}
        </ThemedText>
      </View>
      <View style={styles.statSpacer} />
      <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
        <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
          Gastos
        </ThemedText>
        <ThemedText style={[styles.statValue, { color: theme.expense }]}>
          {formatCurrency(expenses)}
        </ThemedText>
      </View>
    </View>
  );
}

interface FinancialSummaryProps {
  income: number;
  expenses: number;
}

export function FinancialSummary({ income, expenses }: FinancialSummaryProps) {
  const { theme, isDark } = useTheme();
  const total = income + expenses;
  const spentPercentage = total > 0 ? Math.round((expenses / total) * 100) : 0;
  const balancePercentage = 100 - spentPercentage;
  const savedMore = income > 0 && expenses <= income * 0.8;

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
      <View style={styles.summaryHeader}>
        <ThemedText style={[styles.summaryTitle, { color: theme.text }]}>
          Resumen de tus finanzas
        </ThemedText>
        <Feather name="info" size={16} color={theme.textTertiary} />
      </View>
      
      <View style={styles.circlesContainer}>
        <View style={styles.circleItem}>
          <View style={[styles.circle, styles.circleSpent, { borderColor: theme.accent }]}>
            <ThemedText style={[styles.circlePercent, { color: theme.accent }]}>
              {spentPercentage}%
            </ThemedText>
          </View>
          <ThemedText style={[styles.circleLabel, { color: theme.textSecondary }]}>
            Gastado
          </ThemedText>
        </View>
        
        <View style={styles.circleItem}>
          <View style={[styles.circle, styles.circleBalance, { borderColor: theme.accent, backgroundColor: theme.accent }]}>
            <ThemedText style={[styles.circlePercent, { color: "#FFFFFF" }]}>
              {balancePercentage}%
            </ThemedText>
          </View>
          <ThemedText style={[styles.circleLabel, { color: theme.textSecondary }]}>
            Balance
          </ThemedText>
        </View>
      </View>
      
      {savedMore ? (
        <View style={[styles.tipContainer, { backgroundColor: theme.accent + "15" }]}>
          <View style={[styles.tipDot, { backgroundColor: theme.success }]} />
          <ThemedText style={[styles.tipText, { color: theme.text }]}>
            Ahorraste más del 20% de tus ingresos.
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  statSpacer: {
    width: Spacing.md,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  summaryCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  circlesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["4xl"],
    marginBottom: Spacing.xl,
  },
  circleItem: {
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  circleSpent: {
    backgroundColor: "transparent",
  },
  circleBalance: {},
  circlePercent: {
    fontSize: 18,
    fontWeight: "700",
  },
  circleLabel: {
    fontSize: 13,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
