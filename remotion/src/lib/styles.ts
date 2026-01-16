/**
 * 역사 콘텐츠용 스타일 상수
 */

// 색상 팔레트
export const COLORS = {
  // Antique 스타일
  antique: {
    gold: "#D4AF37",
    sepia: "#704214",
    parchment: "#F5E6C8",
    ink: "#1a1a1a",
    brown: "#8B4513",
    background: "#2a1a2e",
  },
  // Retro 스타일
  retro: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    background: "#2C3E50",
    text: "#ECF0F1",
  },
  // Minimal 스타일
  minimal: {
    background: "#1a1a1a",
    text: "#ffffff",
    accent: "#3498db",
    secondary: "#95a5a6",
  },
} as const;

// 폰트 패밀리
export const FONTS = {
  korean: {
    serif: "'Gowun Batang', 'Nanum Myeongjo', serif",
    sans: "'Pretendard', 'Noto Sans KR', sans-serif",
  },
  english: {
    serif: "'Playfair Display', 'EB Garamond', serif",
    sans: "'Inter', 'Roboto', sans-serif",
  },
} as const;

// 폰트 크기
export const FONT_SIZES = {
  title: 72,
  subtitle: 48,
  body: 36,
  caption: 24,
  small: 18,
} as const;

// Z-Index 레이어
export const Z_INDEX = {
  background: -100,
  midground: 0,
  foreground: 100,
  ui: 200,
  overlay: 300,
} as const;

// 공통 스타일 객체
export const commonStyles = {
  // 그림자 효과
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",

  // 테두리
  goldBorder: `2px solid ${COLORS.antique.gold}`,

  // 배경 오버레이
  darkOverlay: "rgba(0, 0, 0, 0.7)",
  lightOverlay: "rgba(255, 255, 255, 0.1)",
} as const;

// 스타일별 기본 설정
export const stylePresets = {
  antique: {
    background: COLORS.antique.background,
    textColor: COLORS.antique.parchment,
    accentColor: COLORS.antique.gold,
    fontFamily: FONTS.korean.serif,
  },
  retro: {
    background: COLORS.retro.background,
    textColor: COLORS.retro.text,
    accentColor: COLORS.retro.primary,
    fontFamily: FONTS.korean.sans,
  },
  minimal: {
    background: COLORS.minimal.background,
    textColor: COLORS.minimal.text,
    accentColor: COLORS.minimal.accent,
    fontFamily: FONTS.korean.sans,
  },
} as const;
