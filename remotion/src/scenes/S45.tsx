import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S45: Outro - 3가지 정리 포인트
// Duration: 31.66s (950 frames at 30fps)
// Scene starts at 6.14s in section, ends at 37.8s

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
    text: "첫째, 그들은 남들이 기피하는 곳에서 가치를 발견한 선구자였습니다.",
    start: 0.0,
    end: 3.74,
  },
  {
    index: 1,
    text: "모두가 코를 막고 피할 때, 그 안에서 기회를 본 것이죠.",
    start: 4.8,
    end: 7.74,
  },
  {
    index: 2,
    text: "둘째, 그들은 도시와 농촌을 연결하는 순환 경제의 핵심 고리였습니다.",
    start: 8.92,
    end: 13.34,
  },
  {
    index: 3,
    text: "폐기물을 자원으로 바꾸는 오늘날의 ESG 경영을 이미 실천하고 있었던 거죠.",
    start: 14.68,
    end: 19.36,
  },
  {
    index: 4,
    text: "셋째, 그들 중에는 엄행수처럼 자신의 직분에 충실하며",
    start: 20.36,
    end: 24.42,
  },
  {
    index: 5,
    text: "깊은 철학을 가진 이도 있었습니다.",
    start: 24.42,
    end: 27.42,
  },
  {
    index: 6,
    text: "겉으로는 더럽지만 내면은 청결한, 진정한 '예덕선생'이었죠.",
    start: 27.68,
    end: 31.66,
  },
];

const summaryPoints = [
  {
    number: 1,
    title: "선구자",
    subtitle: "기피하는 곳에서 가치 발견",
    icon: "💡",
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.15)",
    startTime: 0,
  },
  {
    number: 2,
    title: "순환 경제",
    subtitle: "도시와 농촌을 연결",
    icon: "♻️",
    color: "#28A745",
    bgColor: "rgba(40, 167, 69, 0.15)",
    startTime: 8.5,
  },
  {
    number: 3,
    title: "예덕선생",
    subtitle: "깊은 철학을 가진 인물",
    icon: "⭐",
    color: "#4169E1",
    bgColor: "rgba(65, 105, 225, 0.15)",
    startTime: 20,
  },
];

export const S45: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Calculate point animations
  const pointAnimations = summaryPoints.map((point, index) => {
    const startFrame = point.startTime * fps;
    const opacity = interpolate(
      frame,
      [startFrame, startFrame + fps * 0.5],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const scale = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 12, stiffness: 100 },
    });
    const slideX = interpolate(
      frame,
      [startFrame, startFrame + fps * 0.8],
      [-100, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return { opacity, scale, slideX };
  });

  // Glow effect for active point
  const activePointIndex = summaryPoints.findIndex((point, i) => {
    const nextPoint = summaryPoints[i + 1];
    return currentTime >= point.startTime && (!nextPoint || currentTime < nextPoint.startTime);
  });
  const glowIntensity = interpolate(
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
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [0, fps * 0.3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontFamily,
            fontWeight: 700,
            color: "#4a4a4a",
          }}
        >
          조선시대 매분자, 그들은...
        </div>
      </div>

      {/* Three summary points */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "85%",
        }}
      >
        {summaryPoints.map((point, i) => {
          const anim = pointAnimations[i];
          const isActive = i === activePointIndex;
          return (
            <div
              key={point.number}
              style={{
                opacity: anim.opacity,
                transform: `translateX(${anim.slideX}px) scale(${anim.scale})`,
                padding: "18px 24px",
                background: point.bgColor,
                borderRadius: 16,
                border: `3px solid ${point.color}`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                boxShadow: isActive
                  ? `0 0 ${25 * glowIntensity}px ${point.color}40`
                  : "0 4px 15px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s",
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: point.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isActive
                    ? `0 0 ${15 * glowIntensity}px ${point.color}`
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontFamily,
                    fontWeight: 800,
                    color: "#FFF",
                  }}
                >
                  {point.number}
                </span>
              </div>

              {/* Icon */}
              <div
                style={{
                  fontSize: 40,
                  filter: isActive
                    ? `drop-shadow(0 0 ${10 * glowIntensity}px ${point.color})`
                    : "none",
                }}
              >
                {point.icon}
              </div>

              {/* Text content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 26,
                    fontFamily,
                    fontWeight: 700,
                    color: point.color,
                  }}
                >
                  {point.title}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontFamily,
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  {point.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional emphasis for final point */}
      {currentTime > 27 && (
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: interpolate(
              frame,
              [27 * fps, 27.5 * fps],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              padding: "16px 32px",
              background: "linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(255, 215, 0, 0.1))",
              borderRadius: 12,
              border: "2px solid #B8860B",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontFamily,
                fontWeight: 600,
                color: "#8B7355",
                textAlign: "center",
              }}
            >
              겉으로는 더럽지만 내면은 청결한
              <br />
              <span
                style={{
                  color: "#B8860B",
                  fontWeight: 700,
                  fontSize: 28,
                }}
              >
                진정한 예덕선생
              </span>
            </div>
          </div>
        </div>
      )}

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
