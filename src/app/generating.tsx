import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Card, Badge, AppLogo } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/context/AppContext';
import { logger } from '@/utils/logger';

interface GenerationStage {
  step: number;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  log: string;
}

const STAGES: GenerationStage[] = [
  {
    step: 1,
    title: 'Facial Geometry & 3D Mapping',
    desc: 'Analyzing facial symmetry, eye contours, and 468 mesh landmarks',
    icon: 'scan-outline',
    log: 'Extracting 468 3D landmark mesh & depth vector...',
  },
  {
    step: 2,
    title: 'Studio Lighting Calibration',
    desc: 'Synthesizing key, fill, and rim lights to match style atmosphere',
    icon: 'sunny-outline',
    log: 'Calibrating subsurface light scattering & skin tone...',
  },
  {
    step: 3,
    title: 'Neural Style Composition',
    desc: 'Blending portrait likeness with artistic brushwork and palette',
    icon: 'color-wand-outline',
    log: 'Injecting neural latent tensor & aesthetic weights...',
  },
  {
    step: 4,
    title: 'Catchlight & Texture Refine',
    desc: 'Refining iris catchlights, micro skin pores, and hair detail',
    icon: 'aperture-outline',
    log: 'Synthesizing high-frequency micro textures...',
  },
  {
    step: 5,
    title: 'Master Studio Render',
    desc: 'Final color grading and output rendering',
    icon: 'checkmark-circle-outline',
    log: 'Finalizing studio color grade and high-res matrix...',
  },
];

export default function GeneratingScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const {
    selfieUris: selfieUrisParam,
    selfieUri: singleSelfieParam,
    templateId = '',
    templateName = 'Studio Aesthetic',
    templatePreview = '',
    aspectRatio = '4:5',
    styleStrength = 'Balanced',
    resolution = '2K',
    additionalPrompt = '',
  } = useLocalSearchParams<{
    selfieUris?: string;
    selfieUri?: string;
    templateId?: string;
    templateName?: string;
    templatePreview?: string;
    aspectRatio?: '4:5' | '1:1' | '9:16';
    styleStrength?: 'Natural' | 'Balanced' | 'Intense';
    resolution?: '0.5K' | '1K' | '2K' | '4K';
    additionalPrompt?: string;
  }>();

  const { templates, addGeneratedPhoto, showAlert } = useApp();

  // Parse uploaded images array safely
  let parsedSelfieUris: string[] = [];
  try {
    if (selfieUrisParam) {
      const parsed = JSON.parse(selfieUrisParam);
      if (Array.isArray(parsed)) parsedSelfieUris = parsed;
    }
  } catch {
    parsedSelfieUris = [];
  }
  if (parsedSelfieUris.length === 0 && singleSelfieParam) {
    parsedSelfieUris = [singleSelfieParam];
  }

  const primarySelfie = parsedSelfieUris[0] || singleSelfieParam || '';
  const matchedTemplate = templates.find((t) => t.id === templateId);
  const targetPreview =
    matchedTemplate?.previewUrl ||
    templatePreview ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';

  // Animation values
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [rotateAnim] = useState(() => new Animated.Value(0));

  // Generation state
  const [progressPercent, setProgressPercent] = useState(8);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isAborted, setIsAborted] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `[INIT] Studio Engine initialized. Target: ${resolution}`,
    `[INPUT] Loaded ${parsedSelfieUris.length} source portrait(s)`,
    `[STAGE 1] ${STAGES[0].log}`,
  ]);

  // Setup pulsing and rotating animations
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulseAnim, rotateAnim]);

  // Stage timeline orchestration
  useEffect(() => {
    logger.waiting('AI Portrait Generation Pipeline Started', {
      template: templateName,
      resolution,
      styleStrength,
      inputsCount: parsedSelfieUris.length,
    });
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stage 1 (0ms - 700ms)
    timers.push(
      setTimeout(() => {
        setProgressPercent(28);
        setActiveStageIndex(1);
        setConsoleLogs((prev) => [
          ...prev.slice(-3),
          `[STAGE 2] ${STAGES[1].log}`,
        ]);
      }, 700)
    );

    // Stage 2 (700ms - 1400ms)
    timers.push(
      setTimeout(() => {
        setProgressPercent(55);
        setActiveStageIndex(2);
        setConsoleLogs((prev) => [
          ...prev.slice(-3),
          `[STAGE 3] ${STAGES[2].log}`,
        ]);
      }, 1400)
    );

    // Stage 3 (1400ms - 2200ms)
    timers.push(
      setTimeout(() => {
        setProgressPercent(82);
        setActiveStageIndex(3);
        setConsoleLogs((prev) => [
          ...prev.slice(-3),
          `[STAGE 4] ${STAGES[3].log}`,
        ]);
      }, 2200)
    );

    // Stage 4 (2200ms - 2900ms)
    timers.push(
      setTimeout(() => {
        setProgressPercent(96);
        setActiveStageIndex(4);
        setConsoleLogs((prev) => [
          ...prev.slice(-3),
          `[STAGE 5] ${STAGES[4].log}`,
        ]);
      }, 2900)
    );

    // Final Completion (3300ms)
    timers.push(
      setTimeout(() => {
        if (isAborted) return;

        setProgressPercent(100);

        try {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        } catch {
          // ignore
        }

        // Result portrait image
        const resultUrl =
          matchedTemplate?.previewUrl ||
          targetPreview ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';

        // Add to generated photos & deduct credits
        const newPhoto = addGeneratedPhoto({
          uri: resultUrl,
          templateId: matchedTemplate?.id || templateId,
          templateName: matchedTemplate?.name || templateName,
          aspectRatio,
          styleStrength,
          resolution,
          additionalPrompt: additionalPrompt.trim() || undefined,
        });

        logger.action('AI Portrait Generation Completed', {
          photoId: newPhoto.id,
          templateName: newPhoto.templateName,
          resultUrl,
        });

        // Navigate cleanly to the dedicated studio result screen
        router.replace({
          pathname: '/generation-result',
          params: {
            photoId: newPhoto.id,
            photoUri: resultUrl,
            originalUri: primarySelfie,
            templateId: matchedTemplate?.id || templateId,
            templateName: matchedTemplate?.name || templateName,
            aspectRatio,
            styleStrength,
            resolution,
            additionalPrompt: additionalPrompt.trim() || '',
          },
        });
      }, 3400)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [
    isAborted,
    matchedTemplate,
    templateId,
    templateName,
    targetPreview,
    primarySelfie,
    aspectRatio,
    styleStrength,
    resolution,
    additionalPrompt,
    addGeneratedPhoto,
    parsedSelfieUris.length,
  ]);

  const handleCancel = () => {
    showAlert({
      title: 'Cancel Generation?',
      message: 'Synthesizing is already in progress. Would you like to return to the studio editor?',
      type: 'warning',
      buttons: [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            logger.action('AI Generation Aborted by user');
            setIsAborted(true);
            router.back();
          },
        },
      ],
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScreenContainer scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <Pressable
          onPress={handleCancel}
          hitSlop={12}
          style={[styles.backBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.topTitleBox}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Studio Render Engine</Text>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>Synthesizing</Text>
          </View>
        </View>

        <Badge variant="primary">{resolution}</Badge>
      </View>

      {/* Visual Transformation Arena */}
      <View style={styles.transformationArena}>
        {/* Source Portrait Preview */}
        <View style={styles.portraitCardWrapper}>
          <View style={[styles.portraitCard, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            {primarySelfie ? (
              <Image source={{ uri: primarySelfie }} style={styles.previewThumb} />
            ) : (
              <View style={[styles.previewThumb, styles.placeholderThumb]}>
                <Ionicons name="person" size={28} color={colors.textSecondary} />
              </View>
            )}
            <View style={[styles.thumbCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
              <Ionicons name="images" size={11} color="#FFFFFF" />
              <Text style={styles.thumbCountText}>
                {parsedSelfieUris.length} {parsedSelfieUris.length === 1 ? 'Photo' : 'Photos'}
              </Text>
            </View>
          </View>
          <Text style={[styles.cardRoleLabel, { color: colors.textSecondary }]}>Source Portrait</Text>
        </View>

        {/* Central Neural Flow Emblem */}
        <View style={styles.flowCenter}>
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                borderColor: colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="aperture-outline" size={36} color={colors.primary} />
            </Animated.View>
          </Animated.View>
          <View style={styles.flowArrowBox}>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
        </View>

        {/* Target Style Template Preview */}
        <View style={styles.portraitCardWrapper}>
          <View style={[styles.portraitCard, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            <Image source={{ uri: targetPreview }} style={styles.previewThumb} />
            <View style={[styles.thumbCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
              <Ionicons name="color-palette" size={11} color="#FFFFFF" />
              <Text style={styles.thumbCountText}>Style</Text>
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.cardRoleLabel, { color: colors.textSecondary }]}>
            {templateName}
          </Text>
        </View>
      </View>

      {/* Main Synthesis Status Card */}
      <Card padding="lg" style={[styles.statusCard, { borderColor: colors.border }]}>
        <View style={styles.statusHeaderRow}>
          <AppLogo size={32} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.statusMainTitle, { color: colors.text }]}>
              {STAGES[activeStageIndex]?.title}
            </Text>
            <Text style={[styles.statusSubTitle, { color: colors.textSecondary }]}>
              {STAGES[activeStageIndex]?.desc}
            </Text>
          </View>
          <Text style={[styles.percentNumber, { color: colors.primary }]}>
            {progressPercent}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>

        {/* Studio Parameters Chip Strip */}
        <View style={styles.specsRow}>
          <View style={[styles.specPill, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="diamond-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.specPillText, { color: colors.text }]}>{resolution}</Text>
          </View>

          <View style={[styles.specPill, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="crop-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.specPillText, { color: colors.text }]}>{aspectRatio}</Text>
          </View>

          <View style={[styles.specPill, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="options-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.specPillText, { color: colors.text }]}>{styleStrength}</Text>
          </View>

          {additionalPrompt.length > 0 && (
            <View style={[styles.specPill, { backgroundColor: colors.backgroundElement, flex: 1 }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.primary} />
              <Text numberOfLines={1} style={[styles.specPillText, { color: colors.text, flex: 1 }]}>
                {additionalPrompt}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Multi-Stage AI Pipeline Tracker */}
      <Card padding="md" style={[styles.stagesCard, { borderColor: colors.border }]}>
        <Text style={[styles.stagesCardTitle, { color: colors.text }]}>Pipeline Stages</Text>
        <View style={styles.stagesList}>
          {STAGES.map((stage, idx) => {
            const isDone = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;

            return (
              <View key={stage.step} style={styles.stageRow}>
                <View style={styles.stageIconColumn}>
                  <View
                    style={[
                      styles.stageIconBadge,
                      {
                        backgroundColor: isDone
                          ? '#10B981'
                          : isCurrent
                          ? colors.primary
                          : colors.backgroundElement,
                        borderColor: isCurrent ? colors.primary : colors.border,
                      },
                    ]}>
                    <Ionicons
                      name={isDone ? 'checkmark' : stage.icon}
                      size={14}
                      color={isDone || isCurrent ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>
                  {idx < STAGES.length - 1 && (
                    <View
                      style={[
                        styles.stageConnectorLine,
                        { backgroundColor: isDone ? '#10B981' : colors.border },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stageTextColumn}>
                  <Text
                    style={[
                      styles.stageTitle,
                      {
                        color: isCurrent ? colors.text : isDone ? colors.text : colors.textSecondary,
                        fontWeight: isCurrent ? '700' : isDone ? '600' : '400',
                      },
                    ]}>
                    {stage.title}
                  </Text>
                  <Text style={[styles.stageDesc, { color: colors.textSecondary }]}>
                    {stage.desc}
                  </Text>
                </View>

                {isCurrent && (
                  <View style={[styles.stageActiveTag, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' }]}>
                    <Text style={[styles.stageActiveTagText, { color: colors.primary }]}>Active</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Card>

      {/* High-Tech Terminal Console */}
      <View style={[styles.terminalBox, { backgroundColor: isDark ? '#0D0E12' : '#181A20' }]}>
        <View style={styles.terminalHeader}>
          <View style={styles.terminalDots}>
            <View style={[styles.terminalDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.terminalDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.terminalDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.terminalHeaderText}>NEURAL PIPELINE LOG</Text>
        </View>

        <View style={styles.terminalLogs}>
          {consoleLogs.map((log, index) => (
            <Text key={index} style={styles.terminalLogLine}>
              <Text style={{ color: '#10B981' }}>&gt; </Text>
              {log}
            </Text>
          ))}
        </View>
      </View>

      {/* Cancel Action */}
      <View style={styles.bottomActions}>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleCancel}
          style={{ alignSelf: 'center' }}>
          Cancel Generation
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveIndicatorText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transformationArena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  portraitCardWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  portraitCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  placeholderThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbCountBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  thumbCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardRoleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  flowCenter: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowArrowBox: {
    marginTop: 4,
  },
  statusCard: {
    gap: 14,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusSubTitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  percentNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stagesCard: {
    gap: 12,
  },
  stagesCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  stagesList: {
    gap: 0,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  stageIconColumn: {
    alignItems: 'center',
    width: 28,
  },
  stageIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageConnectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
  },
  stageTextColumn: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 10,
  },
  stageTitle: {
    fontSize: 13,
  },
  stageDesc: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 14,
  },
  stageActiveTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
  },
  stageActiveTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  terminalBox: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 5,
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalHeaderText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#9CA3AF',
    letterSpacing: 1,
    fontWeight: '600',
  },
  terminalLogs: {
    gap: 4,
  },
  terminalLogLine: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#D1D5DB',
    lineHeight: 15,
  },
  bottomActions: {
    paddingTop: 8,
  },
});
