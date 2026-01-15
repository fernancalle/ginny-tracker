import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { formatCurrency } from "@/lib/formatters";

interface BankSummary {
  bankName: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface BankCardProps {
  bank: BankSummary;
  onPress?: () => void;
}

const BANK_COLORS: Record<string, string> = {
  "Banreservas": "#00A651",
  "Banco Popular": "#0066B3",
  "BHD León": "#E31837",
  "Scotiabank": "#EC111A",
  "Banco Santa Cruz": "#003366",
  "Asociación Popular": "#1E3A5F",
  "Banco BDI": "#FF6600",
  "Banco Caribe": "#00529B",
  "Banco Vimenca": "#006633",
  "Otro": "#8E8E93",
};

function getBankColor(bankName: string): string {
  return BANK_COLORS[bankName] || BANK_COLORS["Otro"];
}

export function BankCard({ bank, onPress }: BankCardProps) {
  const { theme, isDark } = useTheme();
  const bankColor = getBankColor(bank.bankName);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        !isDark && Shadows.card,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.bankIcon, { backgroundColor: bankColor }]}>
          <Feather name="credit-card" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.bankInfo}>
          <ThemedText style={styles.bankName}>{bank.bankName}</ThemedText>
          <ThemedText style={[styles.transactionCount, { color: theme.textSecondary }]}>
            {bank.transactionCount} movimiento{bank.transactionCount !== 1 ? "s" : ""}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textTertiary} />
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.separator }]} />
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Ingresos
          </ThemedText>
          <ThemedText style={[styles.statValue, { color: theme.success }]}>
            {formatCurrency(bank.totalIncome)}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Gastos
          </ThemedText>
          <ThemedText style={[styles.statValue, { color: theme.expense }]}>
            {formatCurrency(bank.totalExpenses)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

interface BankChipProps {
  bankName: string;
  isSelected: boolean;
  onPress: () => void;
}

export function BankChip({ bankName, isSelected, onPress }: BankChipProps) {
  const { theme } = useTheme();
  const bankColor = getBankColor(bankName);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? bankColor : theme.backgroundSecondary,
          borderColor: isSelected ? bankColor : theme.border,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.chipText,
          { color: isSelected ? "#FFFFFF" : theme.textSecondary },
        ]}
      >
        {bankName}
      </ThemedText>
    </Pressable>
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
    alignItems: "center",
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionCount: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
