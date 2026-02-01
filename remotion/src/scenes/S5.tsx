// remotion/src/scenes/S5.tsx
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
import { fadeIn, cameraZoom, slideInLeft, slideInRight, scaleIn, drawLine } from "../lib/animations";

// Scene S5: insight - 과거와 현재의 연결
// Duration: 8.88 seconds (267 frames)

// 자막 데이터 (s5_timed.json 기반)
const captions = [
  { text: "조선의 얼음 장수들은", start: 0.0, end: 1.78 },
  { text: "오늘날의 콜드체인 물류 사업가들과 다르지 않았습니다.", start: 1.78, end: 5.82 },
  { text: "기술과 자본이 결합된 최첨단 비즈니스였던 거죠.", start: 6.14, end: 8.88 },
];

export const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (wide shot)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.06);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================

  // 조선 상인 (왼쪽): fadeIn from left
  const joseonStartFrame = 0;
  const joseonX = slideInLeft(frame, joseonStartFrame, 30, 300);
  const joseonOpacity = fadeIn(frame, joseonStartFrame, 25);
  const joseonScale = scaleIn(frame, joseonStartFrame, 35, 0.9, 1);

  // 현대 트럭 (오른쪽): fadeIn from right (when "오늘날" mentioned)
  const truckStartFrame = Math.round(1.78 * fps);
  const truckX = slideInRight(frame, truckStartFrame, 30, 300);
  const truckOpacity = fadeIn(frame, truckStartFrame, 25);
  const truckScale = scaleIn(frame, truckStartFrame, 35, 0.9, 1);

  // 연결선: draw animation connecting both (center에서 확장)
  const lineStartFrame = Math.round(3.0 * fps);
  const lineProgress = drawLine(frame, lineStartFrame, 40);
  const lineWidth = interpolate(
    frame,
    [lineStartFrame, lineStartFrame + 40],
    [0, 400],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lineOpacity = fadeIn(frame, lineStartFrame, 20);

  // "기술 + 자본" 텍스트: typewriter effect at end
  const textStartFrame = Math.round(6.14 * fps);
  const text = "기술 + 자본";
  const textOpacity = fadeIn(frame, textStartFrame, 20);
  const textScale = scaleIn(frame, textStartFrame, 25);
  // Typewriter effect
  const charsToShow = interpolate(
    frame,
    [textStartFrame, textStartFrame + 50],
    [0, text.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayText = text.slice(0, Math.floor(charsToShow));

  // Glow effect for connection
  const glowOpacity = interpolate(
    frame,
    [lineStartFrame + 30, lineStartFrame + 45],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s5.png")}
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

      {/* 조선 상인 (왼쪽) */}
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "42%",
          transform: `translate(-50%, -50%) translateX(${joseonX}px) scale(${joseonScale})`,
          opacity: joseonOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        {/* Sepia filter overlay */}
        <div
          style={{
            position: "relative",
          }}
        >
          <Img
            src={staticFile("assets/portraits/joseon_merchant.png")}
            style={{
              width: IMAGE_SIZES.portrait,
              filter: "sepia(0.3) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))",
            }}
          />
          {/* Label */}
          <div
            style={{
              position: "absolute",
              bottom: -45,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: FONT_SIZES.label,
              fontFamily: FONTS.primary,
              fontWeight: 600,
              color: "#F5E6C8",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              whiteSpace: "nowrap",
              padding: "6px 18px",
              background: "rgba(112, 66, 20, 0.85)",
              borderRadius: 8,
              border: "1px solid #D4AF37",
            }}
          >
            조선 얼음 장수
          </div>
        </div>
      </div>

      {/* 연결선 (center) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          zIndex: Z_INDEX.content,
          opacity: lineOpacity,
        }}
      >
        {/* Glow behind line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: lineWidth + 60,
            height: 30,
            background: `radial-gradient(ellipse, rgba(212, 175, 55, ${glowOpacity}) 0%, transparent 70%)`,
            borderRadius: 15,
          }}
        />
        {/* Main line */}
        <div
          style={{
            width: lineWidth,
            height: 6,
            background: "linear-gradient(90deg, #8B4513, #D4AF37, #4FC3F7)",
            borderRadius: 3,
            boxShadow: `0 0 15px rgba(212, 175, 55, ${glowOpacity})`,
          }}
        />
        {/* Arrow heads */}
        {lineWidth > 50 && (
          <>
            <div
              style={{
                position: "absolute",
                left: -10,
                top: -7,
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderRight: "15px solid #8B4513",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -10,
                top: -7,
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "15px solid #4FC3F7",
              }}
            />
          </>
        )}
      </div>

      {/* 현대 트럭 (오른쪽) */}
      <div
        style={{
          position: "absolute",
          right: "18%",
          top: "42%",
          transform: `translate(50%, -50%) translateX(${truckX}px) scale(${truckScale})`,
          opacity: truckOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <Img
            src={staticFile("assets/icons/modern_truck.png")}
            style={{
              width: IMAGE_SIZES.iconLarge + 60,
              filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))",
            }}
          />
          {/* Label */}
          <div
            style={{
              position: "absolute",
              bottom: -45,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: FONT_SIZES.label,
              fontFamily: FONTS.primary,
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              whiteSpace: "nowrap",
              padding: "6px 18px",
              background: "rgba(30, 80, 130, 0.85)",
              borderRadius: 8,
              border: "1px solid #4FC3F7",
            }}
          >
            콜드체인 물류
          </div>
        </div>
      </div>

      {/* "기술 + 자본" 텍스트 (bottom-center, 자막 위) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "26%",
          transform: `translateX(-50%) scale(${textScale})`,
          opacity: textOpacity,
          zIndex: Z_INDEX.content,
        }}
      >
        <div
          style={{
            fontSize: FONT_SIZES.title,
            fontFamily: FONTS.primary,
            fontWeight: 800,
            color: "#FFFFFF",
            textShadow: `${TEXT_STROKE}, 0 0 20px rgba(79, 195, 247, 0.5)`,
            letterSpacing: 6,
            padding: "12px 30px",
            background: "linear-gradient(135deg, rgba(139, 69, 19, 0.7) 0%, rgba(30, 80, 130, 0.7) 100%)",
            borderRadius: 12,
            border: "2px solid rgba(212, 175, 55, 0.5)",
          }}
        >
          {displayText}
          <span
            style={{
              opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
              color: "#4FC3F7",
            }}
          >
            |
          </span>
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

export default S5;
