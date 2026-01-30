import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";

// Scene S31: Core5 - 기생충 감염 사이클
// Duration: 11.62s (349 frames at 30fps)

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
    text: "기생충 알은 주로 인분으로 배출된 뒤",
    start: 0.0,
    end: 2.78,
  },
  {
    index: 1,
    text: "채소 등의 먹거리에 섞여",
    start: 2.78,
    end: 4.48,
  },
  {
    index: 2,
    text: "다시 사람 입으로 들어가는 방식으로 감염됩니다.",
    start: 4.48,
    end: 7.48,
  },
  {
    index: 3,
    text: "이 지역에 인분이 널려 있었다는 뚜렷한 증거죠.",
    start: 8.9,
    end: 11.62,
  },
];

const cycleSteps = [
  { icon: "👤", label: "사람", x: 50, y: 15 },
  { icon: "💩", label: "인분", x: 85, y: 50 },
  { icon: "🥬", label: "채소", x: 50, y: 85 },
  { icon: "🍽️", label: "섭취", x: 15, y: 50 },
];

export const S31: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Cycle diagram reveal
  const cycleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sequential highlight of cycle steps
  const stepDuration = fps * 1.8;
  const currentStep = Math.floor((frame / stepDuration) % 4);

  // Animation: Arrows flow
  const arrowProgress = (frame / fps) * 0.5;

  // Animation: Evidence conclusion
  const evidenceStart = fps * 9.0;
  const evidenceOpacity = interpolate(
    frame,
    [evidenceStart, evidenceStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const evidenceScale = spring({
    frame: frame - evidenceStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Warning pulse
  const warningPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: cycleOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          감염 사이클
        </div>
      </div>

      {/* Circular diagram container */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 550,
          height: 500,
          opacity: cycleOpacity,
        }}
      >
        {/* Central circle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "4px dashed rgba(220, 38, 38, 0.3)",
          }}
        />

        {/* Cycle arrows */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Arrow paths */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#DC2626" />
            </marker>
          </defs>
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * 90 + 45) * (Math.PI / 180);
            const nextAngle = ((i + 1) * 90 + 45) * (Math.PI / 180);
            const radius = 130;
            const cx = 210;
            const cy = 210;

            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(nextAngle) * radius;
            const y2 = cy + Math.sin(nextAngle) * radius;

            const isActive = currentStep === i;

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={isActive ? "#DC2626" : "rgba(220, 38, 38, 0.3)"}
                strokeWidth={isActive ? 4 : 2}
                markerEnd="url(#arrowhead)"
                style={{
                  transition: "stroke 0.3s, stroke-width 0.3s",
                }}
              />
            );
          })}
        </svg>

        {/* Cycle steps */}
        {cycleSteps.map((step, i) => {
          const isActive = currentStep === i;
          const stepScale = isActive ? 1.15 : 1;

          return (
            <div
              key={step.label}
              style={{
                position: "absolute",
                left: `${step.x}%`,
                top: `${step.y}%`,
                transform: `translate(-50%, -50%) scale(${stepScale})`,
                transition: "transform 0.3s",
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(220, 38, 38, 0.1))"
                    : "rgba(255, 255, 255, 0.9)",
                  border: isActive ? "4px solid #DC2626" : "3px solid #9CA3AF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isActive
                    ? "0 0 20px rgba(220, 38, 38, 0.4)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ fontSize: 80 }}>{step.icon}</div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                  fontSize: 36,
                  fontFamily,
                  fontWeight: isActive ? 700 : 500,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}

        {/* Parasite diagram overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 160,
            height: 160,
            opacity: 0.5,
          }}
        >
          <Img
            src={staticFile("assets/images/parasite_diagram.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Evidence conclusion */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: `translateX(-50%) scale(${evidenceScale})`,
          opacity: evidenceOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: `rgba(220, 38, 38, ${0.1 + warningPulse * 0.1})`,
            borderRadius: 12,
            border: "3px solid #DC2626",
            boxShadow: `0 0 ${15 * warningPulse}px rgba(220, 38, 38, 0.4)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 80 }}>⚠️</div>
            <div>
              <div
                style={{
                  fontSize: 48,
                  fontFamily,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                인분 오염의 증거
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontFamily,
                  color: "#FFFFFF",
                  marginTop: 8,
                  textShadow: textStroke,
                }}
              >
                이 지역에 인분이 널려 있었다
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
