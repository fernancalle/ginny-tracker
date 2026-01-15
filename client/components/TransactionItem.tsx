import React from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
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
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { formatCurrency, formatRelativeDate, getCategoryLabel, getCategoryIcon, getCategoryColor } from "@/lib/formatters";
import type { Transaction } from "@shared/schema";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showCard?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TransactionItem({ transaction, onPress, showCard = true }: TransactionItemProps) {
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

  const containerStyle = [
    styles.container,
    showCard && { 
      backgroundColor: theme.backgroundDefault,
      ...(!isDark ? Shadows.card : {}),
    },
    animatedStyle,
  ];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={containerStyle}
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
          <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
            {formatRelativeDate(transaction.transactionDate)}
          </ThemedText>
          {transaction.bankName ? (
            <>
              <ThemedText style={[styles.dot, { color: theme.textTertiary }]}>
                {" • "}
              </ThemedText>
              <ThemedText style={[styles.bank, { color: theme.textSecondary }]}>
                {transaction.bankName}
              </ThemedText>
            </>
          ) : null}
        </View>
      </View>
      
      <ThemedText
        style={[
          styles.amount,
          { color: isIncome ? theme.success : theme.expense },
        ]}
      >
        {isIncome ? "+" : "-"}{formatCurrency(amount)}
      </ThemedText>
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
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
  },
  bank: {
    fontSize: 13,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
