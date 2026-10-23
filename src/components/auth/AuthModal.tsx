import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Modal, Button, Input, GoogleIcon } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export function AuthModal() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { isAuthModalVisible, closeAuthModal, signIn, showAlert } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalVisible) return null;

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      showAlert({
        title: 'Required Fields',
        message: 'Please enter your email and password.',
        type: 'warning',
      });
      return;
    }
    signIn(email.trim());
    if (authMode === 'signup') {
      closeAuthModal();
      showAlert({
        title: 'Account Created',
        message: 'Welcome to ImagineStyle! Would you like to complete your profile now?',
        type: 'success',
        buttons: [
          { text: 'Skip for Now', style: 'cancel' },
          {
            text: 'Complete Profile',
            style: 'primary',
            onPress: () => router.push({ pathname: '/edit-profile', params: { mode: 'complete' } }),
          },
        ],
      });
    } else {
      closeAuthModal();
      showAlert({
        title: 'Welcome Back!',
        message: `Signed in successfully as ${email.trim()}`,
        type: 'success',
      });
    }
  };

  const handleOAuth = (provider: 'Google') => {
    signIn();
    showAlert({
      title: 'Signed In',
      message: `Authenticated with ${provider} successfully.`,
      type: 'success',
    });
  };

  return (
    <Modal visible={isAuthModalVisible} onClose={closeAuthModal} title={authMode === 'signin' ? 'Sign In' : 'Create Account'}>
      <View style={styles.container}>
        {/* Branding header */}
        <View style={styles.brandHeader}>
          <View style={[styles.brandIconCircle, { backgroundColor: '#000000', borderColor: colors.cardBorder, borderWidth: 1, overflow: 'hidden' }]}>
            <Image
              source={require('@/assets/images/app-logo.png')}
              style={{ width: 54, height: 54 }}
              contentFit="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>ImagineStyle</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            {authMode === 'signin'
              ? 'Sign in to generate AI portraits and share your style'
              : 'Join the premier social community for AI photo styling'}
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthContainer}>
          <Button
            variant="outline"
            size="md"
            onPress={() => handleOAuth('Google')}
            icon={<GoogleIcon size={18} />}
            fullWidth>
            Continue with Google
          </Button>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with email</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Email & Password inputs */}
        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            autoCapitalize="none"
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
            onPress={handleSubmit}
            style={{ marginTop: 6 }}
            fullWidth>
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
            {authMode === 'signin'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingTop: 4,
  },
  brandHeader: {
    alignItems: 'center',
    gap: 6,
  },
  brandIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  oauthContainer: {
    gap: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 12,
  },
  formContainer: {
    gap: 12,
  },
});
