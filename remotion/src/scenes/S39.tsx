import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S39: Core7 - 가장 더러운 일 = 가장 중요한 일
// Duration: 16.34s (490 frames at 30fps)

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
    text: "매분자들이 없었다면,",
    start: 0.0,
    end: 1.4,
  },
  {
    index: 1,
    text: "한양 거리는 더욱 심각한 오물 천지가 되었을 겁니다.",
    start: 1.4,
    end: 4.82,
  },
  {
    index: 2,
    text: "전염병은 더 자주, 더 심하게 돌았을 것이고,",
    start: 5.46,
    end: 8.76,
  },
  {
    index: 3,
    text: "농촌의 비료 부족으로 식량 생산도 타격을 받았겠죠.",
    start: 8.76,
    end: 12.72,
  },
  {
    index: 4,
    text: "가장 더러운 일을 하는 사람들이",
    start: 13.08,
    end: 14.34,
  },
  {
    index: 5,
    text: "사실은 가장 중요한 일을 하고 있었던 겁니다.",
    start: 14.34,
    end: 16.34,
  },
];

const alternativeScenarios = [
  { icon: "💩", text: "오물 천지", delay: 0 },
  { icon: "☠️", text: "전염병 창궐", delay: 1.5 },
  { icon: "🥀", text: "비료 부족", delay: 3 },
  { icon: "😰", text: "식량난", delay: 4.5 },
];

export const S39: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: "If not" title
  const ifNotOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Alternative scenarios fade in
  const scenarioOpacity = (delay: number) =>
    interpolate(
      frame,
      [fps * delay, fps * (delay + 0.5)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Animation: Scenarios fade out
  const scenariosFadeOut = interpolate(
    frame,
    [fps * 9, fps * 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Hero reveal
  const heroStart = fps * 10.5;
  const heroOpacity = interpolate(
    frame,
    [heroStart, heroStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const heroScale = spring({
    frame: frame - heroStart,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Animation: Final message
  const finalStart = fps * 13.0;
  const finalOpacity = interpolate(
    frame,
    [finalStart, finalStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const finalScale = spring({
    frame: frame - finalStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Hero glow
  const heroGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Dark overlay for alternative reality
  const darkOverlay = interpolate(
    frame,
    [0, fps * 1, fps * 9, fps * 10],
    [0, 0.3, 0.3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Dark overlay for alternative reality */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `rgba(0, 0, 0, ${darkOverlay})`,
          pointerEvents: "none",
        }}
      />

      {/* "If not" title */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: ifNotOpacity * scenariosFadeOut,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            fontWeight: 700,
            color: "#DC2626",
          }}
        >
          매분자가 없었다면?
        </div>
      </div>

      {/* Alternative scenarios grid */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 30,
          opacity: scenariosFadeOut,
        }}
      >
        {alternativeScenarios.map((scenario, i) => (
          <div
            key={scenario.text}
            style={{
              opacity: scenarioOpacity(scenario.delay),
              padding: "20px 30px",
              background: "rgba(220, 38, 38, 0.15)",
              borderRadius: 12,
              border: "2px solid #DC2626",
              textAlign: "center",
              width: 200,
            }}
          >
            <div style={{ fontSize: 48 }}>{scenario.icon}</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 20,
                fontFamily,
                fontWeight: 600,
                color: "#DC2626",
              }}
            >
              {scenario.text}
            </div>
          </div>
        ))}
      </div>

      {/* Hero maebunza reveal */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: `translateX(-50%) scale(${heroScale})`,
          opacity: heroOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255, 215, 0, ${0.4 + heroGlow * 0.3}) 0%, rgba(255, 215, 0, 0.1) 70%, transparent 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${60 * heroGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 170,
              background: "linear-gradient(180deg, #5D4E37 0%, #3D3426 100%)",
              borderRadius: "40% 40% 20% 20%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ fontSize: 64 }}>🧹</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: "#B8860B",
            textShadow: `0 0 ${15 * heroGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          매분자
        </div>
      </div>

      {/* Final message: Dirty work = Important work */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: `translateX(-50%) scale(${finalScale})`,
          opacity: finalOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 48px",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.25 + heroGlow * 0.15}), rgba(184, 134, 11, 0.2))`,
            borderRadius: 20,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${40 * heroGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {/* Dirty work */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36 }}>💩</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontFamily,
                  color: "#8B4513",
                }}
              >
                가장 더러운 일
              </div>
            </div>

            {/* Equals */}
            <div
              style={{
                fontSize: 48,
                fontFamily,
                fontWeight: 900,
                color: "#FFD700",
                textShadow: `0 0 ${15 * heroGlow}px rgba(255, 215, 0, 0.8)`,
              }}
            >
              =
            </div>

            {/* Important work */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 36,
                  filter: `drop-shadow(0 0 ${10 * heroGlow}px rgba(255, 215, 0, 0.8))`,
                }}
              >
                ⭐
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontFamily,
                  fontWeight: 700,
                  color: "#B8860B",
                }}
              >
                가장 중요한 일
              </div>
            </div>
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
