import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S25: Core4 - 양반 vs 엄행수 대비
// Duration: 21.46s (644 frames at 30fps)

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
    text: "무슨 뜻일까요?",
    start: 0.0,
    end: 0.6,
  },
  {
    index: 1,
    text: "겉으로는 깨끗해 보이는 양반들.",
    start: 1.28,
    end: 3.3,
  },
  {
    index: 2,
    text: "비단옷을 입고 향기로운 음식을 먹지만,",
    start: 3.54,
    end: 5.82,
  },
  {
    index: 3,
    text: "그 속을 들여다보면 탐욕과 허례허식으로 가득 차 있습니다.",
    start: 6.14,
    end: 9.7,
  },
  {
    index: 4,
    text: "반면 겉으로는 더러운 일을 하는 엄행수.",
    start: 10.8,
    end: 13.7,
  },
  {
    index: 5,
    text: "하지만 그의 내면은 자신의 직분에 충실하고,",
    start: 14.28,
    end: 17.44,
  },
  {
    index: 6,
    text: "욕심내지 않으며, 묵묵히 일하는 청결함으로 가득 차 있죠.",
    start: 17.62,
    end: 21.46,
  },
];

export const S25: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Question
  const questionOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionFade = interpolate(frame, [fps * 1.0, fps * 1.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Yangban exterior
  const yangbanStart = fps * 1.5;
  const yangbanOpacity = interpolate(
    frame,
    [yangbanStart, yangbanStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Yangban interior reveal
  const yangbanInteriorStart = fps * 6.0;
  const yangbanInteriorOpacity = interpolate(
    frame,
    [yangbanInteriorStart, yangbanInteriorStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Eom exterior
  const eomStart = fps * 10.5;
  const eomOpacity = interpolate(frame, [eomStart, eomStart + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Eom interior reveal
  const eomInteriorStart = fps * 14.0;
  const eomInteriorOpacity = interpolate(
    frame,
    [eomInteriorStart, eomInteriorStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow effects
  const darkPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lightPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.7, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Question */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: questionOpacity * questionFade,
          fontSize: 56,
          fontFamily,
          fontWeight: 700,
          color: "#4a4a4a",
        }}
      >
        무슨 뜻일까요? <span style={{ fontSize: 80 }}>🤔</span>
      </div>

      {/* Split comparison */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 60,
        }}
      >
        {/* Yangban section */}
        <div
          style={{
            opacity: yangbanOpacity,
            width: 350,
          }}
        >
          {/* Exterior */}
          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 100%)",
              borderRadius: "16px 16px 0 0",
              border: "3px solid #9370DB",
            }}
          >
            <div style={{ fontSize: 80 }}>👑</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#4B0082",
              }}
            >
              양반
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 24,
                color: "#666",
              }}
            >
              비단옷 · 향기로운 음식
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 28,
                color: "#4B0082",
                fontWeight: 600,
              }}
            >
              겉: 깨끗해 보임
            </div>
          </div>

          {/* Interior */}
          <div
            style={{
              opacity: yangbanInteriorOpacity,
              textAlign: "center",
              padding: 20,
              background: `linear-gradient(135deg, rgba(139, 0, 0, ${0.2 + darkPulse * 0.3}) 0%, rgba(50, 0, 0, ${0.3 + darkPulse * 0.2}) 100%)`,
              borderRadius: "0 0 16px 16px",
              border: "3px solid #8B0000",
              borderTop: "none",
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: "#DC143C",
                fontWeight: 600,
              }}
            >
              속을 들여다보면...
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 50,
                  filter: `drop-shadow(0 0 ${10 * darkPulse}px rgba(139, 0, 0, 0.8))`,
                }}
              >
                💰
              </div>
              <div
                style={{
                  fontSize: 50,
                  filter: `drop-shadow(0 0 ${10 * darkPulse}px rgba(139, 0, 0, 0.8))`,
                }}
              >
                🎭
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 28,
                fontFamily,
                fontWeight: 700,
                color: "#DC143C",
              }}
            >
              탐욕 · 허례허식
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "6px 16px",
                background: "#8B0000",
                borderRadius: 20,
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: 22, color: "#FFF", fontWeight: 600 }}>
                속: 불결 ❌
              </span>
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div
          style={{
            alignSelf: "center",
            opacity: Math.min(yangbanOpacity, eomOpacity),
            fontSize: 48,
            fontFamily,
            fontWeight: 900,
            color: "#666",
          }}
        >
          VS
        </div>

        {/* Eom Haengsu section */}
        <div
          style={{
            opacity: eomOpacity,
            width: 350,
          }}
        >
          {/* Exterior */}
          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "linear-gradient(135deg, #D2B48C 0%, #8B7355 100%)",
              borderRadius: "16px 16px 0 0",
              border: "3px solid #8B4513",
            }}
          >
            <div style={{ fontSize: 80 }}>🧑‍🌾</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#8B4513",
              }}
            >
              엄행수
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 24,
                color: "#666",
              }}
            >
              분뇨 운반 · 더러운 일
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 28,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              겉: 더러워 보임
            </div>
          </div>

          {/* Interior */}
          <div
            style={{
              opacity: eomInteriorOpacity,
              textAlign: "center",
              padding: 20,
              background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.1 + lightPulse * 0.2}) 0%, rgba(255, 250, 205, ${0.2 + lightPulse * 0.2}) 100%)`,
              borderRadius: "0 0 16px 16px",
              border: "3px solid #FFD700",
              borderTop: "none",
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: "#B8860B",
                fontWeight: 600,
              }}
            >
              내면을 보면...
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 50,
                  filter: `drop-shadow(0 0 ${10 * lightPulse}px rgba(255, 215, 0, 0.8))`,
                }}
              >
                ✨
              </div>
              <div
                style={{
                  fontSize: 50,
                  filter: `drop-shadow(0 0 ${10 * lightPulse}px rgba(255, 215, 0, 0.8))`,
                }}
              >
                💎
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 28,
                fontFamily,
                fontWeight: 700,
                color: "#B8860B",
              }}
            >
              직분 충실 · 묵묵함
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "6px 16px",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                borderRadius: 20,
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: 22, color: "#8B0000", fontWeight: 600 }}>
                속: 청결 ✨
              </span>
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
