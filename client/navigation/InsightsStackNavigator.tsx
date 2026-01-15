import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InsightsScreen from "@/screens/InsightsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type InsightsStackParamList = {
  Insights: undefined;
};

const Stack = createNativeStackNavigator<InsightsStackParamList>();

export default function InsightsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          headerTitle: "Insights",
        }}
      />
    </Stack.Navigator>
  );
}
