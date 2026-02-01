// remotion/src/scenes/S6.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  TEXT_STROKE,
  FONTS,
  Z_INDEX,
} from "../lib/styles";
import { fadeIn, fadeOut, cameraZoom, scaleIn, pulse } from "../lib/animations";

// Scene S6: outro - 따뜻한 마무리
// Duration: 6.78 seconds (204 frames)

// 자막 데이터 (s6_timed.json 기반)
const captions = [
  { text: "냉장고가 당연한 오늘날,", start: 0.0, end: 1.84 },
  { text: "얼음 한 조각의 가치를 다시 생각하게 되네요.", start: 2.1, end: 4.94 },
  { text: "테스트 채널이었습니다!", start: 5.78, end: 6.78 },
];

export const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (gentle zoom out for closure)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.08, 1.0);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 냉장고: fadeIn with door open hint
  const fridgeOpacity = fadeIn(frame, 0, 30);
  const fridgeScale = scaleIn(frame, 0, 35, 0.95, 1);
  // Subtle light glow from inside
  const fridgeGlow = pulse(frame, 0, 90, 0.3, 0.6);

  // 얼음 조각: popIn with nostalgic glow (when "얼음 한 조각" mentioned)
  const iceStartFrame = Math.round(2.1 * fps);
  const iceOpacity = fadeIn(frame, iceStartFrame, 25);
  const iceScale = scaleIn(frame, iceStartFrame, 30);
  // Nostalgic warm glow
  const iceGlow = pulse(frame, iceStartFrame, 50, 0.4, 0.8);

  // 채널명 로고: fadeIn at end with subtle animation
  const logoStartFrame = Math.round(5.0 * fps);
  const logoOpacity = fadeIn(frame, logoStartFrame, 20);
  const logoScale = scaleIn(frame, logoStartFrame, 25, 0.9, 1);
  // Subtle pulse
  const logoPulse = pulse(frame, logoStartFrame, 60, 0.98, 1.02);

  // Overall warm vignette effect (increases toward end)
  const vignetteOpacity = interpolate(
    frame,
    [0, durationInFrames * 0.7, durationInFrames],
    [0, 0.1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Sparkle effects for ice
  const sparkle1 = pulse(frame, iceStartFrame + 10, 35, 0.2, 1);
  const sparkle2 = pulse(frame, iceStartFrame + 20, 40, 0.3, 0.9);
  const sparkle3 = pulse(frame, iceStartFrame + 30, 45, 0.1, 0.8);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s6.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale})`,
            transformOrigin: "center center",
          }}
        />
        {/* Warm overlay for cozy feeling */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `rgba(255, 200, 150, ${0.1 + vignetteOpacity * 0.5})`,
            mixBlendMode: "overlay",
          }}
        />
        {/* Vignette effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, ${vignetteOpacity + 0.2}) 100%)`,
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}

      {/* 냉장고 (center-left) */}
      <div
        style={{
          position: "absolute",
          left: "30%",
          top: "42%",
          transform: `translate(-50%, -50%) scale(${fridgeScale})`,
          opacity: fridgeOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        {/* Inner light glow */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            width: IMAGE_SIZES.iconLarge + 100,
            height: IMAGE_SIZES.iconLarge + 100,
            background: `radial-gradient(circle, rgba(200, 230, 255, ${fridgeGlow}) 0%, transparent 60%)`,
            borderRadius: "50%",
            zIndex: -1,
          }}
        />
        <Img
          src={staticFile("assets/icons/refrigerator.png")}
          style={{
            width: IMAGE_SIZES.iconLarge + 40,
            filter: `drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 ${20 * fridgeGlow}px rgba(200, 230, 255, ${fridgeGlow * 0.5}))`,
          }}
        />
      </div>

      {/* 얼음 조각 (center) */}
      <div
        style={{
          position: "absolute",
          left: "58%",
          top: "42%",
          transform: `translate(-50%, -50%) scale(${iceScale})`,
          opacity: iceOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        {/* Nostalgic warm glow */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: IMAGE_SIZES.icon + 80,
            height: IMAGE_SIZES.icon + 80,
            background: `radial-gradient(circle, rgba(255, 230, 200, ${iceGlow * 0.4}) 0%, transparent 70%)`,
            borderRadius: "50%",
            zIndex: -1,
          }}
        />
        <Img
          src={staticFile("assets/icons/ice_cube_simple.png")}
          style={{
            width: IMAGE_SIZES.icon + 30,
            filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 ${15 * iceGlow}px rgba(135, 206, 235, ${iceGlow * 0.5}))`,
          }}
        />
        {/* Sparkles around ice */}
        <div
          style={{
            position: "absolute",
            top: -15,
            right: 10,
            width: 10,
            height: 10,
            background: "#FFFFFF",
            borderRadius: "50%",
            opacity: sparkle1,
            filter: "blur(1px)",
            boxShadow: "0 0 8px 3px rgba(255, 255, 255, 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            left: -10,
            width: 7,
            height: 7,
            background: "#E0FFFF",
            borderRadius: "50%",
            opacity: sparkle2,
            filter: "blur(1px)",
            boxShadow: "0 0 6px 2px rgba(224, 255, 255, 0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: -5,
            width: 8,
            height: 8,
            background: "#B0E0E6",
            borderRadius: "50%",
            opacity: sparkle3,
            filter: "blur(1px)",
            boxShadow: "0 0 6px 2px rgba(176, 224, 230, 0.5)",
          }}
        />
      </div>

      {/* 채널명 로고 (bottom-center, 자막 위) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "26%",
          transform: `translateX(-50%) scale(${logoScale * logoPulse})`,
          opacity: logoOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <div
          style={{
            fontSize: FONT_SIZES.subtitle,
            fontFamily: FONTS.primary,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: `${TEXT_STROKE}, 0 0 15px rgba(255, 200, 150, 0.5)`,
            letterSpacing: 4,
            padding: "14px 35px",
            background: "linear-gradient(135deg, rgba(139, 69, 19, 0.75) 0%, rgba(180, 100, 50, 0.75) 100%)",
            borderRadius: 15,
            border: "2px solid rgba(212, 175, 55, 0.6)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          테스트 채널
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

export default S6;
