import React, { useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { CategoryBar } from "@/components/CategoryBar";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Card } from "@/components/Card";
import { formatCurrency, getMonthName, getCategoryLabel, getCategoryColor } from "@/lib/formatters";
import type { Transaction } from "@shared/schema";

import emptyInsightsImage from "../../assets/images/empty-insights.png";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<{ category: string; total: number }[]>({
    queryKey: [`/api/stats/categories?year=${selectedYear}&month=${selectedMonth}`],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<{ income: number; expenses: number }>({
    queryKey: [`/api/stats/monthly?year=${selectedYear}&month=${selectedMonth}`],
  });

  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        label: getMonthName(date.getMonth() + 1),
      });
    }
    return result;
  }, []);

  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) || 0;
  const isLoading = loadingTransactions || loadingCategories || loadingStats;

  const weeklyData = useMemo(() => {
    if (!transactions) return [];
    
    const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth, 0);
    
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.transactionDate);
      return date >= startOfMonth && date <= endOfMonth && t.type === 'expense';
    });
    
    const weeks: { label: string; amount: number }[] = [];
    let currentDate = new Date(startOfMonth);
    let weekNum = 1;
    
    while (currentDate <= endOfMonth) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime());
      
      const weekTotal = monthTransactions
        .filter((t) => {
          const date = new Date(t.transactionDate);
          return date >= weekStart && date <= weekEnd;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      weeks.push({
        label: `Sem ${weekNum}`,
        amount: weekTotal,
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNum++;
    }
    
    return weeks;
  }, [transactions, selectedMonth, selectedYear]);

  const maxWeekAmount = Math.max(...weeklyData.map((w) => w.amount), 1);

  if (!isLoading && (!transactions || transactions.length === 0)) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
      >
        <EmptyState
          image={emptyInsightsImage}
          title="Sin datos suficientes"
          message="Aún no tenemos suficientes transacciones para mostrarte información. Sincroniza tus correos bancarios para comenzar."
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.monthScroll}
        contentContainerStyle={styles.monthScrollContent}
      >
        {months.map((m) => {
          const isSelected = m.month === selectedMonth && m.year === selectedYear;
          return (
            <Pressable
              key={`${m.year}-${m.month}`}
              onPress={() => {
                setSelectedMonth(m.month);
                setSelectedYear(m.year);
              }}
              style={[
                styles.monthChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.monthChipText,
                  { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                ]}
              >
                {m.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View>
          <SkeletonLoader height={120} style={{ marginBottom: Spacing.xl }} />
          <SkeletonLoader height={200} />
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Ingresos
                  </ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.success }]}>
                    {formatCurrency(stats?.income || 0)}
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Gastos
                  </ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.expense }]}>
                    {formatCurrency(stats?.expenses || 0)}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.balanceRow}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Balance
                </ThemedText>
                <ThemedText
                  style={[
                    styles.balanceValue,
                    {
                      color:
                        (stats?.income || 0) - (stats?.expenses || 0) >= 0
                          ? theme.success
                          : theme.expense,
                    },
                  ]}
                >
                  {formatCurrency((stats?.income || 0) - (stats?.expenses || 0))}
                </ThemedText>
              </View>
            </Card>
          </Animated.View>

          {weeklyData.length > 0 ? (
            <>
              <SectionHeader title="Tendencia Semanal" />
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <Card style={styles.chartCard}>
                  <View style={styles.barsContainer}>
                    {weeklyData.map((week, index) => (
                      <View key={week.label} style={styles.barColumn}>
                        <View style={styles.barWrapper}>
                          <View
                            style={[
                              styles.bar,
                              {
                                height: `${(week.amount / maxWeekAmount) * 100}%`,
                                backgroundColor: theme.primary,
                              },
                            ]}
                          />
                        </View>
                        <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]}>
                          {week.label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </Card>
              </Animated.View>
            </>
          ) : null}

          {categories && categories.length > 0 ? (
            <>
              <SectionHeader title="Desglose por Categoría" />
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                {categories.map((cat) => (
                  <CategoryBar
                    key={cat.category}
                    category={cat.category}
                    amount={cat.total}
                    percentage={(cat.total / totalExpenses) * 100}
                  />
                ))}
              </Animated.View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthScroll: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.lg,
  },
  monthScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  monthChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  chartCard: {
    padding: Spacing.lg,
  },
  barsContainer: {
    flexDirection: "row",
    height: 120,
    justifyContent: "space-around",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: 24,
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
  },
});
