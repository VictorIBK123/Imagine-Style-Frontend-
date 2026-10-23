import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Input, GoogleIcon } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function AuthLoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { signIn, updateProfile, showAlert } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      showAlert({
        title: 'Required Fields',
        message: 'Please enter your email and password.',
        type: 'warning',
      });
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      showAlert({
        title: 'Required Fields',
        message: 'Please enter your name.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn(email.trim());
      if (authMode === 'signup') {
        if (name.trim()) {
          updateProfile({ name: name.trim(), username: email.split('@')[0] });
        }
        showAlert({
          title: 'Account Created',
          message: 'Welcome to ImagineStyle! Would you like to complete your profile now?',
          type: 'success',
          buttons: [
            {
              text: 'Skip for Now',
              style: 'cancel',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              },
            },
            {
              text: 'Complete Profile',
              style: 'primary',
              onPress: () => {
                router.replace({ pathname: '/edit-profile', params: { mode: 'complete' } });
              },
            },
          ],
        });
      } else {
        showAlert({
          title: 'Welcome Back!',
          message: `Signed in successfully as ${email.trim()}`,
          type: 'success',
          onConfirm: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          },
        });
      }
    }, 600);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn('alex.creator@gmail.com');
      showAlert({
        title: 'Signed In',
        message: 'Authenticated with Google successfully.',
        type: 'success',
        onConfirm: () => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        },
      });
    }, 600);
  };

  return (
    <ScreenContainer>
      {/* Header with Back Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          hitSlop={12}
          style={[styles.backBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
        </Text>

        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Logo & Brand Header */}
          <View style={styles.brandHero}>
            <View
              style={[
                styles.brandCircle,
                { backgroundColor: '#000000', borderColor: colors.cardBorder, overflow: 'hidden' },
              ]}>
              <Image
                source={require('@/assets/images/app-logo.png')}
                style={{ width: 64, height: 64 }}
                contentFit="contain"
              />
            </View>
            <Text style={[styles.brandName, { color: colors.text }]}>ImagineStyle</Text>
            <Text style={[styles.brandMotto, { color: colors.textSecondary }]}>
              {authMode === 'signin'
                ? 'Sign in to generate AI portraits and share your style'
                : 'Join the premier social community for AI photo styling'}
            </Text>
          </View>

          {/* Social Auth (Google Only - Apple Removed) */}
          <View style={styles.socialButtonsWrap}>
            <Button
              variant="outline"
              size="lg"
              onPress={handleGoogleAuth}
              icon={<GoogleIcon size={18} />}
              fullWidth>
              Continue with Google
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              or continue with email
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {authMode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChangeText={setName}
                leftIcon="person-outline"
              />
            )}

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail-outline"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry
            />

            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit}
              style={{ marginTop: 8 }}
              fullWidth>
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            <View style={styles.switchAuthRow}>
              <Text style={[styles.switchPrompt, { color: colors.textSecondary }]}>
                {authMode === 'signin'
                  ? "Don't have an account?"
                  : 'Already have an account?'}
              </Text>
              <Pressable
                onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                hitSlop={8}>
                <Text style={[styles.switchLink, { color: colors.text }]}>
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    gap: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  brandCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandMotto: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  socialButtonsWrap: {
    gap: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formSection: {
    gap: 16,
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  switchPrompt: {
    fontSize: 13,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
