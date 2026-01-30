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

// Scene S28: Core5 - 한양의 위생 상태는 좋지 않았다
// Duration: 19.64s (589 frames at 30fps)

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
    text: "그런데 매분자들이 열심히 일했음에도 불구하고,",
    start: 0.0,
    end: 2.88,
  },
  {
    index: 1,
    text: "한양의 위생 상태는 그리 좋지 않았습니다.",
    start: 2.88,
    end: 5.86,
  },
  {
    index: 2,
    text: "조선 후기 실학자 박제가의 북학의에는",
    start: 7.48,
    end: 12.12,
  },
  {
    index: 3,
    text: "한양 곳곳이 인분으로 뒤덮여 지저분했다는 기록이 있습니다.",
    start: 12.32,
    end: 14.88,
  },
  {
    index: 4,
    text: "20만 명이 쏟아내는 분뇨를 매분자들만으로 감당하기엔 역부족이었던 거죠.",
    start: 14.68,
    end: 19.64,
  },
];

export const S28: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: "그런데" transition text
  const transitionOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const transitionScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Animation: Maebunza working (left side)
  const maebunzaOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Warning sign for hygiene
  const hygieneStart = fps * 3.0;
  const hygieneOpacity = interpolate(
    frame,
    [hygieneStart, hygieneStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Book (북학의) slide in
  const bookStart = fps * 7.5;
  const bookOpacity = interpolate(
    frame,
    [bookStart, bookStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const bookSlide = interpolate(
    frame,
    [bookStart, bookStart + fps * 0.8],
    [-100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Population count
  const popStart = fps * 15.0;
  const popProgress = interpolate(
    frame,
    [popStart, popStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayPop = Math.floor(popProgress * 200000);
  const popOpacity = interpolate(
    frame,
    [popStart, popStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Dirty color pulse
  const dirtyPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.3, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* "그런데" transition text */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: `translateX(-50%) scale(${transitionScale})`,
          opacity: interpolate(frame, [0, fps * 0.5, fps * 2.5, fps * 3], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontSize: 72,
          fontFamily,
          fontWeight: 700,
          color: "#DC143C",
          textShadow: textStroke,
        }}
      >
        그런데...
      </div>

      {/* Maebunza working hard (silhouette) */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "12%",
          opacity: maebunzaOpacity,
        }}
      >
        <div
          style={{
            width: 160,
            height: 220,
            background: "linear-gradient(180deg, #5D4E37 0%, #3D3426 100%)",
            borderRadius: "40% 40% 20% 20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ fontSize: 100 }}>🧹</div>
        </div>
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 48,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          매분자
        </div>
      </div>

      {/* Hygiene warning box */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          right: "8%",
          opacity: hygieneOpacity,
          padding: "28px 40px",
          background: `rgba(139, 69, 19, ${dirtyPulse})`,
          borderRadius: 16,
          border: "3px solid #8B4513",
          boxShadow: "0 4px 20px rgba(139, 69, 19, 0.4)",
        }}
      >
        <div style={{ fontSize: 100, textAlign: "center" }}>⚠️</div>
        <div
          style={{
            marginTop: 12,
            fontSize: 52,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          위생 상태
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 80,
            textAlign: "center",
            color: "#FFD700",
          }}
        >
          ❌
        </div>
        <div
          style={{
            fontSize: 48,
            color: "#FFF",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          좋지 않음
        </div>
      </div>

      {/* 북학의 book reference */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          transform: `translateX(${bookSlide}px)`,
          opacity: bookOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 36px",
            background: "linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%)",
            borderRadius: 8,
            border: "2px solid #8B4513",
            boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontFamily,
              fontWeight: 700,
              color: "#5D4037",
              textAlign: "center",
            }}
          >
            北學議
          </div>
          <div
            style={{
              fontSize: 40,
              fontFamily,
              color: "#795548",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            박제가
          </div>
        </div>
      </div>

      {/* Quote box */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "55%",
          transform: "translateX(-50%)",
          opacity: bookOpacity,
          maxWidth: 700,
        }}
      >
        <div
          style={{
            padding: "24px 36px",
            background: "rgba(245, 222, 179, 0.9)",
            borderRadius: 12,
            border: "2px solid #8B4513",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontFamily,
              fontStyle: "italic",
              color: "#5D4037",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            "한양 곳곳이 인분으로 뒤덮여 지저분하다"
          </div>
        </div>
      </div>

      {/* Population counter */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: popOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "20px 40px",
            background: "rgba(220, 20, 60, 0.1)",
            borderRadius: 12,
            border: "2px solid #DC143C",
          }}
        >
          <div style={{ fontSize: 100 }}>👥</div>
          <div>
            <div
              style={{
                fontSize: 72,
                fontFamily,
                fontWeight: 800,
                color: "#DC143C",
                textShadow: textStroke,
              }}
            >
              {displayPop.toLocaleString()}명
            </div>
            <div
              style={{
                fontSize: 48,
                fontFamily,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              역부족
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
