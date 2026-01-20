import { Stack } from 'expo-router';
import "../globals.css";

export default function ResultsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="summary" 
        options={{ 
          title: 'Scan Results',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="order" 
        options={{ 
          title: 'Order Confirmation',
          headerShown: false 
        }} 
      />
    </Stack>
  );
} 