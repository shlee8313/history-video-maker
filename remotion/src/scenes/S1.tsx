// remotion/src/scenes/S1.tsx
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
import { fadeIn, cameraZoom, scaleIn, pulse } from "../lib/animations";

// Scene S1: hook - 여름 얼음 인트로
// Duration: 6.06 seconds (182 frames)

// 자막 데이터 (s1_timed.json 기반)
const captions = [
  { text: "여러분, 냉장고 없던 조선시대에도", start: 0.0, end: 2.42 },
  { text: "한여름에 시원한 얼음을 먹을 수 있었다는 사실,", start: 2.42, end: 5.24 },
  { text: "알고 계셨나요?", start: 5.24, end: 6.06 },
];

export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (Ken Burns 효과)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 태양 아이콘: fadeIn at start, subtle glow pulse
  const sunOpacity = fadeIn(frame, 0, 20);
  const sunGlow = pulse(frame, 0, 60, 1, 1.15);

  // 얼음 블록: popIn with sparkle effect, slight float animation
  const iceScale = scaleIn(frame, 15, 25);
  const iceOpacity = fadeIn(frame, 15, 20);
  // Float animation (subtle up-down)
  const iceFloat = interpolate(
    frame,
    [0, 45, 90, 135, durationInFrames],
    [0, -8, 0, -8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 물음표: fadeIn at end with bounce
  const questionStartFrame = Math.round(5.24 * fps); // When "알고 계셨나요?" starts
  const questionOpacity = fadeIn(frame, questionStartFrame - 15, 15);
  const questionScale = scaleIn(frame, questionStartFrame - 15, 20);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s1.png")}
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
            background: "rgba(0, 0, 0, 0.15)",
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}

      {/* 태양 아이콘 (top-right) */}
      <Img
        src={staticFile("assets/icons/sun_icon.png")}
        style={{
          position: "absolute",
          right: 150,
          top: 100,
          width: IMAGE_SIZES.iconLarge,
          opacity: sunOpacity,
          transform: `scale(${sunGlow})`,
          filter: "drop-shadow(0 0 30px rgba(255, 200, 50, 0.6))",
          zIndex: Z_INDEX.content,
        }}
      />

      {/* 얼음 블록 (center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: `translate(-50%, -50%) translateY(${iceFloat}px) scale(${iceScale})`,
          opacity: iceOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <Img
          src={staticFile("assets/icons/ice_block.png")}
          style={{
            width: IMAGE_SIZES.artifactLarge,
            filter: "drop-shadow(0 0 20px rgba(135, 206, 250, 0.5))",
          }}
        />
        {/* 반짝임 효과 */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            width: 15,
            height: 15,
            background: "white",
            borderRadius: "50%",
            opacity: pulse(frame, 20, 40, 0.3, 1),
            filter: "blur(2px)",
            boxShadow: "0 0 10px 5px rgba(255, 255, 255, 0.5)",
          }}
        />
      </div>

      {/* 물음표 (bottom-center, 자막 영역 위) */}
      <Img
        src={staticFile("assets/icons/question_mark.png")}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "28%",
          transform: `translateX(-50%) scale(${questionScale})`,
          width: IMAGE_SIZES.icon,
          opacity: questionOpacity,
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
          zIndex: Z_INDEX.content,
        }}
      />

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

export default S1;
