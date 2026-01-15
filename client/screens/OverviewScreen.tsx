import React, { useCallback } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionItem } from "@/components/TransactionItem";
import { SectionHeader } from "@/components/SectionHeader";
import { CategoryBar } from "@/components/CategoryBar";
import { EmptyState } from "@/components/EmptyState";
import { BalanceCardSkeleton, TransactionSkeleton } from "@/components/SkeletonLoader";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Transaction } from "@shared/schema";

import emptyTransactionsImage from "../../assets/images/empty-transactions.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<{ income: number; expenses: number }>({
    queryKey: ["/api/stats/monthly"],
  });

  const { data: categories } = useQuery<{ category: string; total: number }[]>({
    queryKey: ["/api/stats/categories"],
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

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate("TransactionDetail", { transaction });
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate("Main", { screen: "TransactionsTab" } as any);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];
  const income = stats?.income || 0;
  const expenses = stats?.expenses || 0;
  const balance = income - expenses;

  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) || 0;

  const isLoading = loadingTransactions || loadingStats;

  const renderHeader = () => (
    <View>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <BalanceCard balance={balance} income={income} expenses={expenses} />
        </Animated.View>
      )}

      {categories && categories.length > 0 ? (
        <>
          <SectionHeader title="Gastos por Categoría" />
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            {categories.slice(0, 4).map((cat) => (
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

      <SectionHeader
        title="Transacciones Recientes"
        actionLabel={recentTransactions.length > 0 ? "Ver todas" : undefined}
        onAction={handleSeeAllTransactions}
      />
    </View>
  );

  const handleLoadDemo = useCallback(() => {
    loadDemoMutation.mutate();
  }, []);

  const renderEmpty = () => {
    if (isLoading || loadDemoMutation.isPending) {
      return (
        <View>
          {[1, 2, 3].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </View>
      );
    }

    return (
      <EmptyState
        image={emptyTransactionsImage}
        title="Sin transacciones"
        message="Sincroniza tus correos bancarios o carga datos de demostración para ver cómo funciona Ginny."
        actionLabel="Cargar demo"
        onAction={handleLoadDemo}
      />
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={recentTransactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(300).delay(300 + index * 50)}>
          <TransactionItem
            transaction={item}
            onPress={() => handleTransactionPress(item)}
          />
        </Animated.View>
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={syncMutation.isPending}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({});
