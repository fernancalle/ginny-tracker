import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  formatCurrency,
  formatDate,
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColor,
} from "@/lib/formatters";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteProps = RouteProp<RootStackParamList, "TransactionDetail">;

export default function TransactionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const route = useRoute<RouteProps>();
  const { transaction } = route.params;

  const amount = parseFloat(transaction.amount);
  const isIncome = transaction.type === "income";
  const categoryColor = getCategoryColor(transaction.category, isDark);
  const iconName = getCategoryIcon(transaction.category) as any;

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: categoryColor + "20" },
          ]}
        >
          <Feather name={iconName} size={32} color={categoryColor} />
        </View>
        <ThemedText
          style={[
            styles.amount,
            { color: isIncome ? theme.success : theme.expense },
          ]}
        >
          {isIncome ? "+" : "-"}{formatCurrency(amount)}
        </ThemedText>
        <ThemedText type="h2" style={styles.description}>
          {transaction.description}
        </ThemedText>
      </View>

      <Card style={styles.detailsCard}>
        <DetailRow
          label="Categoría"
          value={getCategoryLabel(transaction.category)}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <DetailRow
          label="Tipo"
          value={isIncome ? "Ingreso" : "Gasto"}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <DetailRow
          label="Fecha"
          value={formatDate(transaction.transactionDate)}
          theme={theme}
        />
        {transaction.bankName ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <DetailRow
              label="Banco"
              value={transaction.bankName}
              theme={theme}
            />
          </>
        ) : null}
      </Card>

      <ThemedText style={[styles.footnote, { color: theme.textSecondary }]}>
        Esta transacción fue detectada automáticamente desde tus correos bancarios.
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  amount: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  detailsCard: {
    marginBottom: Spacing["2xl"],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
  footnote: {
    textAlign: "center",
    fontSize: 13,
    paddingHorizontal: Spacing.lg,
  },
});
