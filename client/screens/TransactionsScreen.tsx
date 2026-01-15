import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FlatList, View, StyleSheet, TextInput, RefreshControl, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

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

interface BankSummary {
  bankName: string;
  transactionCount: number;
}

const FILTER_OPTIONS = ["Todas", "Ingresos", "Gastos"];

const BANK_COLORS: Record<string, string> = {
  "Banreservas": "#00A651",
  "Banco Popular": "#0066B3",
  "BHD León": "#E31837",
  "Scotiabank": "#EC111A",
  "Banco Santa Cruz": "#003366",
  "Asociación Popular": "#1E3A5F",
};

function getBankColor(bankName: string): string {
  return BANK_COLORS[bankName] || "#8E8E93";
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndex, setFilterIndex] = useState(0);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.filterBank) {
      setSelectedBank(route.params.filterBank);
    }
  }, [route.params?.filterBank]);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
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

  const handleBankFilter = (bankName: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBank(bankName);
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    let result = transactions;
    
    if (filterIndex === 1) {
      result = result.filter((t) => t.type === "income");
    } else if (filterIndex === 2) {
      result = result.filter((t) => t.type === "expense");
    }
    
    if (selectedBank) {
      result = result.filter((t) => t.bankName === selectedBank);
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
  }, [transactions, filterIndex, searchQuery, selectedBank]);

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
      
      {banks && banks.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bankScroll}
          contentContainerStyle={styles.bankScrollContent}
        >
          <Pressable
            onPress={() => handleBankFilter(null)}
            style={[
              styles.bankChip,
              {
                backgroundColor: selectedBank === null ? theme.accent : theme.backgroundSecondary,
                borderColor: selectedBank === null ? theme.accent : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.bankChipText,
                { color: selectedBank === null ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              Todos
            </ThemedText>
          </Pressable>
          {banks.map((bank) => {
            const isSelected = selectedBank === bank.bankName;
            const bankColor = getBankColor(bank.bankName);
            return (
              <Pressable
                key={bank.bankName}
                onPress={() => handleBankFilter(bank.bankName)}
                style={[
                  styles.bankChip,
                  {
                    backgroundColor: isSelected ? bankColor : theme.backgroundSecondary,
                    borderColor: isSelected ? bankColor : theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.bankChipText,
                    { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  {bank.bankName}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      
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
  bankScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  bankScrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  bankChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  bankChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterContainer: {
    marginTop: Spacing.xs,
  },
});
