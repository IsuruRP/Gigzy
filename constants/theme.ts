// Design tokens for the Gigzy app
// Dark-mode gig marketplace aesthetic

export const colors = {
  background: '#080B14',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceBorder: 'rgba(255, 255, 255, 0.1)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',

  primary: '#F59E0B',
  primaryDark: '#D97706',
  primaryLight: 'rgba(245, 158, 11, 0.15)',
  primaryGlow: 'rgba(245, 158, 11, 0.25)',

  accent: '#7C3AED',
  accentLight: 'rgba(124, 58, 237, 0.15)',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.12)',

  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.12)',

  inputBg: 'rgba(255, 255, 255, 0.06)',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputBorderFocus: '#F59E0B',

  // Slide accent colors (onboarding)
  slide1: '#F59E0B',
  slide2: '#7C3AED',
  slide3: '#10B981',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  primaryGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
};
