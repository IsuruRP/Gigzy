import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, borderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🚀',
    emojiBg: colors.slide1,
    glowColor: 'rgba(245, 158, 11, 0.2)',
    title: 'Find Your\nPerfect Gig',
    subtitle:
      'Browse thousands of freelance opportunities across every skill and industry — all in one place.',
    dotColor: colors.slide1,
  },
  {
    id: '2',
    emoji: '🤝',
    emojiBg: colors.slide2,
    glowColor: 'rgba(124, 58, 237, 0.2)',
    title: 'Work With\nTop Talent',
    subtitle:
      'Post your project and receive proposals from vetted professionals within hours, not days.',
    dotColor: colors.slide2,
  },
  {
    id: '3',
    emoji: '💳',
    emojiBg: colors.slide3,
    glowColor: 'rgba(16, 185, 129, 0.2)',
    title: 'Get Paid\nSecurely',
    subtitle:
      'Milestone-based escrow payments protect both freelancers and clients on every project.',
    dotColor: colors.slide3,
  },
];

export default function Onboarding() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Background glow blob */}
      <Animated.View
        style={[
          styles.glowBlob,
          {
            backgroundColor: slides[currentIndex].glowColor,
          },
        ]}
      />

      {/* Skip button */}
      {!isLast && (
        <SafeAreaView style={styles.skipWrapper}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* Illustration */}
            <View style={styles.illustrationArea}>
              {/* Outer ring */}
              <View
                style={[
                  styles.outerRing,
                  { borderColor: `${slide.emojiBg}40` },
                ]}
              />
              {/* Inner glow circle */}
              <View
                style={[
                  styles.innerGlow,
                  { backgroundColor: `${slide.emojiBg}20` },
                ]}
              />
              {/* Emoji circle */}
              <View
                style={[
                  styles.emojiCircle,
                  { backgroundColor: `${slide.emojiBg}25`, borderColor: `${slide.emojiBg}60` },
                ]}
              >
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>
              {/* Decorative dots */}
              <View style={[styles.dot1, { backgroundColor: slide.emojiBg }]} />
              <View style={[styles.dot2, { backgroundColor: slide.emojiBg }]} />
              <View style={[styles.dot3, { backgroundColor: slide.emojiBg }]} />
            </View>

            {/* Text */}
            <View style={styles.textArea}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomArea}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((slide, i) => {
            const inputRange = [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: slides[currentIndex].dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={goToNext}
          style={[
            styles.ctaButton,
            { backgroundColor: slides[currentIndex].dotColor },
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Already have account link */}
        {isLast && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
            <Text style={styles.loginLink}>
              Already have an account?{' '}
              <Text style={styles.loginLinkAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowBlob: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: SCREEN_WIDTH,
    opacity: 0.35,
  },
  skipWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingTop: spacing.md,
    paddingRight: spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  illustrationArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  outerRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
  },
  innerGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  emojiCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 60,
  },
  dot1: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.7,
  },
  dot2: {
    position: 'absolute',
    bottom: 22,
    left: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    opacity: 0.5,
  },
  dot3: {
    position: 'absolute',
    bottom: 36,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.4,
  },
  textArea: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  bottomArea: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
    gap: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginLink: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkAccent: {
    color: colors.primary,
    fontWeight: '600',
  },
});
