// remotion/src/scenes/S2.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  Easing,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  FONTS,
  Z_INDEX,
} from "../lib/styles";
import { fadeIn, cameraZoom, scaleIn, slideInLeft, slideInRight } from "../lib/animations";

// Scene S2: background - 겨울 얼음 채취와 빙고 창고
// Duration: 9.3 seconds (279 frames)

// 자막 데이터 (s2_timed.json 기반)
const captions = [
  { text: "조선시대에는 겨울에 강에서 얼음을 채취해", start: 0.0, end: 3.16 },
  { text: "빙고라는 창고에 보관했습니다.", start: 3.16, end: 4.96 },
  { text: "이 얼음은 왕실과 귀족만 누릴 수 있는 특권이었죠.", start: 6.06, end: 9.3 },
];

export const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (카메라 팬 효과: 강에서 창고로)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.05);
  const bgPanX = interpolate(
    frame,
    [0, durationInFrames],
    [20, -20],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 얼음 채취 도구: slideIn from left, sawing motion
  const iceHarvestingX = slideInLeft(frame, 0, 30, 300);
  const iceHarvestingOpacity = fadeIn(frame, 0, 20);
  // Sawing motion (subtle rotation)
  const sawingMotion = interpolate(
    frame,
    [0, 15, 30, 45, 60, 75, 90],
    [0, 5, 0, 5, 0, 5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 빙고 창고: fadeIn with cold mist effect (나레이션 "빙고라는 창고" 시점)
  const binggoStartFrame = Math.round(3.16 * fps);
  const binggoOpacity = fadeIn(frame, binggoStartFrame, 25);
  const binggoScale = scaleIn(frame, binggoStartFrame, 30, 0.8, 1);
  // Mist effect (subtle pulse)
  const mistOpacity = interpolate(
    frame,
    [binggoStartFrame, binggoStartFrame + 30, binggoStartFrame + 60],
    [0, 0.4, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 왕실 문장: popIn with glow at mention of royalty
  const royalStartFrame = Math.round(6.06 * fps);
  const royalOpacity = fadeIn(frame, royalStartFrame, 20);
  const royalScale = scaleIn(frame, royalStartFrame, 25);
  const royalGlow = interpolate(
    frame,
    [royalStartFrame, royalStartFrame + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s2.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale}) translateX(${bgPanX}px)`,
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
            background: "rgba(0, 0, 0, 0.2)",
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}

      {/* 얼음 채취 도구 (center-left) */}
      <Img
        src={staticFile("assets/icons/ice_harvesting.png")}
        style={{
          position: "absolute",
          left: 180,
          top: "45%",
          transform: `translateY(-50%) translateX(${iceHarvestingX}px) rotate(${sawingMotion}deg)`,
          width: IMAGE_SIZES.artifact,
          opacity: iceHarvestingOpacity,
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
          zIndex: Z_INDEX.content,
        }}
      />

      {/* 빙고 창고 (center-right) with mist effect */}
      <div
        style={{
          position: "absolute",
          right: 180,
          top: "45%",
          transform: `translateY(-50%) scale(${binggoScale})`,
          opacity: binggoOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        {/* Cold mist effect */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: -30,
            right: -30,
            bottom: -20,
            background: "radial-gradient(ellipse, rgba(200, 230, 255, 0.6) 0%, transparent 70%)",
            opacity: mistOpacity,
            filter: "blur(15px)",
            zIndex: -1,
          }}
        />
        <Img
          src={staticFile("assets/icons/binggo_storage.png")}
          style={{
            width: IMAGE_SIZES.artifact,
            filter: "drop-shadow(0 4px 12px rgba(100, 150, 200, 0.4))",
          }}
        />
        {/* 라벨 */}
        <div
          style={{
            position: "absolute",
            bottom: -35,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: FONT_SIZES.label,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            whiteSpace: "nowrap",
            opacity: binggoOpacity,
          }}
        >
          빙고
        </div>
      </div>

      {/* 왕실 문장 (top-center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 120,
          transform: `translateX(-50%) scale(${royalScale})`,
          opacity: royalOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <Img
          src={staticFile("assets/icons/royal_emblem.png")}
          style={{
            width: IMAGE_SIZES.iconLarge,
            filter: `drop-shadow(0 0 ${20 * royalGlow}px rgba(255, 215, 0, ${0.6 * royalGlow}))`,
          }}
        />
        {/* 왕실 특권 라벨 */}
        <div
          style={{
            position: "absolute",
            top: IMAGE_SIZES.iconLarge + 10,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: FONT_SIZES.label,
            fontFamily: FONTS.primary,
            fontWeight: 700,
            color: "#FFD700",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
            whiteSpace: "nowrap",
            opacity: royalOpacity,
          }}
        >
          왕실 특권
        </div>
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
            fontSize: CAPTION_STYLE.fontSize,
            fontFamily: CAPTION_STYLE.fontFamily,
            fontWeight: CAPTION_STYLE.fontWeight,
            color: CAPTION_STYLE.color,
            textShadow: CAPTION_STROKE,
            padding: CAPTION_STYLE.padding,
            zIndex: Z_INDEX.caption,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default S2;
