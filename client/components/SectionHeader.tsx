import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  showInfo?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, showInfo = false }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <ThemedText type="h2" style={styles.title}>{title}</ThemedText>
        {showInfo ? (
          <Feather name="info" size={16} color={theme.textTertiary} style={styles.infoIcon} />
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <ThemedText style={[styles.actionLabel, { color: theme.accent }]}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    marginTop: Spacing["2xl"],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  infoIcon: {
    marginLeft: Spacing.sm,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
});
