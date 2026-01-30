import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S38: Core7 - 이미 조선시대에 작동하던 순환 경제
// Duration: 11.88s (356 frames at 30fps)

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
    text: "오늘날 유행하는 '순환 경제'나 '자원 재활용'의 개념이",
    start: 0.0,
    end: 3.44,
  },
  {
    index: 1,
    text: "이미 조선시대에 작동하고 있었던 겁니다.",
    start: 3.44,
    end: 5.88,
  },
  {
    index: 2,
    text: "다만 그것을 가능하게 한 사람들이",
    start: 6.9,
    end: 8.76,
  },
  {
    index: 3,
    text: "가장 천시받는 직업이었다는 것이 아이러니하죠.",
    start: 8.76,
    end: 11.88,
  },
];

export const S38: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Modern recycling icon
  const modernOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const modernRotate = interpolate(frame, [0, fps * 10], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Joseon maebunza
  const joseonOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Equals sign
  const equalsStart = fps * 3.0;
  const equalsOpacity = interpolate(
    frame,
    [equalsStart, equalsStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const equalsScale = spring({
    frame: frame - equalsStart,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Animation: Irony reveal
  const ironyStart = fps * 7.0;
  const ironyOpacity = interpolate(
    frame,
    [ironyStart, ironyStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ironyScale = spring({
    frame: frame - ironyStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Glow pulses
  const modernGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const ironyGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Comparison container */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Modern recycling (left) */}
        <div
          style={{
            opacity: modernOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `linear-gradient(135deg, rgba(34, 197, 94, ${0.2 + modernGlow * 0.1}), rgba(21, 128, 61, 0.2))`,
              border: "3px solid #22C55E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${25 * modernGlow}px rgba(34, 197, 94, 0.5)`,
            }}
          >
            <div
              style={{
                fontSize: 72,
                transform: `rotate(${modernRotate}deg)`,
              }}
            >
              ♻️
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              fontFamily,
              fontWeight: 700,
              color: "#15803D",
            }}
          >
            현대
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily,
              color: "#22C55E",
            }}
          >
            순환 경제 · ESG
          </div>
        </div>

        {/* Equals sign */}
        <div
          style={{
            opacity: equalsOpacity,
            transform: `scale(${equalsScale})`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontFamily,
              fontWeight: 900,
              color: "#FFD700",
              textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
            }}
          >
            =
          </div>
        </div>

        {/* Joseon maebunza (right) */}
        <div
          style={{
            opacity: joseonOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(93, 78, 55, 0.2))",
              border: "3px solid #8B4513",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(139, 69, 19, 0.3)",
            }}
          >
            <div
              style={{
                width: 120,
                height: 140,
                background: "linear-gradient(180deg, #5D4E37 0%, #3D3426 100%)",
                borderRadius: "40% 40% 20% 20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 48 }}>🧹</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              fontFamily,
              fontWeight: 700,
              color: "#5D4037",
            }}
          >
            조선시대
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily,
              color: "#8B4513",
            }}
          >
            매분자
          </div>
        </div>
      </div>

      {/* Timeline indicator */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: equalsOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontFamily,
              color: "#666",
            }}
          >
            500년 전
          </div>
          <div
            style={{
              width: 200,
              height: 4,
              background: "linear-gradient(90deg, #8B4513, #22C55E)",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontFamily,
              color: "#666",
            }}
          >
            현재
          </div>
        </div>
      </div>

      {/* Irony box */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: `translateX(-50%) scale(${ironyScale})`,
          opacity: ironyOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 40px",
            background: `linear-gradient(135deg, rgba(239, 68, 68, ${0.1 + ironyGlow * 0.1}), rgba(185, 28, 28, 0.1))`,
            borderRadius: 16,
            border: "3px solid #EF4444",
            boxShadow: `0 0 ${20 * ironyGlow}px rgba(239, 68, 68, 0.4)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 48 }}>🤔</div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily,
                  fontWeight: 700,
                  color: "#DC2626",
                }}
              >
                아이러니
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontFamily,
                  color: "#666",
                  marginTop: 6,
                }}
              >
                순환 경제를 가능케 한 사람들이
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontFamily,
                  color: "#B91C1C",
                  fontWeight: 600,
                }}
              >
                가장 천시받는 직업
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
