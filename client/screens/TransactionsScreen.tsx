import React, { useState, useCallback, useMemo } from "react";
import { FlatList, View, StyleSheet, TextInput, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TransactionItem } from "@/components/TransactionItem";
import { EmptyState } from "@/components/EmptyState";
import { TransactionSkeleton } from "@/components/SkeletonLoader";
import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Transaction } from "@shared/schema";

import emptyTransactionsImage from "../../assets/images/empty-transactions.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_OPTIONS = ["Todas", "Ingresos", "Gastos"];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndex, setFilterIndex] = useState(0);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
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

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    let result = transactions;
    
    if (filterIndex === 1) {
      result = result.filter((t) => t.type === "income");
    } else if (filterIndex === 2) {
      result = result.filter((t) => t.type === "expense");
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.bankName?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [transactions, filterIndex, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar movimientos..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Feather name="x-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      
      <View style={styles.filterContainer}>
        <SegmentedControl
          segments={FILTER_OPTIONS}
          selectedIndex={filterIndex}
          onChange={setFilterIndex}
        />
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading || loadDemoMutation.isPending) {
      return (
        <View>
          {[1, 2, 3, 4, 5].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </View>
      );
    }

    return (
      <EmptyState
        image={emptyTransactionsImage}
        title={searchQuery ? "Sin resultados" : "Sin movimientos"}
        message={
          searchQuery
            ? "No encontramos movimientos que coincidan con tu búsqueda."
            : "Sincroniza tus correos o carga datos de demostración."
        }
        actionLabel={searchQuery ? undefined : "Cargar demo"}
        onAction={searchQuery ? undefined : handleLoadDemo}
      />
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={filteredTransactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(300).delay(index * 30)}>
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
          tintColor={theme.accent}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  filterContainer: {
    marginTop: Spacing.xs,
  },
});
