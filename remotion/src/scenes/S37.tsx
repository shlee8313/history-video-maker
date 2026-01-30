import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S37: Core7 - 완벽한 순환 경제 시스템
// Duration: 17.82s (535 frames at 30fps)

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
    text: "한양에서 수거한 분뇨는 성 밖 농촌으로 운반되어 비료가 됩니다.",
    start: 0.0,
    end: 4.06,
  },
  {
    index: 1,
    text: "이 비료로 농작물이 자라고,",
    start: 4.76,
    end: 6.44,
  },
  {
    index: 2,
    text: "그 농작물은 다시 한양으로 들어와 시민들의 식탁에 오릅니다.",
    start: 6.44,
    end: 10.24,
  },
  {
    index: 3,
    text: "그리고 그 음식은 다시 분뇨가 되어 매분자들에게 수거됩니다.",
    start: 10.9,
    end: 14.72,
  },
  {
    index: 4,
    text: "완벽한 순환 경제 시스템이었던 거죠.",
    start: 15.4,
    end: 17.82,
  },
];

const cycleSteps = [
  { icon: "💩", label: "분뇨", color: "#8B4513" },
  { icon: "🌱", label: "비료", color: "#22C55E" },
  { icon: "🌾", label: "농작물", color: "#F59E0B" },
  { icon: "🍚", label: "음식", color: "#EF4444" },
];

export const S37: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation timing for each step
  const stepTimings = [
    { start: 0, highlight: fps * 1 },
    { start: fps * 4.5, highlight: fps * 5 },
    { start: fps * 6.5, highlight: fps * 8 },
    { start: fps * 11, highlight: fps * 13 },
  ];

  // Animation: Circular flow
  const flowProgress = interpolate(frame, [0, fps * 15], [0, 360 * 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: "Perfect cycle" text
  const perfectStart = fps * 15.5;
  const perfectOpacity = interpolate(
    frame,
    [perfectStart, perfectStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const perfectScale = spring({
    frame: frame - perfectStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Golden glow
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Determine which step is currently highlighted
  const getCurrentStep = () => {
    if (frame < fps * 4.5) return 0;
    if (frame < fps * 6.5) return 1;
    if (frame < fps * 11) return 2;
    if (frame < fps * 15) return 3;
    return -1; // All complete
  };
  const currentStep = getCurrentStep();

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Circular diagram */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 450,
          height: 450,
        }}
      >
        {/* Central circle - rotating glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: `4px dashed rgba(255, 215, 0, ${0.3 + glowPulse * 0.3})`,
            boxShadow: `0 0 ${30 * glowPulse}px rgba(255, 215, 0, 0.3)`,
          }}
        />

        {/* Flow arrows SVG */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            <marker
              id="arrowhead-gold"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#FFD700" />
            </marker>
          </defs>
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * 90 - 45) * (Math.PI / 180);
            const nextAngle = ((i + 1) * 90 - 45) * (Math.PI / 180);
            const radius = 140;
            const cx = 225;
            const cy = 225;

            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(nextAngle) * radius;
            const y2 = cy + Math.sin(nextAngle) * radius;

            const isActive = currentStep === i || currentStep === -1;

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={isActive ? "#FFD700" : "rgba(255, 215, 0, 0.3)"}
                strokeWidth={isActive ? 4 : 2}
                markerEnd="url(#arrowhead-gold)"
              />
            );
          })}
        </svg>

        {/* Cycle step icons */}
        {cycleSteps.map((step, i) => {
          const angle = (i * 90 - 90) * (Math.PI / 180);
          const radius = 180;
          const x = 50 + Math.cos(angle) * (radius / 4.5) * 100 / 450;
          const y = 50 + Math.sin(angle) * (radius / 4.5) * 100 / 450;

          const stepOpacity = interpolate(
            frame,
            [stepTimings[i].start, stepTimings[i].start + fps * 0.3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const isHighlighted = currentStep === i;
          const stepScale = isHighlighted ? 1.15 : 1;

          return (
            <div
              key={step.label}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${stepScale})`,
                opacity: stepOpacity,
                transition: "transform 0.3s",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: isHighlighted
                    ? `linear-gradient(135deg, ${step.color}40, ${step.color}20)`
                    : "rgba(255, 255, 255, 0.9)",
                  border: `3px solid ${step.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isHighlighted
                    ? `0 0 25px ${step.color}80`
                    : "0 2px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ fontSize: 42 }}>{step.icon}</div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 18,
                  fontFamily,
                  fontWeight: isHighlighted ? 700 : 500,
                  color: step.color,
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontFamily,
              fontWeight: 700,
              color: "#B8860B",
            }}
          >
            순환
          </div>
        </div>
      </div>

      {/* "Perfect cycle" text */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: `translateX(-50%) scale(${perfectScale})`,
          opacity: perfectOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.25 + glowPulse * 0.15}), rgba(184, 134, 11, 0.2))`,
            borderRadius: 20,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${40 * glowPulse}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontFamily,
              fontWeight: 900,
              color: "#B8860B",
              textAlign: "center",
              textShadow: `0 0 ${20 * glowPulse}px rgba(255, 215, 0, 0.8)`,
            }}
          >
            완벽한 순환 경제
          </div>
          <div
            style={{
              fontSize: 20,
              fontFamily,
              color: "#666",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            분뇨 → 비료 → 농작물 → 음식 → 분뇨
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
