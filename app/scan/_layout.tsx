import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="prepare" 
        options={{ 
          title: 'Prepare to Scan',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="active" 
        options={{ 
          title: 'Scanning',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="review" 
        options={{ 
          title: 'Review Scan',
          headerShown: false 
        }} 
      />
    </Stack>
  );
} 