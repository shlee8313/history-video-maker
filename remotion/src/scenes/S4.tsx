// remotion/src/scenes/S4.tsx
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
  TEXT_STROKE,
  FONTS,
  Z_INDEX,
} from "../lib/styles";
import { fadeIn, cameraZoom, scaleIn, slideInRight, pulse } from "../lib/animations";

// Scene S4: core2 - 황금 얼음의 가치
// Duration: 9.32 seconds (280 frames)

// 자막 데이터 (s4_timed.json 기반)
const captions = [
  { text: "당시 얼음값은 어마어마했습니다.", start: 0.0, end: 2.36 },
  { text: "여름철 얼음 한 덩이 값이", start: 3.34, end: 5.2 },
  { text: "쌀 두세 말과 맞먹었다고 해요.", start: 5.2, end: 7.02 },
  { text: "그야말로 황금 얼음이었던 셈이죠.", start: 7.64, end: 9.32 },
];

export const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (zoom in on comparison)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.12);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 황금빛 얼음: fadeIn with golden glow effect (starts at beginning)
  const iceOpacity = fadeIn(frame, 0, 25);
  const iceScale = scaleIn(frame, 0, 30, 0.8, 1);
  // Golden glow pulse
  const iceGlow = pulse(frame, 0, 60, 0.4, 1);

  // 쌀자루: slideIn from right (when "쌀 두세 말" mentioned)
  const riceStartFrame = Math.round(5.2 * fps);
  const riceX = slideInRight(frame, riceStartFrame, 30, 300);
  const riceOpacity = fadeIn(frame, riceStartFrame, 20);
  const riceScale = scaleIn(frame, riceStartFrame, 25);

  // 등호 (=): popIn to emphasize comparison
  const equalsStartFrame = Math.round(3.34 * fps);
  const equalsOpacity = fadeIn(frame, equalsStartFrame, 15);
  const equalsScale = scaleIn(frame, equalsStartFrame, 20);
  // Pulse effect for emphasis
  const equalsPulse = pulse(frame, equalsStartFrame, 40, 0.9, 1.1);

  // "황금 얼음" 텍스트: appears at end
  const goldenTextStartFrame = Math.round(7.64 * fps);
  const goldenTextOpacity = fadeIn(frame, goldenTextStartFrame, 20);
  const goldenTextScale = scaleIn(frame, goldenTextStartFrame, 25);

  // Golden sparkle effect (continuous)
  const sparkleOpacity1 = pulse(frame, 15, 30, 0.2, 1);
  const sparkleOpacity2 = pulse(frame, 25, 35, 0.3, 0.9);
  const sparkleOpacity3 = pulse(frame, 40, 40, 0.1, 0.8);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s4.png")}
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

      {/* 비교 컨테이너 (center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          zIndex: Z_INDEX.content,
        }}
      >
        {/* 황금빛 얼음 (center-left) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${iceScale})`,
            opacity: iceOpacity,
          }}
        >
          {/* Glow effect behind ice */}
          <div
            style={{
              position: "absolute",
              width: IMAGE_SIZES.artifactLarge + 80,
              height: IMAGE_SIZES.artifactLarge + 80,
              background: `radial-gradient(circle, rgba(255, 215, 0, ${0.3 * iceGlow}) 0%, transparent 70%)`,
              borderRadius: "50%",
              zIndex: -1,
            }}
          />
          <Img
            src={staticFile("assets/icons/ice_block_golden.png")}
            style={{
              width: IMAGE_SIZES.artifactLarge,
              filter: `drop-shadow(0 0 ${20 * iceGlow}px rgba(255, 215, 0, ${0.6 * iceGlow}))`,
            }}
          />
          {/* Sparkles */}
          <div
            style={{
              position: "absolute",
              top: -10,
              right: 20,
              width: 12,
              height: 12,
              background: "#FFD700",
              borderRadius: "50%",
              opacity: sparkleOpacity1,
              filter: "blur(1px)",
              boxShadow: "0 0 10px 4px rgba(255, 215, 0, 0.6)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 0,
              width: 8,
              height: 8,
              background: "#FFFACD",
              borderRadius: "50%",
              opacity: sparkleOpacity2,
              filter: "blur(1px)",
              boxShadow: "0 0 8px 3px rgba(255, 250, 205, 0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 50,
              right: -10,
              width: 10,
              height: 10,
              background: "#FFE066",
              borderRadius: "50%",
              opacity: sparkleOpacity3,
              filter: "blur(1px)",
              boxShadow: "0 0 8px 3px rgba(255, 224, 102, 0.5)",
            }}
          />
          {/* 얼음 라벨 */}
          <div
            style={{
              marginTop: 15,
              fontSize: FONT_SIZES.label,
              fontFamily: FONTS.primary,
              fontWeight: 600,
              color: "#FFD700",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              whiteSpace: "nowrap",
            }}
          >
            얼음 한 덩이
          </div>
        </div>

        {/* 등호 (=) */}
        <div
          style={{
            fontSize: FONT_SIZES.hero,
            fontFamily: FONTS.primary,
            fontWeight: 800,
            color: "#FFFFFF",
            textShadow: `${TEXT_STROKE}, 0 0 20px rgba(255, 255, 255, 0.5)`,
            opacity: equalsOpacity,
            transform: `scale(${equalsScale * equalsPulse})`,
          }}
        >
          =
        </div>

        {/* 쌀자루 (center-right) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateX(${riceX}px) scale(${riceScale})`,
            opacity: riceOpacity,
          }}
        >
          <Img
            src={staticFile("assets/icons/rice_bags.png")}
            style={{
              width: IMAGE_SIZES.artifact,
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))",
            }}
          />
          {/* 쌀 라벨 */}
          <div
            style={{
              marginTop: 15,
              fontSize: FONT_SIZES.label,
              fontFamily: FONTS.primary,
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              whiteSpace: "nowrap",
            }}
          >
            쌀 두세 말
          </div>
        </div>
      </div>

      {/* "황금 얼음" 강조 텍스트 (bottom-center, 자막 위) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "26%",
          transform: `translateX(-50%) scale(${goldenTextScale})`,
          opacity: goldenTextOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <div
          style={{
            fontSize: FONT_SIZES.title,
            fontFamily: FONTS.primary,
            fontWeight: 800,
            color: "#FFD700",
            textShadow: `${TEXT_STROKE}, 0 0 25px rgba(255, 215, 0, 0.6)`,
            letterSpacing: 6,
          }}
        >
          황금 얼음
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

export default S4;
