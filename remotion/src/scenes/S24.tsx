import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S24: Core4 - 깨끗함 속 불결, 더러움 속 청결
// Duration: 11.66s (350 frames at 30fps)

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
    text: "박지원의 통찰은 여기서 끝나지 않습니다.",
    start: 0.0,
    end: 2.28,
  },
  {
    index: 1,
    text: "그는 한 발 더 나아갑니다.",
    start: 3.1,
    end: 5.28,
  },
  {
    index: 2,
    text: '"이 점에서 보면 깨끗한 가운데 불결한 것이 있고',
    start: 6.28,
    end: 9.42,
  },
  {
    index: 3,
    text: '더러운 가운데 청결한 것이 있는 것이다."',
    start: 9.64,
    end: 11.66,
  },
];

export const S24: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Introduction text
  const introOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introFade = interpolate(frame, [fps * 4.5, fps * 5.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Yin-Yang paradox visual
  const paradoxStart = fps * 6.0;
  const paradoxOpacity = interpolate(
    frame,
    [paradoxStart, paradoxStart + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Rotation for yin-yang
  const rotation = interpolate(frame, [paradoxStart, paradoxStart + fps * 10], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Quote text
  const quoteStart = fps * 6.5;
  const quoteOpacity = interpolate(
    frame,
    [quoteStart, quoteStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Reveal inner contrasts
  const revealStart = fps * 8.0;
  const revealProgress = interpolate(
    frame,
    [revealStart, revealStart + fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Introduction text */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: introOpacity * introFade,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontFamily,
            fontWeight: 600,
            color: "#4a4a4a",
          }}
        >
          박지원의 통찰은
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 56,
            fontFamily,
            fontWeight: 700,
            color: "#FFD700",
            textShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
          }}
        >
          여기서 끝나지 않습니다
        </div>
      </div>

      {/* Yin-Yang paradox visual */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          opacity: paradoxOpacity,
        }}
      >
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "linear-gradient(90deg, #FFF 50%, #333 50%)",
            position: "relative",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* White half with dark spot */}
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#333",
              opacity: revealProgress,
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          />

          {/* Dark half with light spot */}
          <div
            style={{
              position: "absolute",
              top: "25%",
              right: "25%",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#FFF",
              opacity: revealProgress,
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            }}
          />

          {/* Inner circles for yin-yang style */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 125,
              height: 125,
              borderRadius: "50%",
              background: "#FFF",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 125,
              height: 125,
              borderRadius: "50%",
              background: "#333",
            }}
          />
        </div>
      </div>

      {/* Labels around yin-yang */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "15%",
          opacity: revealProgress,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            fontWeight: 700,
            color: "#333",
          }}
        >
          깨끗함 속
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 48,
            fontFamily,
            fontWeight: 800,
            color: "#DC143C",
          }}
        >
          불결
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "28%",
          right: "15%",
          opacity: revealProgress,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            fontWeight: 700,
            color: "#666",
          }}
        >
          더러움 속
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 48,
            fontFamily,
            fontWeight: 800,
            color: "#FFD700",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
          }}
        >
          청결
        </div>
      </div>

      {/* Quote */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          opacity: quoteOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 32px",
            background: "rgba(245, 235, 210, 0.9)",
            borderRadius: 12,
            borderLeft: "6px solid #8B4513",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontFamily,
              fontWeight: 500,
              color: "#333",
              lineHeight: 1.8,
              textAlign: "center",
            }}
          >
            "<span style={{ color: "#FFF", background: "#333", padding: "2px 8px", borderRadius: 4 }}>깨끗한</span> 가운데{" "}
            <span style={{ color: "#DC143C", fontWeight: 700 }}>불결한</span> 것이 있고,
            <br />
            <span style={{ color: "#333", background: "#DDD", padding: "2px 8px", borderRadius: 4 }}>더러운</span> 가운데{" "}
            <span style={{ color: "#FFD700", fontWeight: 700, textShadow: "0 0 8px rgba(255, 215, 0, 0.5)" }}>청결한</span> 것이 있는 것이다."
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
