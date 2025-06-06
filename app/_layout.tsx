import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefreshContext } from '@/contexts/refresh_context';
import { Provider as JotaiProvider, useAtom } from "jotai";
import * as jotaistates from '@/contexts/jotaistates';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a component that will handle Jotai state after provider is set up
function AppContent() {
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useAtom(jotaistates.darkModeAtom);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RefreshContext>
          <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="signin" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </RefreshContext>
      </GestureHandlerRootView>
    </GluestackUIProvider>
  );
}

// Main root layout
export default function RootLayout() {
  return (
    <JotaiProvider>
      <AppContent />
    </JotaiProvider>
  );
}
