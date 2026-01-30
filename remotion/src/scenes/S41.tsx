import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S41: Insight - 경제 주체로서의 엄행수, 투자 전략
// Duration: 15.6s (468 frames at 30fps)
// Scene starts at 11.56s in section, ends at 27.16s

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
    text: "엄행수는 돈의 흐름을 읽고",
    start: 0.0,
    end: 1.82,
  },
  {
    index: 1,
    text: "상업 경제 활동에 적극적으로 참여하는 경제 주체였습니다.",
    start: 1.82,
    end: 5.64,
  },
  {
    index: 2,
    text: "남들이 기피하는 곳에서 수요를 발견하고,",
    start: 6.8,
    end: 9.24,
  },
  {
    index: 3,
    text: "그것을 비즈니스로 연결한 것이죠.",
    start: 9.24,
    end: 11.52,
  },
  {
    index: 4,
    text: "이것이 바로 조선 최고의 투자 전략이 아니었을까요?",
    start: 12.78,
    end: 15.6,
  },
];

export const S41: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Money flow arrows at top
  const flowOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flowOffset = interpolate(frame, [0, fps * 15], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Lightbulb idea moment
  const ideaStart = fps * 6.5;
  const ideaOpacity = interpolate(
    frame,
    [ideaStart, ideaStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ideaScale = spring({
    frame: frame - ideaStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const ideaGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Business connection arrow
  const arrowStart = fps * 9.0;
  const arrowProgress = interpolate(
    frame,
    [arrowStart, arrowStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Investment strategy text
  const strategyStart = fps * 12.5;
  const strategyOpacity = interpolate(
    frame,
    [strategyStart, strategyStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const strategyScale = spring({
    frame: frame - strategyStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const goldPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.7, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Coin animation positions
  const coinPositions = [0, 1, 2, 3, 4].map((i) => ({
    x: ((flowOffset + i * 80) % 400) - 50,
    y: 30 + Math.sin((flowOffset + i * 80) / 50) * 15,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Money flow animation at top */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          right: "10%",
          height: 80,
          opacity: flowOpacity,
          overflow: "hidden",
        }}
      >
        {/* Flowing coins */}
        {coinPositions.map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(pos.x / 400) * 100}%`,
              top: pos.y,
              fontSize: 32,
              transform: `rotate(${pos.x * 0.5}deg)`,
            }}
          >
            🪙
          </div>
        ))}
        {/* Flow arrows */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "0%",
            right: "0%",
            display: "flex",
            justifyContent: "space-around",
            transform: "translateY(-50%)",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                fontSize: 28,
                color: "#FFD700",
                opacity: 0.6 + Math.sin((frame / fps + i) * Math.PI) * 0.4,
              }}
            >
              →
            </div>
          ))}
        </div>
      </div>

      {/* Central business flow diagram */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* Opportunity discovery - lightbulb */}
        <div
          style={{
            opacity: ideaOpacity,
            transform: `scale(${ideaScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 215, 0, ${ideaGlow * 0.5}) 0%, transparent 70%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #FFD700",
              boxShadow: `0 0 ${30 * ideaGlow}px rgba(255, 215, 0, 0.5)`,
            }}
          >
            <span style={{ fontSize: 56 }}>💡</span>
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 20,
              fontFamily,
              fontWeight: 600,
              color: "#B8860B",
            }}
          >
            기회 발견
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#8B7355",
            }}
          >
            기피하는 곳
          </div>
        </div>

        {/* Connection arrow */}
        <div
          style={{
            width: 150,
            height: 60,
            position: "relative",
          }}
        >
          {/* Arrow body */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${arrowProgress * 100}%`,
              height: 8,
              background: "linear-gradient(90deg, #FFD700, #B8860B)",
              borderRadius: 4,
              transform: "translateY(-50%)",
            }}
          />
          {/* Arrow head */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${arrowProgress * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 0,
              height: 0,
              borderLeft: "20px solid #B8860B",
              borderTop: "15px solid transparent",
              borderBottom: "15px solid transparent",
              opacity: arrowProgress > 0.5 ? 1 : 0,
            }}
          />
          {/* Transform text */}
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 14,
              fontFamily,
              color: "#666",
              opacity: arrowProgress,
            }}
          >
            → 비즈니스로 →
          </div>
        </div>

        {/* Profit result */}
        <div
          style={{
            opacity: arrowProgress > 0.8 ? 1 : 0,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #28A745 0%, #1E7E34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(40, 167, 69, 0.4)",
            }}
          >
            <span style={{ fontSize: 56 }}>📈</span>
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 20,
              fontFamily,
              fontWeight: 600,
              color: "#28A745",
            }}
          >
            수익 창출
          </div>
        </div>
      </div>

      {/* Economic subject label */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [fps * 1.5, fps * 2.0], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            padding: "12px 30px",
            background: "rgba(65, 105, 225, 0.15)",
            borderRadius: 30,
            border: "2px solid #4169E1",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontFamily,
              fontWeight: 700,
              color: "#1E3A8A",
            }}
          >
            경제 주체 엄행수
          </span>
        </div>
      </div>

      {/* Investment strategy golden text */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: `translateX(-50%) scale(${strategyScale})`,
          opacity: strategyOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.2 + goldPulse * 0.2}), rgba(184, 134, 11, 0.15))`,
            borderRadius: 16,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${40 * goldPulse}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontFamily,
              fontWeight: 800,
              color: "#B8860B",
              textShadow: `0 0 ${15 * goldPulse}px rgba(255, 215, 0, 0.6)`,
              textAlign: "center",
            }}
          >
            조선 최고의 투자 전략
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              fontFamily,
              color: "#8B7355",
              textAlign: "center",
            }}
          >
            남들이 피하는 곳에서 가치를 발견하다
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
