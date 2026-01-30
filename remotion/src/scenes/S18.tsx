import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S18: Core2 - 매분자의 일상 (도시→농촌)
// Duration: 13.26s (398 frames at 30fps)

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
    text: "매분자들은 이 커다란 똥장군을 등에 지고 성 안을 누볐습니다.",
    start: 0.0,
    end: 2.72,
  },
  {
    index: 1,
    text: "가가호호 방문하여 분뇨를 수거하고,",
    start: 3.38,
    end: 5.9,
  },
  {
    index: 2,
    text: "이것을 성문 밖으로 가져가 농촌에 팔았습니다.",
    start: 5.9,
    end: 9.64,
  },
  {
    index: 3,
    text: "도시의 폐기물을 농촌의 자원으로 바꾼 것이죠.",
    start: 10.72,
    end: 13.26,
  },
];

export const S18: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Walking figure position
  const walkProgress = interpolate(frame, [0, fps * 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const figureX = interpolate(walkProgress, [0, 0.4, 0.6, 1], [10, 35, 65, 90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Walking bob animation
  const walkBob = Math.sin(frame * 0.5) * 3;

  // Animation: Houses visited
  const house1Active = walkProgress > 0.1 && walkProgress < 0.25;
  const house2Active = walkProgress > 0.25 && walkProgress < 0.4;

  // Animation: City gate
  const gateStart = fps * 5.5;
  const gateOpacity = interpolate(
    frame,
    [gateStart, gateStart + fps * 0.5],
    [0.3, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Transformation icon
  const transformStart = fps * 10.5;
  const transformScale = spring({
    frame: frame - transformStart,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const transformOpacity = interpolate(
    frame,
    [transformStart, transformStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Route path animation
  const pathProgress = interpolate(frame, [0, fps * 9], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Scene background elements */}

      {/* Route path (dotted line) */}
      <svg
        style={{
          position: "absolute",
          top: "45%",
          left: "5%",
          width: "90%",
          height: 100,
        }}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC143C" />
            <stop offset="50%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#228B22" />
          </linearGradient>
        </defs>
        <path
          d="M 0 50 Q 200 20, 400 50 T 800 50"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          strokeDasharray="10,5"
          strokeDashoffset={100 - pathProgress}
          opacity={0.6}
        />
      </svg>

      {/* Houses (city) */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "8%",
          display: "flex",
          gap: 30,
        }}
      >
        {[0, 1].map((i) => {
          const isActive = i === 0 ? house1Active : house2Active;
          return (
            <div
              key={i}
              style={{
                fontSize: 60,
                filter: isActive
                  ? "drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))"
                  : "none",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.2s, filter 0.2s",
              }}
            >
              🏠
            </div>
          );
        })}
        <div
          style={{
            marginLeft: 20,
            fontSize: 18,
            fontFamily,
            color: "#666",
            alignSelf: "flex-end",
          }}
        >
          가가호호
        </div>
      </div>

      {/* City gate */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "45%",
          transform: "translateX(-50%)",
          opacity: gateOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
          }}
        >
          🏯
        </div>
        <div
          style={{
            fontSize: 18,
            fontFamily,
            color: "#8B0000",
            fontWeight: 600,
          }}
        >
          성문
        </div>
      </div>

      {/* Farm area */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          right: "8%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 60 }}>🌾</div>
        <div
          style={{
            fontSize: 18,
            fontFamily,
            color: "#228B22",
            fontWeight: 600,
          }}
        >
          농촌
        </div>
      </div>

      {/* Walking maebunza figure */}
      <div
        style={{
          position: "absolute",
          top: `${38 + walkBob}%`,
          left: `${figureX}%`,
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 70,
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
          }}
        >
          🧑‍🌾
        </div>
        {/* Janggun on back */}
        <div
          style={{
            position: "absolute",
            top: -15,
            right: -25,
            fontSize: 40,
          }}
        >
          🏺
        </div>
      </div>

      {/* Labels for stages */}
      <div
        style={{
          position: "absolute",
          bottom: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 100,
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: walkProgress > 0.1 ? 1 : 0.3,
          }}
        >
          <div
            style={{
              fontSize: 32,
              marginBottom: 8,
            }}
          >
            1️⃣
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily,
              color: "#DC143C",
            }}
          >
            수거
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            opacity: walkProgress > 0.5 ? 1 : 0.3,
          }}
        >
          <div
            style={{
              fontSize: 32,
              marginBottom: 8,
            }}
          >
            2️⃣
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily,
              color: "#8B4513",
            }}
          >
            운반
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            opacity: walkProgress > 0.8 ? 1 : 0.3,
          }}
        >
          <div
            style={{
              fontSize: 32,
              marginBottom: 8,
            }}
          >
            3️⃣
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily,
              color: "#228B22",
            }}
          >
            판매
          </div>
        </div>
      </div>

      {/* Transformation message */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: `translateX(-50%) scale(${transformScale})`,
          opacity: transformOpacity,
        }}
      >
        <div
          style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #8B4513 0%, #228B22 100%)",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily,
              fontWeight: 700,
              color: "#FFF",
            }}
          >
            🗑️ 폐기물 → 자원 ✨
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
