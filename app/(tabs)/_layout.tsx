import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'QR Scanner',
          tabBarLabel: ({ color }) => (
            <ThemedText style={{ color }}>Scanner</ThemedText>
          ),
        }}
      />
    </Tabs>
  );
}
