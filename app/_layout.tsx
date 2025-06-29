import { Stack } from "expo-router";
import './globals.css'

export default function RootLayout() {
  return <Stack> 
    <Stack.Screen 
      name="(tabs)"
      options={{
        title: "TABS",
        headerShown: false
      }}
    />
    <Stack.Screen 
      name="scan"
      options={{
        title: "Scan Page",
        headerShown: false
      }}
    />
  </Stack>;
}


