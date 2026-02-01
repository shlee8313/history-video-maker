// remotion/src/scenes/S3.tsx
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
import { fadeIn, cameraZoom, scaleIn, slideInLeft, pulse } from "../lib/animations";

// Scene S3: core1 - 민간 얼음 장사의 반전
// Duration: 8.78 seconds (264 frames)

// 자막 데이터 (s3_timed.json 기반)
const captions = [
  { text: "그런데 여기서 반전!", start: 0.0, end: 1.58 },
  { text: "민간에서도 얼음 장사가 성행했습니다.", start: 2.28, end: 4.4 },
  { text: "겨울에 미리 얼음을 저장해두었다가,", start: 5.26, end: 7.22 },
  { text: "여름에 비싸게 파는 사업이었죠.", start: 7.22, end: 8.78 },
];

export const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (Ken Burns + zoom at "반전")
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.1);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // "반전!" 텍스트: popUp with shake for emphasis at start
  const reversalScale = scaleIn(frame, 0, 20);
  const reversalOpacity = fadeIn(frame, 0, 15);
  // Shake effect (subtle horizontal vibration)
  const shakeX = interpolate(
    frame,
    [5, 8, 11, 14, 17, 20],
    [0, -8, 8, -6, 4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // Fade out after initial emphasis
  const reversalFadeOut = interpolate(
    frame,
    [45, 60],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 얼음 상인: fadeIn with confident pose (starts when "민간에서도" begins)
  const merchantStartFrame = Math.round(2.28 * fps);
  const merchantOpacity = fadeIn(frame, merchantStartFrame, 25);
  const merchantScale = scaleIn(frame, merchantStartFrame, 30, 0.9, 1);

  // 겨울에서 여름 화살표: slideIn showing season transition
  const arrowStartFrame = Math.round(5.26 * fps);
  const arrowX = slideInLeft(frame, arrowStartFrame, 30, 400);
  const arrowOpacity = fadeIn(frame, arrowStartFrame, 20);
  // Arrow glow pulse
  const arrowGlow = pulse(frame, arrowStartFrame, 45, 0.4, 0.8);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s3.png")}
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
            background: "rgba(0, 0, 0, 0.2)",
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}

      {/* "반전!" 텍스트 (top-center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 100,
          transform: `translateX(-50%) translateX(${shakeX}px) scale(${reversalScale})`,
          opacity: reversalOpacity * reversalFadeOut,
          zIndex: Z_INDEX.content,
        }}
      >
        <div
          style={{
            fontSize: FONT_SIZES.hero,
            fontFamily: FONTS.primary,
            fontWeight: 800,
            color: "#FF6B35",
            textShadow: `${TEXT_STROKE}, 0 0 30px rgba(255, 107, 53, 0.6)`,
            letterSpacing: 8,
          }}
        >
          반전!
        </div>
      </div>

      {/* 얼음 상인 (center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: `translate(-50%, -50%) scale(${merchantScale})`,
          opacity: merchantOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <Img
          src={staticFile("assets/portraits/ice_merchant.png")}
          style={{
            width: IMAGE_SIZES.portrait,
            filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))",
          }}
        />
        {/* 상인 라벨 */}
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: FONT_SIZES.label,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
            whiteSpace: "nowrap",
            padding: "4px 16px",
            background: "rgba(139, 69, 19, 0.8)",
            borderRadius: 8,
          }}
        >
          얼음 상인
        </div>
      </div>

      {/* 겨울에서 여름 화살표 (bottom-center, 자막 위) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "26%",
          transform: `translateX(-50%) translateX(${arrowX}px)`,
          opacity: arrowOpacity,
          zIndex: Z_INDEX.content,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* 겨울 */}
        <div
          style={{
            fontSize: FONT_SIZES.subtitle,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            color: "#87CEEB",
            textShadow: `${TEXT_STROKE}, 0 0 15px rgba(135, 206, 235, ${arrowGlow})`,
          }}
        >
          겨울
        </div>
        {/* 화살표 아이콘 */}
        <Img
          src={staticFile("assets/icons/winter_to_summer.png")}
          style={{
            width: IMAGE_SIZES.icon,
            filter: `drop-shadow(0 0 10px rgba(255, 180, 50, ${arrowGlow}))`,
          }}
        />
        {/* 여름 */}
        <div
          style={{
            fontSize: FONT_SIZES.subtitle,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            color: "#FFB347",
            textShadow: `${TEXT_STROKE}, 0 0 15px rgba(255, 179, 71, ${arrowGlow})`,
          }}
        >
          여름
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

export default S3;
