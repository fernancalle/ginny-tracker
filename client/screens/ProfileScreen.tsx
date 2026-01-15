import React from "react";
import { View, StyleSheet, Image, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { SettingsItem } from "@/components/SettingsItem";
import { Card } from "@/components/Card";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import type { User, EmailSyncStatus } from "@shared/schema";

import avatarPreset from "../../assets/images/avatar-preset.png";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: syncStatus } = useQuery<EmailSyncStatus>({
    queryKey: ["/api/sync/status"],
  });

  const handleConnectedAccounts = () => {
    Alert.alert(
      "Cuenta Conectada",
      `Tu cuenta de Gmail (${user?.email}) está conectada y sincronizando tus correos bancarios.`,
      [{ text: "OK" }]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      "Notificaciones",
      "Las notificaciones estarán disponibles próximamente.",
      [{ text: "OK" }]
    );
  };

  const handleCurrency = () => {
    Alert.alert(
      "Moneda",
      "Actualmente solo soportamos Peso Dominicano (DOP). Más monedas próximamente.",
      [{ text: "OK" }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "Sobre Ginny",
      "Ginny es tu asistente personal de finanzas. Conecta tu correo y deja que Ginny organice todas tus transacciones bancarias automáticamente.\n\nVersión 1.0.0",
      [{ text: "OK" }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "Para cerrar sesión, desconecta tu cuenta de Gmail desde la configuración de Replit.",
      [{ text: "OK" }]
    );
  };

  const lastSyncText = syncStatus?.lastSyncAt
    ? new Date(syncStatus.lastSyncAt).toLocaleDateString("es-DO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Nunca";

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
          {loadingUser ? (
            <View style={styles.profileContent}>
              <SkeletonLoader width={72} height={72} borderRadius={36} />
              <View style={styles.profileInfo}>
                <SkeletonLoader width={150} height={20} style={{ marginBottom: 8 }} />
                <SkeletonLoader width={200} height={16} />
              </View>
            </View>
          ) : (
            <View style={styles.profileContent}>
              <Image source={avatarPreset} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <ThemedText style={styles.profileName}>{user?.name || "Usuario"}</ThemedText>
                <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
                  {user?.email}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          CONFIGURACIÓN
        </ThemedText>
        
        <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
          <SettingsItem
            icon="mail"
            label="Cuentas Conectadas"
            value={user?.email ? "Gmail" : "No conectado"}
            onPress={handleConnectedAccounts}
          />
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <SettingsItem
            icon="bell"
            label="Notificaciones"
            onPress={handleNotifications}
          />
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <SettingsItem
            icon="dollar-sign"
            label="Moneda"
            value="DOP"
            onPress={handleCurrency}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SINCRONIZACIÓN
        </ThemedText>
        
        <View style={[styles.syncCard, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
          <View style={styles.syncRow}>
            <ThemedText style={[styles.syncLabel, { color: theme.textSecondary }]}>
              Última sincronización
            </ThemedText>
            <ThemedText style={styles.syncValue}>{lastSyncText}</ThemedText>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <View style={styles.syncRow}>
            <ThemedText style={[styles.syncLabel, { color: theme.textSecondary }]}>
              Correos procesados
            </ThemedText>
            <ThemedText style={styles.syncValue}>
              {syncStatus?.syncedEmailCount || 0}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(400)}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          INFORMACIÓN
        </ThemedText>
        
        <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }, !isDark && Shadows.card]}>
          <SettingsItem
            icon="info"
            label="Sobre Ginny"
            onPress={handleAbout}
          />
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <SettingsItem
            icon="log-out"
            label="Cerrar Sesión"
            onPress={handleLogout}
            destructive
            showChevron={false}
          />
        </View>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  syncCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  syncLabel: {
    fontSize: 15,
  },
  syncValue: {
    fontSize: 15,
    fontWeight: "500",
  },
});
