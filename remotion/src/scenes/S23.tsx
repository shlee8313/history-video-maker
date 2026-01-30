import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

// Scene S23: Core3 - 박지원의 기록 (엄행수 칭송)
// Duration: 18.74s (562 frames at 30fps)

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
    text: "박지원은 이렇게 기록합니다.",
    start: 0.0,
    end: 1.2,
  },
  {
    index: 1,
    text: '"엄행수는 똥을 져서 밥을 먹고 있으니 지극히 불결하다 하겠으나,',
    start: 1.4,
    end: 4.28,
  },
  {
    index: 2,
    text: '그가 밥벌이하는 일의 내용을 따져 보자면 지극히 향기로운 것이다."',
    start: 4.14,
    end: 8.46,
  },
  {
    index: 3,
    text: '"그의 몸가짐은 더럽기 짝이 없지만',
    start: 9.26,
    end: 11.5,
  },
  {
    index: 4,
    text: "의로움을 지키는 자세는 가장 꿋꿋하며,",
    start: 11.74,
    end: 14.28,
  },
  {
    index: 5,
    text: '비록 만종의 녹봉을 받게 되더라도 지조를 바꾸지 않을 것이다."',
    start: 14.74,
    end: 18.74,
  },
];

export const S23: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Scroll unroll
  const scrollProgress = interpolate(frame, [0, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quote sections with typewriter effect
  const quote1Start = fps * 1.5;
  const quote1 = "엄행수는 똥을 져서 밥을 먹고 있으니 지극히 불결하다 하겠으나,";
  const quote1Progress = interpolate(
    frame,
    [quote1Start, quote1Start + fps * 2.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const quote2Start = fps * 4.5;
  const quote2 = "그가 밥벌이하는 일의 내용을 따져 보자면 지극히 향기로운 것이다.";
  const quote2Progress = interpolate(
    frame,
    [quote2Start, quote2Start + fps * 3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const quote3Start = fps * 9.0;
  const quote3 = "그의 몸가짐은 더럽기 짝이 없지만 의로움을 지키는 자세는 가장 꿋꿋하며,";
  const quote3Progress = interpolate(
    frame,
    [quote3Start, quote3Start + fps * 3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const quote4Start = fps * 14.5;
  const quote4 = "비록 만종의 녹봉을 받게 되더라도 지조를 바꾸지 않을 것이다.";
  const quote4Progress = interpolate(
    frame,
    [quote4Start, quote4Start + fps * 3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Highlight keywords
  const highlightWords = ["불결", "향기로운", "더럽기", "의로움", "지조"];

  const renderQuote = (text: string, progress: number) => {
    const visibleLength = Math.floor(text.length * progress);
    const visibleText = text.slice(0, visibleLength);

    return visibleText.split(/(\s+)/).map((word, i) => {
      const isHighlight = highlightWords.some((hw) => word.includes(hw));
      return (
        <span
          key={i}
          style={{
            color: isHighlight ? "#FFD700" : "#333",
            fontWeight: isHighlight ? 700 : 400,
            textShadow: isHighlight ? "0 0 10px rgba(255, 215, 0, 0.5)" : "none",
          }}
        >
          {word}
        </span>
      );
    });
  };

  // Glow animation for integrity icon
  const glowIntensity = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Scroll background */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "88%",
          height: `${scrollProgress * 82}%`,
          background: "linear-gradient(180deg, rgba(245, 235, 210, 0.95) 0%, rgba(235, 220, 190, 0.95) 100%)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* Scroll decoration */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: "linear-gradient(180deg, rgba(139, 69, 19, 0.3), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: "linear-gradient(0deg, rgba(139, 69, 19, 0.3), transparent)",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: scrollProgress,
          fontSize: 40,
          fontFamily,
          fontWeight: 700,
          color: "#8B4513",
        }}
      >
        📜 박지원의 기록
      </div>

      {/* Quote container */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "75%",
          opacity: scrollProgress,
        }}
      >
        {/* Quote 1-2: 불결 vs 향기로운 */}
        <div
          style={{
            marginBottom: 24,
            padding: "20px 24px",
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: 8,
            borderLeft: "4px solid #8B4513",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily,
              lineHeight: 1.8,
              minHeight: 80,
            }}
          >
            "{renderQuote(quote1, quote1Progress)}"
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily,
              lineHeight: 1.8,
              marginTop: 8,
              minHeight: 40,
            }}
          >
            "{renderQuote(quote2, quote2Progress)}"
          </div>
        </div>

        {/* Quote 3-4: 더럽기 vs 의로움 */}
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: 8,
            borderLeft: "4px solid #FFD700",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily,
              lineHeight: 1.8,
              minHeight: 80,
            }}
          >
            "{renderQuote(quote3, quote3Progress)}"
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily,
              lineHeight: 1.8,
              marginTop: 8,
              minHeight: 40,
            }}
          >
            "{renderQuote(quote4, quote4Progress)}"
          </div>
        </div>
      </div>

      {/* Integrity icon */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          opacity: quote4Progress,
          textAlign: "center",
          filter: `drop-shadow(0 0 ${15 * glowIntensity}px rgba(255, 215, 0, ${glowIntensity}))`,
        }}
      >
        <div style={{ fontSize: 80 }}>🏅</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 32,
            fontFamily,
            fontWeight: 700,
            color: "#FFD700",
          }}
        >
          지조
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
