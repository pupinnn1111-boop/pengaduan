import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { user, token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inUserGroup = segments[0] === '(user)';
    const inAdminGroup = segments[0] === '(admin)';
    const inSuperAdminGroup = segments[0] === '(super_admin)';
    const inDetailsGroup = segments[0] === 'laporan';

    if (!token || !user) {
      // If not logged in and not in auth screen, redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login' as any);
      }
    } else {
      // If logged in, redirect to respective role dashboard if not already in role pages or detail pages
      const role = user.role;
      if (role === 'user') {
        if (!inUserGroup && !inDetailsGroup) {
          router.replace('/(user)' as any);
        }
      } else if (role === 'admin') {
        if (!inAdminGroup && !inDetailsGroup) {
          router.replace('/(admin)' as any);
        }
      } else if (role === 'super_admin') {
        if (!inSuperAdminGroup && !inDetailsGroup) {
          router.replace('/(super_admin)' as any);
        }
      }
    }
  }, [user, token, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(super_admin)" options={{ headerShown: false }} />
      <Stack.Screen name="laporan/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </AuthProvider>
    </ThemeProvider>
  );
}
