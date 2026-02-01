import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  TEXT_STROKE,
  COLORS,
  Z_INDEX,
} from "../lib/styles";
import {
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleIn,
  cameraZoom,
} from "../lib/animations";

// Scene S17: core2 - 장군의 다양한 용도 비교
// Duration: 16.08 seconds (483 frames at 30fps)
// 테스트용: 배경 포함 렌더링 파이프라인 검증

const captions = [
  { text: "문화재청 자료에 따르면,", start: 0.0, end: 1.36 },
  { text: "'장군'은 어떤 것을 담느냐에 따라", start: 1.36, end: 3.62 },
  { text: "똥장군이 되기도 하고,", start: 3.62, end: 5.26 },
  { text: "왕실에서 사용하는 의례용기가 되기도 하는 재미있는 기물입니다.", start: 5.26, end: 9.24 },
  { text: "같은 모양이라도 무엇을 담느냐에 따라 천지차이가 나는 셈이죠.", start: 10.2, end: 16.08 },
];

export const S17_test: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (cap) => currentTime >= cap.start && currentTime < cap.end
  );

  // ========================================
  // 배경 애니메이션 (Ken Burns 효과)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 똥장군 (왼쪽에서 슬라이드인, 0.5초부터)
  const ttongOpacity = fadeIn(frame, 15, 20);
  const ttongSlideX = slideInLeft(frame, 15, 20, 150);

  // 왕실 장군 (오른쪽에서 슬라이드인, 1초부터)
  const royalOpacity = fadeIn(frame, 30, 20);
  const royalSlideX = slideInRight(frame, 30, 20, 150);

  // VS 텍스트 (중앙, 1.5초부터 스케일인)
  const vsOpacity = fadeIn(frame, 45, 15);
  const vsScale = scaleIn(frame, 45, 15, 0.5, 1);

  // 문화재청 로고 (우하단, 2초부터)
  const logoOpacity = fadeIn(frame, 60, 15);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s17.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale})`,
            transformOrigin: "center center",
          }}
        />
        {/* 다크 오버레이 (가독성 향상) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.25)",
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}

      {/* 똥장군 이미지 (왼쪽) - 테스트용 플레이스홀더 */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          top: "50%",
          transform: `translateX(${ttongSlideX}px) translateY(-50%)`,
          opacity: ttongOpacity,
          zIndex: Z_INDEX.foreground,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 플레이스홀더 박스 (이미지 대체) */}
        <div
          style={{
            width: IMAGE_SIZES.artifactLarge,
            height: IMAGE_SIZES.artifactLarge,
            backgroundColor: COLORS.antique.brown,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${COLORS.antique.sepia}`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ fontSize: 80 }}>💩</span>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: FONT_SIZES.label,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: TEXT_STROKE,
          }}
        >
          똥장군
        </div>
      </div>

      {/* VS 표시 (중앙) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          opacity: vsOpacity,
          zIndex: Z_INDEX.foreground + 10,
        }}
      >
        <span
          style={{
            fontSize: FONT_SIZES.hero,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 800,
            color: "#FFFFFF",
            textShadow: `
              0 0 20px rgba(255, 215, 0, 0.8),
              -3px -3px 0 #000,
              3px -3px 0 #000,
              -3px 3px 0 #000,
              3px 3px 0 #000
            `,
          }}
        >
          VS
        </span>
      </div>

      {/* 왕실 장군 이미지 (오른쪽) - 테스트용 플레이스홀더 */}
      <div
        style={{
          position: "absolute",
          right: "15%",
          top: "50%",
          transform: `translateX(${-royalSlideX}px) translateY(-50%)`,
          opacity: royalOpacity,
          zIndex: Z_INDEX.foreground,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 플레이스홀더 박스 (이미지 대체) */}
        <div
          style={{
            width: IMAGE_SIZES.artifactLarge,
            height: IMAGE_SIZES.artifactLarge,
            background: `linear-gradient(135deg, ${COLORS.antique.gold} 0%, #FFD700 50%, ${COLORS.antique.gold} 100%)`,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #FFD700",
            boxShadow: "0 8px 20px rgba(212, 175, 55, 0.5)",
          }}
        >
          <span style={{ fontSize: 80 }}>👑</span>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: FONT_SIZES.label,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 600,
            color: COLORS.antique.gold,
            textShadow: TEXT_STROKE,
          }}
        >
          의례용 장군
        </div>
      </div>

      {/* 문화재청 출처 표시 (우하단) */}
      <div
        style={{
          position: "absolute",
          right: 30,
          bottom: 100,
          opacity: logoOpacity,
          zIndex: Z_INDEX.ui,
        }}
      >
        <span
          style={{
            fontSize: FONT_SIZES.label * 0.7,
            fontFamily: "Pretendard, sans-serif",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          출처: 문화재청
        </span>
      </div>

      {/* ========================================
          Layer 2: 자막 (최상단)
          ======================================== */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: CAPTION_STYLE.bottom,
            left: 0,
            right: 0,
            textAlign: "center",
            padding: CAPTION_STYLE.padding,
            zIndex: Z_INDEX.caption,
          }}
        >
          <span
            style={{
              fontSize: CAPTION_STYLE.fontSize,
              fontFamily: CAPTION_STYLE.fontFamily,
              fontWeight: CAPTION_STYLE.fontWeight,
              color: CAPTION_STYLE.color,
              textShadow: CAPTION_STROKE,
            }}
          >
            {currentCaption.text}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default S17_test;
