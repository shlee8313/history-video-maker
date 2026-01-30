import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S48: Outro - 채널 엔딩
// Duration: 2.84s (85 frames at 30fps)
// Scene starts at 71.14s in section, ends at 73.98s

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
    text: "진짜 이런 일이 있었다고?",
    start: 0.0,
    end: 1.42,
  },
  {
    index: 1,
    text: "세상에 이런 역사였습니다!",
    start: 1.42,
    end: 2.84,
  },
];

export const S48: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Surprise text bounce
  const surpriseOpacity = interpolate(frame, [0, fps * 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const surpriseScale = spring({
    frame: frame,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Animation: Channel logo reveal
  const logoStart = fps * 1.2;
  const logoOpacity = interpolate(
    frame,
    [logoStart, logoStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const logoScale = spring({
    frame: frame - logoStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Animation: Subscribe pulse
  const subscribePulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 4),
    [-1, 1],
    [0.95, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Energy glow
  const energyGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ending radial burst
  const burstProgress = interpolate(frame, [0, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Radial energy burst background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          opacity: burstProgress * 0.3,
        }}
      >
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 6,
              height: 300 * burstProgress,
              background: `linear-gradient(180deg, rgba(255, 215, 0, 0.8) 0%, transparent 100%)`,
              transformOrigin: "center top",
              transform: `rotate(${angle}deg) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Surprise text */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translateX(-50%) scale(${surpriseScale})`,
          opacity: surpriseOpacity,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontFamily,
            fontWeight: 800,
            color: "#DC2626",
            textShadow: "0 0 20px rgba(220, 38, 38, 0.5)",
          }}
        >
          진짜 이런 일이 있었다고?!
        </div>
      </div>

      {/* Channel logo/name */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translateX(-50%) scale(${logoScale})`,
          opacity: logoOpacity,
          textAlign: "center",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.3 + energyGlow * 0.3}), rgba(184, 134, 11, 0.2))`,
            border: "6px solid #FFD700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: `0 0 ${60 * energyGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48 }}>📜</div>
            <div
              style={{
                fontSize: 18,
                fontFamily,
                fontWeight: 700,
                color: "#B8860B",
                marginTop: 5,
              }}
            >
              세이역
            </div>
          </div>
        </div>
        {/* Channel name */}
        <div
          style={{
            marginTop: 20,
            fontSize: 40,
            fontFamily,
            fontWeight: 900,
            color: "#B8860B",
            textShadow: `0 0 ${20 * energyGlow}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          세상에 이런 역사
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 22,
            fontFamily,
            color: "#8B7355",
          }}
        >
          이었습니다!
        </div>
      </div>

      {/* Subscribe CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: `translateX(-50%) scale(${subscribePulse})`,
          opacity: logoOpacity,
          display: "flex",
          gap: 20,
        }}
      >
        {/* Subscribe button */}
        <div
          style={{
            padding: "12px 28px",
            background: "#DC2626",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
          }}
        >
          <span style={{ fontSize: 24 }}>🔔</span>
          <span
            style={{
              fontSize: 20,
              fontFamily,
              fontWeight: 700,
              color: "#FFF",
            }}
          >
            구독
          </span>
        </div>
        {/* Like button */}
        <div
          style={{
            padding: "12px 28px",
            background: "#4169E1",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 15px rgba(65, 105, 225, 0.4)",
          }}
        >
          <span style={{ fontSize: 24 }}>👍</span>
          <span
            style={{
              fontSize: 20,
              fontFamily,
              fontWeight: 700,
              color: "#FFF",
            }}
          >
            좋아요
          </span>
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
