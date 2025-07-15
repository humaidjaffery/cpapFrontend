import { Stack } from 'expo-router';

export default function SurveyLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="welcome" 
        options={{ 
          title: 'Welcome',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="medical" 
        options={{ 
          title: 'Medical Information',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="instructions" 
        options={{ 
          title: 'Scanning Instructions',
          headerShown: false 
        }} 
      />
    </Stack>
  );
} 