import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Expo's linear gradient

export default function SplashScreen() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  // Show splash for at least 2 seconds for a premium feel
  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && !isLoading) {
      if (token && user) {
        // Direct to role dashboard
        const role = user.role;
        if (role === 'user') {
          router.replace('/(user)' as any);
        } else if (role === 'admin') {
          router.replace('/(admin)' as any);
        } else if (role === 'super_admin') {
          router.replace('/(super_admin)' as any);
        }
      } else {
        // Direct to login
        router.replace('/(auth)/login' as any);
      }
    }
  }, [minTimeElapsed, isLoading, token, user]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8', '#1E1B4B']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="document-text" size={48} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Pengaduan</Text>
        <Text style={styles.subtitle}>Masyarakat</Text>
        <Text style={styles.tagline}>Layanan Aspirasi & Pengaduan Resmi</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        <Text style={styles.version}>Versi 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#93C5FD',
    marginTop: -4,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 13,
    color: '#DBEAFE',
    marginTop: 24,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  version: {
    fontSize: 11,
    color: '#93C5FD',
    opacity: 0.6,
  },
});
