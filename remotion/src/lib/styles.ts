/**
 * 역사 콘텐츠용 스타일 상수
 *
 * ⚠️ 모든 씬에서 이 파일을 import하여 상수를 사용해야 합니다!
 * 크기 변경 시 이 파일만 수정하면 전체 씬에 반영됩니다.
 */

// ============================================================
// 폰트 크기
// ============================================================
export const FONT_SIZES = {
  // 자막 (화면 하단 고정)
  caption: 45,

  // 일반 텍스트
  label: 36,        // 작은 라벨, 설명
  body: 48,         // 일반 본문
  subtitle: 56,     // 부제목, 중간 크기

  // 강조 텍스트
  title: 72,        // 제목, 지명
  highlight: 96,    // 강조 숫자, 핵심 정보
  hero: 120,        // 최대 강조 (금액, 반전 등)

  // 이모지
  emojiSmall: 50,   // 최소 이모지
  emoji: 80,        // 일반 이모지
  emojiLarge: 120,  // 큰 이모지
} as const;

// ============================================================
// 이미지/아이콘 크기
// ============================================================
export const IMAGE_SIZES = {
  // 아이콘
  iconSmall: 80,    // 작은 아이콘
  icon: 120,        // 일반 아이콘
  iconLarge: 180,   // 큰 아이콘

  // 초상화/인물
  portrait: 280,    // 일반 초상화
  portraitLarge: 350, // 큰 초상화

  // 지도
  map: 500,         // 일반 지도
  mapLarge: 700,    // 큰 지도

  // 유물/오브젝트
  artifact: 200,    // 일반 유물
  artifactLarge: 300, // 큰 유물
} as const;

// ============================================================
// 이모지/요소 크기 비율 (화면 너비 기준)
// ============================================================
// 사용법: const { width } = useVideoConfig();
//        const size = width * ELEMENT_SCALE.emojiLarge;
export const ELEMENT_SCALE = {
  // 이모지 크기 (화면 너비 기준 비율)
  emojiSmall: 0.03,    // ~58px (1920의 3%)
  emoji: 0.05,         // ~96px (1920의 5%)
  emojiLarge: 0.08,    // ~154px (1920의 8%)
  emojiHero: 0.10,     // ~192px (1920의 10%) - 크기 비교용

  // 이미지 크기 (화면 너비 기준 비율)
  imageSmall: 0.08,    // ~154px
  image: 0.12,         // ~230px
  imageLarge: 0.15,    // ~288px
  imageHero: 0.18,     // ~346px - 메인 강조용
} as const;

// ============================================================
// 자막 스타일
// ============================================================
export const CAPTION_STYLE = {
  fontSize: FONT_SIZES.caption,
  fontFamily: "Pretendard, sans-serif",
  fontWeight: 600,
  color: "#000000",
  bottom: 40,
  padding: "0 40px",
  zIndex: 1000,
} as const;

// 자막용 흰 테두리 (검은 글자에 사용)
export const CAPTION_STROKE = `
  -2px -2px 0 #FFF,
   2px -2px 0 #FFF,
  -2px  2px 0 #FFF,
   2px  2px 0 #FFF,
  -3px  0   0 #FFF,
   3px  0   0 #FFF,
   0   -3px 0 #FFF,
   0    3px 0 #FFF
`;

// 일반 텍스트용 검은 테두리 (흰 글자에 사용)
export const TEXT_STROKE = `
  -2px -2px 0 #000,
   2px -2px 0 #000,
  -2px  2px 0 #000,
   2px  2px 0 #000,
  -3px  0   0 #000,
   3px  0   0 #000,
   0   -3px 0 #000,
   0    3px 0 #000
`;

// ============================================================
// 색상 팔레트
// ============================================================
export const COLORS = {
  // Antique 스타일 (역사 콘텐츠 기본)
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

// ============================================================
// 폰트 패밀리
// ============================================================
export const FONTS = {
  primary: "Pretendard, sans-serif",
  korean: {
    serif: "'Gowun Batang', 'Nanum Myeongjo', serif",
    sans: "'Pretendard', 'Noto Sans KR', sans-serif",
  },
  english: {
    serif: "'Playfair Display', 'EB Garamond', serif",
    sans: "'Inter', 'Roboto', sans-serif",
  },
} as const;

// ============================================================
// Z-Index 레이어
// ============================================================
export const Z_INDEX = {
  background: -100,
  midground: 0,
  foreground: 100,
  ui: 200,
  overlay: 300,
  caption: 1000,    // 자막 최상단
} as const;

// ============================================================
// 공통 스타일 객체
// ============================================================
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

// ============================================================
// 스타일 프리셋
// ============================================================
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
