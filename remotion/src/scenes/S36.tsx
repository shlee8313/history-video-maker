import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S36: Core7 - 매분자는 도시와 농촌을 연결하는 핵심 고리
// Duration: 9.98s (299 frames at 30fps)

const fontFamily = "Pretendard, sans-serif";

// 검은 테두리 텍스트 스타일 (공통)
const textStroke = `
  -2px -2px 0 #000,
   2px -2px 0 #000,
  -2px  2px 0 #000,
   2px  2px 0 #000,
  -3px  0   0 #000,
   3px  0   0 #000,
   0   -3px 0 #000,
   0    3px 0 #000
`;

const captions = [
  {
    index: 0,
    text: "매분자들의 존재는 단순히 분뇨를 치우는 것 이상의 의미가 있었습니다.",
    start: 0.0,
    end: 4.6,
  },
  {
    index: 1,
    text: "그들은 도시 위생과 농촌 경제를 연결하는 핵심 고리였죠.",
    start: 5.54,
    end: 9.98,
  },
];

export const S36: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Title fade in
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: City icon
  const cityOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cityScale = spring({
    frame: frame - fps * 1,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Animation: Rural icon
  const ruralOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ruralScale = spring({
    frame: frame - fps * 2,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Animation: Maebunza bridge connection
  const bridgeStart = fps * 3.5;
  const bridgeOpacity = interpolate(
    frame,
    [bridgeStart, bridgeStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const bridgeLineWidth = interpolate(
    frame,
    [bridgeStart, bridgeStart + fps * 1],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Key link text
  const linkStart = fps * 6.0;
  const linkOpacity = interpolate(
    frame,
    [linkStart, linkStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const linkScale = spring({
    frame: frame - linkStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Pulsing glow
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // City pulse
  const cityPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.9, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Rural pulse (offset)
  const ruralPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2 + Math.PI),
    [-1, 1],
    [0.9, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          단순한 분뇨 처리 그 이상
        </div>
      </div>

      {/* City icon (left) */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "12%",
          opacity: cityOpacity,
          transform: `scale(${cityScale * cityPulse})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6B7280 0%, #374151 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${20 * glowPulse}px rgba(107, 114, 128, 0.5)`,
          }}
        >
          <div style={{ fontSize: 120 }}>🏛️</div>
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 52,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          도시
        </div>
        <div
          style={{
            fontSize: 36,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          한양 · 위생
        </div>
      </div>

      {/* Rural icon (right) */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "12%",
          opacity: ruralOpacity,
          transform: `scale(${ruralScale * ruralPulse})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${20 * glowPulse}px rgba(34, 197, 94, 0.5)`,
          }}
        >
          <div style={{ fontSize: 120 }}>🌾</div>
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 52,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          농촌
        </div>
        <div
          style={{
            fontSize: 36,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          비료 · 경제
        </div>
      </div>

      {/* Connection bridge (Maebunza) */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: bridgeOpacity,
        }}
      >
        {/* Connection line */}
        <div
          style={{
            width: 550,
            height: 12,
            background: `linear-gradient(90deg,
              rgba(107, 114, 128, 0.3) 0%,
              rgba(255, 215, 0, ${0.5 + glowPulse * 0.3}) 50%,
              rgba(34, 197, 94, 0.3) 100%)`,
            borderRadius: 6,
            position: "relative",
          }}
        >
          {/* Animated flow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${bridgeLineWidth - 10}%`,
              width: 60,
              height: "100%",
              background: `linear-gradient(90deg, transparent, rgba(255, 215, 0, ${glowPulse}), transparent)`,
              borderRadius: 6,
            }}
          />
        </div>

        {/* Maebunza in the middle */}
        <div
          style={{
            position: "absolute",
            top: -70,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.3 + glowPulse * 0.2}), rgba(184, 134, 11, 0.4))`,
              border: "4px solid #FFD700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${25 * glowPulse}px rgba(255, 215, 0, 0.6)`,
            }}
          >
            <div style={{ fontSize: 100 }}>🔗</div>
          </div>
        </div>
      </div>

      {/* Key link text */}
      <div
        style={{
          position: "absolute",
          bottom: "16%",
          left: "50%",
          transform: `translateX(-50%) scale(${linkScale})`,
          opacity: linkOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 60px",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.2 + glowPulse * 0.1}), rgba(184, 134, 11, 0.15))`,
            borderRadius: 16,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${30 * glowPulse}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontFamily,
              fontWeight: 800,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: `${textStroke}, 0 0 ${15 * glowPulse}px rgba(255, 215, 0, 0.6)`,
            }}
          >
            핵심 고리
          </div>
          <div
            style={{
              fontSize: 44,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              marginTop: 12,
              textShadow: textStroke,
            }}
          >
            도시 위생 ↔ 농촌 경제
          </div>
        </div>
      </div>

      {/* Caption */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 45,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: `${textStroke}, 0 4px 8px rgba(0, 0, 0, 0.5)`,
            padding: "0 60px",
            zIndex: 1000,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
