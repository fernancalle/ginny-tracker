import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  const { theme, isDark } = useTheme();

  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(index);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={segment}
            onPress={() => handlePress(index)}
            style={[
              styles.segment,
              isSelected && [
                styles.selectedSegment,
                { backgroundColor: theme.accent },
              ],
            ]}
          >
            <ThemedText
              style={[
                styles.segmentText,
                { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                isSelected && styles.selectedText,
              ]}
            >
              {segment}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSegment: {},
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedText: {
    fontWeight: "600",
  },
});
