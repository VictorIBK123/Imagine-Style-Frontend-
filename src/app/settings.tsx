import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Card, Badge } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    currentUser,
    addCredits,
    signOut,
    showAlert,
    showConfirm,
  } = useApp();

  const [highQuality, setHighQuality] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  // Security & Privacy states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const handleToggle2FA = () => {
    showConfirm({
      title: twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication',
      message: twoFactorEnabled
        ? 'Are you sure you want to disable two-factor authentication?'
        : 'Protect your account with an extra verification code on new sign-ins.',
      confirmText: twoFactorEnabled ? 'Disable' : 'Enable',
      destructive: twoFactorEnabled,
      icon: 'shield-checkmark-outline',
      onConfirm: () => {
        const next = !twoFactorEnabled;
        setTwoFactorEnabled(next);
        showAlert({
          title: next ? '2FA Enabled' : '2FA Disabled',
          message: next
            ? 'Two-factor authentication is now active for your account.'
            : 'Two-factor authentication has been turned off.',
          type: next ? 'success' : 'info',
        });
      },
    });
  };

  const handleBlockedAccounts = () => {
    showAlert({
      title: 'Blocked Accounts',
      message: 'You have 0 blocked accounts. Blocked users cannot view your portraits or find your profile in search.',
      type: 'info',
      icon: 'ban-outline',
    });
  };

  const handleDownloadData = () => {
    showConfirm({
      title: 'Download My Data',
      message: `An encrypted export containing your generated portraits, custom prompts, and activity logs will be compiled and sent to ${currentUser.username}@imaginestyle.ai.`,
      confirmText: 'Request Archive',
      icon: 'cloud-download-outline',
      onConfirm: () => {
        showAlert({
          title: 'Archive Requested',
          message: 'Your download link will be prepared and sent shortly.',
          type: 'success',
        });
      },
    });
  };

  const handlePurchase = (amount: number, price: string) => {
    addCredits(amount);
    showAlert({
      title: 'Credits Added',
      message: `Successfully added ${amount} credits for ${price}. Your new balance is ${currentUser.credits + amount} credits.`,
      type: 'success',
      icon: 'flash',
    });
  };

  const handleSignOut = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of ImagineStyle?',
      confirmText: 'Sign Out',
      destructive: true,
      icon: 'log-out-outline',
      onConfirm: () => {
        signOut();
        router.replace('/auth/login');
      },
    });
  };

  return (
    <ScreenContainer>
      {/* Header with Back Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Credits</Text>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Account Card */}
        <Card padding="md" style={styles.userCard}>
          <Avatar
            uri={currentUser.avatar}
            name={currentUser.name}
            size="lg"
            isVerified={currentUser.isVerified}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.userName, { color: colors.text }]}>{currentUser.name}</Text>
            <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
              @{currentUser.username}
            </Text>
          </View>
          <Button
            size="sm"
            variant="outline"
            onPress={() => router.push('/edit-profile')}>
            Edit
          </Button>
        </Card>

        {/* Credits Balance & Top-Up Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Credits Balance
          </Text>

          <Card padding="md" style={[styles.creditsHeroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <View style={styles.creditsHeroTop}>
              <View>
                <Text style={[styles.creditsBalanceCount, { color: colors.text }]}>
                  {currentUser.credits}
                </Text>
                <Text style={[styles.creditsBalanceLabel, { color: colors.textSecondary }]}>
                  Available Generation Credits
                </Text>
              </View>
              <Badge variant="primary" icon="flash">
                Active
              </Badge>
            </View>
            <Text style={[styles.creditCostHint, { color: colors.textSecondary }]}>
              Each standard portrait generation consumes 5 credits.
            </Text>
          </Card>

          {/* Credit Packages (Vertical List) */}
          <View style={styles.packagesVerticalList}>
            {/* Starter */}
            <Card padding="md" style={styles.packageVerticalCard}>
              <View style={styles.packageCardInfo}>
                <Text style={[styles.packageTitle, { color: colors.text }]}>Starter Pack</Text>
                <Text style={[styles.packageCreditsText, { color: colors.text }]}>
                  50 Credits
                </Text>
                <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                  Generates ~10 studio portraits
                </Text>
              </View>

              <View style={styles.packageCardAction}>
                <Text style={[styles.packagePriceText, { color: colors.text }]}>$4.99</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handlePurchase(50, '$4.99')}
                  style={styles.packageActionBtn}>
                  Purchase
                </Button>
              </View>
            </Card>

            {/* Creator (Popular) */}
            <Card padding="md" style={[styles.packageVerticalCard, { borderColor: colors.text, borderWidth: 1.5 }]}>
              <View style={styles.packageCardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.packageTitle, { color: colors.text }]}>Creator Pro</Text>
                  <Badge variant="active">Popular</Badge>
                </View>
                <Text style={[styles.packageCreditsText, { color: colors.text }]}>
                  150 Credits
                </Text>
                <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                  Generates ~30 studio portraits
                </Text>
              </View>

              <View style={styles.packageCardAction}>
                <Text style={[styles.packagePriceText, { color: colors.text }]}>$9.99</Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => handlePurchase(150, '$9.99')}
                  style={styles.packageActionBtn}>
                  Purchase
                </Button>
              </View>
            </Card>

            {/* Studio VIP (Best Value) */}
            <Card padding="md" style={styles.packageVerticalCard}>
              <View style={styles.packageCardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.packageTitle, { color: colors.text }]}>Studio VIP</Text>
                  <Badge variant="official">Best Value</Badge>
                </View>
                <Text style={[styles.packageCreditsText, { color: colors.text }]}>
                  500 Credits
                </Text>
                <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                  Generates ~100 studio portraits
                </Text>
              </View>

              <View style={styles.packageCardAction}>
                <Text style={[styles.packagePriceText, { color: colors.text }]}>$24.99</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handlePurchase(500, '$24.99')}
                  style={styles.packageActionBtn}>
                  Purchase
                </Button>
              </View>
            </Card>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Preferences</Text>

          <Card padding="sm" style={styles.preferencesCard}>
            <View style={styles.preferenceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  High-Resolution Studio Render
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Upscale generated portraits to high-fidelity output
                </Text>
              </View>
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                trackColor={{ false: colors.border, true: colors.text }}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            <View style={styles.preferenceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Likes, comments, and style usage updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.text }}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            <View style={styles.preferenceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Auto-Save to Camera Roll
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Automatically download newly generated photos
                </Text>
              </View>
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: colors.border, true: colors.text }}
              />
            </View>
          </Card>
        </View>

        {/* Security & Privacy Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Security & Privacy</Text>

          <Card padding="sm" style={styles.preferencesCard}>
            {/* Two-Factor Authentication */}
            <Pressable onPress={handleToggle2FA} style={styles.linkRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Two-Factor Authentication (2FA)
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Add an extra layer of security when signing in
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Badge variant={twoFactorEnabled ? 'success' : 'outline'}>
                  {twoFactorEnabled ? 'Active' : 'Off'}
                </Badge>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Biometric App Lock */}
            <View style={styles.preferenceRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Biometric App Lock
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Require Face ID or Touch ID when opening ImagineStyle
                </Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: colors.border, true: colors.text }}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Blocked Accounts */}
            <Pressable onPress={handleBlockedAccounts} style={styles.linkRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Blocked Accounts
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  0 blocked users
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            {/* Download Data */}
            <Pressable onPress={handleDownloadData} style={styles.linkRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Download My Data
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>
                  Export an encrypted archive of your portraits and history
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </Card>
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>About & Support</Text>

          <Card padding="sm" style={styles.preferencesCard}>
            <Pressable
              onPress={() =>
                showAlert({
                  title: 'Help & Support',
                  message: 'Reach our concierge support at support@imaginestyle.ai',
                  icon: 'help-buoy-outline',
                })
              }
              style={styles.linkRow}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Help Center</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() =>
                showAlert({
                  title: 'Privacy Policy',
                  message: 'Your photos are processed privately and never sold.',
                  icon: 'lock-closed-outline',
                })
              }
              style={styles.linkRow}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

            <View style={styles.linkRow}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.preferenceSub, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </Card>
        </View>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="lg"
          onPress={handleSignOut}
          icon={<Ionicons name="log-out-outline" size={18} color="#EF4444" />}
          textStyle={{ color: '#EF4444' }}>
          Sign Out
        </Button>
      </ScrollView>
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
  headerBtn: {
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
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 13,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  creditsHeroCard: {
    borderWidth: 1,
    borderRadius: 16,
    gap: 6,
  },
  creditsHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creditsBalanceCount: {
    fontSize: 32,
    fontWeight: '900',
  },
  creditsBalanceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  creditCostHint: {
    fontSize: 12,
    marginTop: 4,
  },
  packagesVerticalList: {
    gap: 12,
  },
  packageVerticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  packageCardInfo: {
    flex: 1,
    gap: 4,
    marginRight: 16,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  packageCreditsText: {
    fontSize: 18,
    fontWeight: '800',
  },
  packageDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  packageCardAction: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  packagePriceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  packageActionBtn: {
    minWidth: 84,
  },
  preferencesCard: {
    borderRadius: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceSub: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
});
