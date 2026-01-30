import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S44: Outro - 정리 섹션 시작
// Duration: 5.3s (159 frames at 30fps)

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
    text: "자, 정리해봅시다.",
    start: 0.0,
    end: 1.04,
  },
  {
    index: 1,
    text: "조선시대 매분자, 똥지기들은 어떤 사람들이었을까요?",
    start: 2.18,
    end: 5.3,
  },
];

export const S44: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Summary title slide down
  const titleOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.5], [-50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Maebunza silhouette with question mark
  const silhouetteStart = fps * 1.5;
  const silhouetteOpacity = interpolate(
    frame,
    [silhouetteStart, silhouetteStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const silhouetteScale = spring({
    frame: frame - silhouetteStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Animation: Question mark pulse
  const questionPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.9, 1.1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const questionGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: List placeholder dots preparing
  const dotsStart = fps * 3.5;
  const dotsOpacity = interpolate(
    frame,
    [dotsStart, dotsStart + fps * 0.5],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Summary title */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: `translateX(-50%) translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            padding: "16px 48px",
            background: "linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(30, 58, 138, 0.15))",
            borderRadius: 16,
            border: "3px solid #4169E1",
            boxShadow: "0 4px 20px rgba(65, 105, 225, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontFamily,
              fontWeight: 800,
              color: "#1E3A8A",
              textAlign: "center",
            }}
          >
            정리
          </div>
        </div>
      </div>

      {/* Maebunza silhouette with question mark */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: `translateX(-50%) scale(${silhouetteScale})`,
          opacity: silhouetteOpacity,
          textAlign: "center",
        }}
      >
        {/* Silhouette figure */}
        <div
          style={{
            width: 180,
            height: 240,
            background: "linear-gradient(180deg, #3D3426 0%, #2a2318 100%)",
            borderRadius: "40% 40% 20% 20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Question mark overlay */}
          <div
            style={{
              fontSize: 80,
              fontFamily,
              fontWeight: 900,
              color: "#FFD700",
              transform: `scale(${questionPulse})`,
              textShadow: `0 0 ${20 * questionGlow}px rgba(255, 215, 0, 0.8)`,
            }}
          >
            ?
          </div>
          {/* Mystery glow */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 215, 0, ${questionGlow * 0.2}) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        </div>
        {/* Label */}
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: "#5D4E37",
          }}
        >
          조선시대 매분자
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily,
            color: "#8B7355",
            marginTop: 5,
          }}
        >
          똥지기들은 누구였을까?
        </div>
      </div>

      {/* Preparing list placeholder dots */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          opacity: dotsOpacity,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "3px dashed #B8860B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: interpolate(
                frame,
                [dotsStart + i * fps * 0.2, dotsStart + i * fps * 0.2 + fps * 0.3],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontFamily,
                fontWeight: 700,
                color: "#B8860B",
              }}
            >
              {i}
            </span>
          </div>
        ))}
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
