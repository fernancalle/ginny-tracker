import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import TransactionDetailScreen from "@/screens/TransactionDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { Transaction } from "@shared/schema";

export type RootStackParamList = {
  Main: undefined;
  TransactionDetail: { transaction: Transaction };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{
          presentation: "modal",
          headerTitle: "Transaction Details",
        }}
      />
    </Stack.Navigator>
  );
}
