import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar, Button, Input, Card, AppLogo } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCompleteFlow = mode === 'complete';

  const { currentUser, updateProfile, showAlert } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [age, setAge] = useState(currentUser.age || '');
  const [gender, setGender] = useState(currentUser.gender || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [saving, setSaving] = useState(false);

  const handleSkip = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert({
        title: 'Name Required',
        message: 'Please provide a display name.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim() || undefined,
        age: age.trim() || undefined,
        gender: gender.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      });
      setSaving(false);
      showAlert({
        title: isCompleteFlow ? 'Profile Complete!' : 'Profile Saved',
        message: isCompleteFlow
          ? 'Your profile is set up. Welcome to the ImagineStyle community!'
          : 'Your profile details have been successfully updated.',
        type: 'success',
        onConfirm: () => {
          if (isCompleteFlow) {
            router.replace('/');
          } else {
            router.back();
          }
        },
      });
    }, 400);
  };

  const handleChangePhoto = () => {
    showAlert({
      title: 'Change Profile Photo',
      message: 'Select a style look for your avatar portrait',
      icon: 'camera-outline',
      buttons: [
        {
          text: 'Cyberpunk Look',
          onPress: () =>
            updateProfile({
              avatar:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            }),
        },
        {
          text: 'Studio Look',
          onPress: () =>
            updateProfile({
              avatar:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  return (
    <ScreenContainer>
      {/* Header with Navigation / Skip and Save */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {isCompleteFlow ? (
          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            style={styles.skipBtn}>
            <Text style={[styles.skipBtnText, { color: colors.textSecondary }]}>Skip</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={[styles.headerBtn, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        )}

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isCompleteFlow ? 'Complete Profile' : 'Edit Profile'}
        </Text>

        <Button
          size="sm"
          variant="primary"
          loading={saving}
          onPress={handleSave}>
          {isCompleteFlow ? 'Finish' : 'Save'}
        </Button>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Complete Profile Onboarding Banner */}
          {isCompleteFlow && (
            <Card
              padding="md"
              style={[
                styles.onboardingBanner,
                { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
              ]}>
              <View style={styles.bannerRow}>
                <AppLogo size={24} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.bannerTitle, { color: colors.text }]}>
                    Welcome to ImagineStyle!
                  </Text>
                  <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                    Personalize your creator presence. All optional questions can be answered now or completed anytime later.
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar uri={currentUser.avatar} name={name || currentUser.name} size="xl" />
              <Pressable
                onPress={handleChangePhoto}
                style={[styles.cameraIconBtn, { backgroundColor: colors.text }]}>
                <Ionicons name="camera" size={16} color={colors.background} />
              </Pressable>
            </View>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleChangePhoto}
              textStyle={{ color: colors.text, fontWeight: '600' }}>
              Change Photo
            </Button>
          </View>

          {/* Core Identity Fields */}
          <View style={styles.formFields}>
            <Input
              label="Display Name"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChangeText={setName}
              leftIcon="person-outline"
            />

            <View style={{ gap: 6 }}>
              <Input
                label="Username"
                value={`@${currentUser.username}`}
                editable={false}
                leftIcon="lock-closed-outline"
              />
              <Text style={[styles.lockedHint, { color: colors.textSecondary }]}>
                Usernames cannot be changed once set
              </Text>
            </View>

            <Input
              label="Bio (Optional)"
              placeholder="Tell the community about your aesthetic style..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              containerStyle={{ minHeight: 96 }}
            />
          </View>

          {/* Additional Social & Community Details (Optional) */}
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              Community & Details (Optional)
            </Text>

            <View style={styles.formFields}>
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />

              <View style={styles.rowTwoCols}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Age"
                    placeholder="e.g. 24"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    maxLength={3}
                    leftIcon="calendar-outline"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Input
                    label="Pronouns / Gender"
                    placeholder="e.g. they/them"
                    value={gender}
                    onChangeText={setGender}
                    leftIcon="male-female-outline"
                  />
                </View>
              </View>

              <Input
                label="Location"
                placeholder="e.g. London, UK / New York, NY"
                value={location}
                onChangeText={setLocation}
                leftIcon="location-outline"
              />

              <Input
                label="Website or Portfolio Link"
                placeholder="https://instagram.com/yourhandle"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
                leftIcon="globe-outline"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 10, marginTop: 8 }}>
            <Button
              variant="primary"
              size="lg"
              loading={saving}
              onPress={handleSave}>
              {isCompleteFlow ? 'Finish & Explore' : 'Save Changes'}
            </Button>

            {isCompleteFlow && (
              <Button
                variant="ghost"
                size="md"
                onPress={handleSkip}
                textStyle={{ color: colors.textSecondary }}>
                Skip for now
              </Button>
            )}
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
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  onboardingBanner: {
    borderWidth: 1,
    borderRadius: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  formFields: {
    gap: 14,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  lockedHint: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.75,
  },
});
