import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OverviewScreen from "@/screens/OverviewScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type OverviewStackParamList = {
  Overview: undefined;
};

const Stack = createNativeStackNavigator<OverviewStackParamList>();

export default function OverviewStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
