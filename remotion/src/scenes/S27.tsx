import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S27: Core4 - 선귤자의 대답: 도의의 사귐
// Duration: 14.30s (429 frames at 30fps)

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
    text: "선귤자의 대답이 명쾌합니다.",
    start: 0.0,
    end: 1.54,
  },
  {
    index: 1,
    text: "이해로 사귀는 시교, 아첨으로 사귀는 면교는 오래 갈 수 없다.",
    start: 2.34,
    end: 6.48,
  },
  {
    index: 2,
    text: "마음으로 사귀고 덕을 벗하는 도의의 사귐이어야 한다고요.",
    start: 6.9,
    end: 10.52,
  },
  {
    index: 3,
    text: "신분의 귀천이 아니라 인간의 됨됨이를 본 것입니다.",
    start: 11.22,
    end: 14.3,
  },
];

export const S27: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Teacher speaking
  const speakingOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Friendship types reveal
  const type1Start = fps * 2.5;
  const type1Opacity = interpolate(
    frame,
    [type1Start, type1Start + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const type2Start = fps * 4.0;
  const type2Opacity = interpolate(
    frame,
    [type2Start, type2Start + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const type3Start = fps * 6.5;
  const type3Opacity = interpolate(
    frame,
    [type3Start, type3Start + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const type3Scale = spring({
    frame: frame - type3Start,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Animation: Character over status
  const conclusionStart = fps * 11.0;
  const conclusionOpacity = interpolate(
    frame,
    [conclusionStart, conclusionStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const conclusionScale = spring({
    frame: frame - conclusionStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Glow for true friendship
  const glowIntensity = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Teacher speaking */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          opacity: speakingOpacity,
        }}
      >
        <div
          style={{
            width: 120,
            height: 150,
            background: "linear-gradient(180deg, #4169E1 0%, #1E3A8A 100%)",
            borderRadius: "50% 50% 20% 20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(65, 105, 225, 0.3)",
          }}
        >
          <div style={{ fontSize: 80 }}>🗣️</div>
        </div>
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: "#4169E1",
          }}
        >
          선귤자
        </div>
      </div>

      {/* Friendship types comparison */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 30,
        }}
      >
        {/* 시교 (Interest-based) */}
        <div
          style={{
            opacity: type1Opacity,
            textAlign: "center",
            width: 200,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(220, 20, 60, 0.1), rgba(139, 0, 0, 0.1))",
              borderRadius: 12,
              border: "2px solid #DC143C",
            }}
          >
            <div style={{ fontSize: 60 }}>💰</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#DC143C",
              }}
            >
              시교
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: "#666",
              }}
            >
              이해로 사귐
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 50,
                color: "#DC143C",
              }}
            >
              ❌
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#DC143C",
              }}
            >
              오래 못감
            </div>
          </div>
        </div>

        {/* 면교 (Flattery-based) */}
        <div
          style={{
            opacity: type2Opacity,
            textAlign: "center",
            width: 200,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(139, 69, 19, 0.1))",
              borderRadius: 12,
              border: "2px solid #FFA500",
            }}
          >
            <div style={{ fontSize: 60 }}>🎭</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#FFA500",
              }}
            >
              면교
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: "#666",
              }}
            >
              아첨으로 사귐
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 50,
                color: "#FFA500",
              }}
            >
              ❌
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#B8860B",
              }}
            >
              오래 못감
            </div>
          </div>
        </div>

        {/* 도의의 사귐 (True friendship) */}
        <div
          style={{
            opacity: type3Opacity,
            transform: `scale(${type3Scale})`,
            textAlign: "center",
            width: 220,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.2 + glowIntensity * 0.1}), rgba(255, 250, 205, 0.3))`,
              borderRadius: 12,
              border: "3px solid #FFD700",
              boxShadow: `0 0 ${20 * glowIntensity}px rgba(255, 215, 0, 0.5)`,
            }}
          >
            <div
              style={{
                fontSize: 60,
                filter: `drop-shadow(0 0 ${10 * glowIntensity}px rgba(255, 215, 0, 0.8))`,
              }}
            >
              💛
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#B8860B",
              }}
            >
              도의의 사귐
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: "#666",
              }}
            >
              마음으로 사귀고
              <br />
              덕을 벗함
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 50,
                filter: `drop-shadow(0 0 ${8 * glowIntensity}px rgba(34, 139, 34, 0.8))`,
              }}
            >
              ✨
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#228B22",
                fontWeight: 600,
              }}
            >
              진정한 사귐
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion: Character over status */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: `translateX(-50%) scale(${conclusionScale})`,
          opacity: conclusionOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: "linear-gradient(135deg, rgba(65, 105, 225, 0.1), rgba(255, 215, 0, 0.1))",
            borderRadius: 16,
            border: "2px solid #4169E1",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
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
            {/* Status - crossed out */}
            <div style={{ textAlign: "center", opacity: 0.5 }}>
              <div style={{ fontSize: 50 }}>👑</div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily,
                  color: "#999",
                  textDecoration: "line-through",
                }}
              >
                신분
              </div>
            </div>

            <div
              style={{
                fontSize: 50,
                color: "#DC143C",
              }}
            >
              ❌
            </div>

            <div
              style={{
                fontSize: 48,
                color: "#666",
              }}
            >
              →
            </div>

            {/* Character - emphasized */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 60,
                  filter: `drop-shadow(0 0 ${10 * glowIntensity}px rgba(255, 215, 0, 0.8))`,
                }}
              >
                ❤️
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontFamily,
                  fontWeight: 700,
                  color: "#FFD700",
                  textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
                }}
              >
                됨됨이
              </div>
            </div>

            <div
              style={{
                fontSize: 50,
                color: "#228B22",
              }}
            >
              ✓
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 36,
              fontFamily,
              fontWeight: 600,
              color: "#4a4a4a",
            }}
          >
            인간의 됨됨이를 보다
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
