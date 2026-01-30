import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S46: Outro - 현대 사회에서의 숨겨진 기회
// Duration: 13.24s (397 frames at 30fps)
// Scene starts at 38.76s in section, ends at 52.0s

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
    text: "오늘 우리 주변에도 이런 '황금 똥' 같은 기회가 숨어있지 않을까요?",
    start: 0.0,
    end: 3.36,
  },
  {
    index: 1,
    text: "남들이 더럽다고, 힘들다고, 돈이 안 된다고 피하는 곳.",
    start: 4.26,
    end: 7.92,
  },
  {
    index: 2,
    text: "하지만 누군가에게는 절실하게 필요한 것.",
    start: 8.98,
    end: 11.48,
  },
  {
    index: 3,
    text: "바로 그곳에 기회가 있습니다.",
    start: 11.92,
    end: 13.24,
  },
];

const avoidedThings = [
  { text: "더럽다", icon: "😷" },
  { text: "힘들다", icon: "😫" },
  { text: "돈이 안 된다", icon: "💸" },
];

export const S46: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Hidden gold reveal
  const goldStart = fps * 0.5;
  const goldOpacity = interpolate(
    frame,
    [goldStart, goldStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const goldGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const goldScale = spring({
    frame: frame - goldStart,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Animation: Avoided things appear
  const avoidStart = fps * 4.0;
  const avoidOpacity = (index: number) =>
    interpolate(
      frame,
      [avoidStart + index * fps * 0.4, avoidStart + index * fps * 0.4 + fps * 0.3],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Animation: Transform from gray to gold
  const transformStart = fps * 9.0;
  const transformProgress = interpolate(
    frame,
    [transformStart, transformStart + fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Spotlight on opportunity
  const spotlightStart = fps * 11.5;
  const spotlightOpacity = interpolate(
    frame,
    [spotlightStart, spotlightStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const spotlightScale = spring({
    frame: frame - spotlightStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Background color transition
  const bgGrayToGold = interpolate(
    frame,
    [transformStart, transformStart + fps * 2],
    [0.7, 0.1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Subtle background gradient transition */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, ${(1 - bgGrayToGold) * 0.15}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* "Golden Poop" opportunity concept */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translateX(-50%) scale(${goldScale})`,
          opacity: goldOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255, 215, 0, ${0.4 + goldGlow * 0.4}) 0%, rgba(184, 134, 11, 0.2) 70%, transparent 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: `0 0 ${40 * goldGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <span
            style={{
              fontSize: 64,
              filter: `drop-shadow(0 0 ${15 * goldGlow}px rgba(255, 215, 0, 0.8))`,
            }}
          >
            💩
          </span>
        </div>
        <div
          style={{
            marginTop: 15,
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: "#B8860B",
            textShadow: `0 0 ${10 * goldGlow}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          황금 똥
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#8B7355",
          }}
        >
          숨겨진 기회
        </div>
      </div>

      {/* Things people avoid */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 30,
        }}
      >
        {avoidedThings.map((thing, i) => {
          const grayLevel = 1 - transformProgress;
          return (
            <div
              key={thing.text}
              style={{
                opacity: avoidOpacity(i),
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 16,
                  background: interpolate(
                    transformProgress,
                    [0, 1],
                    [0, 0.2],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  ) > 0.1
                    ? `rgba(255, 215, 0, ${0.15 + transformProgress * 0.2})`
                    : "rgba(128, 128, 128, 0.15)",
                  border: `2px solid ${transformProgress > 0.5 ? "#FFD700" : "#888"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    filter: transformProgress > 0.5
                      ? `brightness(1.2) drop-shadow(0 0 10px rgba(255, 215, 0, ${transformProgress}))`
                      : `grayscale(${grayLevel})`,
                  }}
                >
                  {thing.icon}
                </span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  fontFamily,
                  fontWeight: 600,
                  color: transformProgress > 0.5 ? "#B8860B" : "#666",
                }}
              >
                {thing.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows transforming to opportunity */}
      <div
        style={{
          position: "absolute",
          top: "68%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: transformProgress,
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: "#FFD700",
            textAlign: "center",
          }}
        >
          ↓ ↓ ↓
        </div>
      </div>

      {/* Spotlight on opportunity */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: `translateX(-50%) scale(${spotlightScale})`,
          opacity: spotlightOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.3 + goldGlow * 0.2}), rgba(184, 134, 11, 0.15))`,
            borderRadius: 20,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${50 * goldGlow}px rgba(255, 215, 0, 0.6)`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
          <div
            style={{
              fontSize: 32,
              fontFamily,
              fontWeight: 800,
              color: "#B8860B",
              textShadow: `0 0 ${15 * goldGlow}px rgba(255, 215, 0, 0.5)`,
            }}
          >
            바로 그곳에 기회가 있습니다
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
