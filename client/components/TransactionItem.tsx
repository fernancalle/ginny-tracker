import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { formatCurrency, formatRelativeDate, getCategoryLabel, getCategoryIcon, getCategoryColor } from "@/lib/formatters";
import type { Transaction } from "@shared/schema";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const amount = parseFloat(transaction.amount);
  const isIncome = transaction.type === "income";
  const categoryColor = getCategoryColor(transaction.category, isDark);
  const iconName = getCategoryIcon(transaction.category) as any;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
      testID={`transaction-item-${transaction.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor + "20" }]}>
        <Feather name={iconName} size={20} color={categoryColor} />
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.description} numberOfLines={1}>
          {transaction.description}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.category, { color: theme.textSecondary }]}>
            {getCategoryLabel(transaction.category)}
          </ThemedText>
          {transaction.bankName ? (
            <>
              <ThemedText style={[styles.dot, { color: theme.textSecondary }]}>
                {" • "}
              </ThemedText>
              <ThemedText style={[styles.bank, { color: theme.textSecondary }]}>
                {transaction.bankName}
              </ThemedText>
            </>
          ) : null}
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <ThemedText
          style={[
            styles.amount,
            { color: isIncome ? theme.success : theme.expense },
          ]}
        >
          {isIncome ? "+" : "-"}{formatCurrency(amount)}
        </ThemedText>
        <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
          {formatRelativeDate(transaction.transactionDate)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  description: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
  },
  bank: {
    fontSize: 13,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
});
