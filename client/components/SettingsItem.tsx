import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export function SettingsItem({
  icon,
  label,
  value,
  onPress,
  destructive = false,
  showChevron = true,
}: SettingsItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const iconColor = destructive ? theme.expense : theme.accent;
  const textColor = destructive ? theme.expense : theme.text;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
        <Feather
          name={icon as any}
          size={18}
          color={iconColor}
        />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          {label}
        </ThemedText>
      </View>
      {value ? (
        <ThemedText style={[styles.value, { color: theme.textSecondary }]}>
          {value}
        </ThemedText>
      ) : null}
      {showChevron ? (
        <Feather name="chevron-right" size={18} color={theme.textTertiary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 15,
    marginRight: Spacing.sm,
  },
});
