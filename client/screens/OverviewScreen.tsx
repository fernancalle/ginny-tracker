import React, { useCallback, useState } from "react";
import { ScrollView, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { BalanceCard, QuickStats, FinancialSummary } from "@/components/BalanceCard";
import { TransactionItem } from "@/components/TransactionItem";
import { SectionHeader } from "@/components/SectionHeader";
import { CategoryBar } from "@/components/CategoryBar";
import { BankCard } from "@/components/BankCard";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { BalanceCardSkeleton, TransactionSkeleton } from "@/components/SkeletonLoader";
import { apiRequest } from "@/lib/query-client";

interface BankSummary {
  bankName: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Transaction, User } from "@shared/schema";

import emptyTransactionsImage from "../../assets/images/empty-transactions.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [periodIndex, setPeriodIndex] = useState(0);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<{ income: number; expenses: number }>({
    queryKey: ["/api/stats/monthly"],
  });

  const { data: categories } = useQuery<{ category: string; total: number }[]>({
    queryKey: ["/api/stats/categories"],
  });

  const { data: banks } = useQuery<BankSummary[]>({
    queryKey: ["/api/banks"],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/categories"] });
    },
  });

  const loadDemoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/transactions/demo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/categories"] });
    },
  });

  const handleRefresh = useCallback(() => {
    syncMutation.mutate();
  }, []);

  const handleLoadDemo = useCallback(() => {
    loadDemoMutation.mutate();
  }, []);

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate("TransactionDetail", { transaction });
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate("Main", { screen: "TransactionsTab" } as any);
  };

  const handleBankPress = (bankName: string) => {
    navigation.navigate("Main", { 
      screen: "TransactionsTab", 
      params: { 
        screen: "Transactions", 
        params: { filterBank: bankName } 
      } 
    } as any);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];
  const income = stats?.income || 0;
  const expenses = stats?.expenses || 0;
  const balance = income - expenses;
  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) || 0;
  const isLoading = loadingTransactions || loadingStats;
  const userName = user?.name || "Usuario";

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
        refreshControl={
          <RefreshControl
            refreshing={syncMutation.isPending || loadDemoMutation.isPending}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
      >
        <ThemedText type="h1" style={styles.greeting}>
          Hola, {userName}
        </ThemedText>
        <EmptyState
          image={emptyTransactionsImage}
          title="Sin transacciones"
          message="Sincroniza tus correos bancarios o carga datos de demostración para comenzar."
          actionLabel="Cargar demo"
          onAction={handleLoadDemo}
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
      refreshControl={
        <RefreshControl
          refreshing={syncMutation.isPending}
          onRefresh={handleRefresh}
          tintColor={theme.accent}
        />
      }
    >
      <ThemedText type="h1" style={styles.greeting}>
        Hola, {userName}
      </ThemedText>

      <Animated.View entering={FadeInDown.duration(400).delay(50)}>
        <SegmentedControl
          segments={["Último mes", "Año en curso"]}
          selectedIndex={periodIndex}
          onChange={setPeriodIndex}
        />
      </Animated.View>

      <View style={styles.balanceSection}>
        {isLoading ? (
          <BalanceCardSkeleton />
        ) : (
          <BalanceCard balance={balance} />
        )}
      </View>

      {!isLoading ? (
        <>
          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <FinancialSummary income={income} expenses={expenses} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <SectionHeader title="Ingresos y Gastos" showInfo />
            <QuickStats income={income} expenses={expenses} />
          </Animated.View>

          {categories && categories.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(400).delay(250)}>
              <SectionHeader title="Top 3 Categorías" showInfo />
              {categories.slice(0, 3).map((cat) => (
                <CategoryBar
                  key={cat.category}
                  category={cat.category}
                  amount={cat.total}
                  percentage={(cat.total / totalExpenses) * 100}
                />
              ))}
            </Animated.View>
          ) : null}

          {banks && banks.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <SectionHeader title="Mis Cuentas" showInfo />
              {banks.slice(0, 3).map((bank) => (
                <BankCard
                  key={bank.bankName}
                  bank={bank}
                  onPress={() => handleBankPress(bank.bankName)}
                />
              ))}
            </Animated.View>
          ) : null}

          {recentTransactions.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(400).delay(350)}>
              <SectionHeader
                title="Movimientos Recientes"
                actionLabel="Ver todos"
                onAction={handleSeeAllTransactions}
              />
              {recentTransactions.map((txn, index) => (
                <TransactionItem
                  key={txn.id}
                  transaction={txn}
                  onPress={() => handleTransactionPress(txn)}
                />
              ))}
            </Animated.View>
          ) : null}
        </>
      ) : (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginBottom: Spacing.xl,
  },
  balanceSection: {
    marginTop: Spacing.xl,
  },
  skeletonContainer: {
    marginTop: Spacing["2xl"],
  },
});
