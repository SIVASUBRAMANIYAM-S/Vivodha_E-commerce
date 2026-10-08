import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VariantSelectorProvider } from '@/components/commerce/VariantSelector';
import { FlyToCartProvider } from '@/components/motion/FlyToCart';
import { ScrollChromeProvider } from '@/components/motion/ScrollChrome';
import { ToastProvider } from '@/components/ui/Toast';
import { queryClient } from '@/lib/query-client';
import { duration, fontAssets, fontFor, lightTheme, ThemeProvider } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonts load while the splash screen is up, so no text ever flashes unstyled.
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <ScrollChromeProvider>
                <FlyToCartProvider>
                  <VariantSelectorProvider>
                    <ToastProvider>
                      <StatusBar style="dark" />
                      <Stack
                        screenOptions={{
                          headerTintColor: lightTheme.primary,
                          headerTitleStyle: {
                            color: lightTheme.textPrimary,
                            fontFamily: fontFor('heading', 'semibold'),
                          },
                          headerShadowVisible: false,
                          headerStyle: { backgroundColor: lightTheme.surface },
                          contentStyle: { backgroundColor: lightTheme.surface },
                        }}
                      >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        {/* Card -> detail: fast route fade plus a scale+fade on the hero image (ADR-138). */}
                        <Stack.Screen
                          name="product/[id]"
                          options={{
                            title: '',
                            animation: 'fade',
                            animationDuration: duration.fast,
                          }}
                        />
                        <Stack.Screen name="category/[slug]" options={{ title: '' }} />
                        <Stack.Screen name="checkout/index" options={{ title: 'Checkout' }} />
                        <Stack.Screen name="orders/index" options={{ title: 'My orders' }} />
                        <Stack.Screen
                          name="shopping-list/index"
                          options={{ title: 'Shopping list' }}
                        />
                        <Stack.Screen name="design-lab" options={{ title: 'Design Lab' }} />
                      </Stack>
                    </ToastProvider>
                  </VariantSelectorProvider>
                </FlyToCartProvider>
              </ScrollChromeProvider>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
