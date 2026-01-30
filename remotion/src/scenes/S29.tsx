import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S29: Core5 - 고고학 연구 증거
// Duration: 20.44s (613 frames at 30fps)

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
    text: "최근 고고학 연구가 이를 뒷받침합니다.",
    start: 0.0,
    end: 2.14,
  },
  {
    index: 1,
    text: "서울대 의대 인류학·고병리연구실 신동훈 교수팀의 연구 결과를 보면,",
    start: 3.14,
    end: 7.38,
  },
  {
    index: 2,
    text: "경복궁 담장, 광화문 광장의 세종대왕 동상 아래,",
    start: 7.38,
    end: 11.48,
  },
  {
    index: 3,
    text: "시청사 부근, 종묘 광장 등 서울 주요 지점의",
    start: 11.98,
    end: 15.56,
  },
  {
    index: 4,
    text: "조선시대 지층에서 회충과 편충 등의 기생충 알이 대량 발견되었습니다.",
    start: 15.56,
    end: 20.44,
  },
];

const locations = [
  { name: "경복궁", x: 40, y: 25 },
  { name: "광화문", x: 45, y: 40 },
  { name: "시청", x: 50, y: 55 },
  { name: "종묘", x: 60, y: 35 },
];

export const S29: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Research title fade in
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Research lab credit
  const labStart = fps * 3.0;
  const labOpacity = interpolate(
    frame,
    [labStart, labStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Map appear
  const mapStart = fps * 7.0;
  const mapOpacity = interpolate(
    frame,
    [mapStart, mapStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Location pins sequential drop
  const pinDelays = [0, 0.8, 1.6, 2.4];

  // Animation: Parasite discovery
  const parasiteStart = fps * 15.5;
  const parasiteOpacity = interpolate(
    frame,
    [parasiteStart, parasiteStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const parasiteScale = spring({
    frame: frame - parasiteStart,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Science glow
  const scienceGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Research icon and title */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 100 }}>🔬</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 56,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          고고학 연구
        </div>
      </div>

      {/* Research lab credit */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: labOpacity,
          padding: "16px 32px",
          background: "rgba(30, 58, 138, 0.2)",
          borderRadius: 12,
          border: "2px solid #1E3A8A",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: textStroke,
          }}
        >
          서울대 의대 인류학·고병리연구실
        </div>
        <div
          style={{
            fontSize: 32,
            fontFamily,
            color: "#FFFFFF",
            textAlign: "center",
            marginTop: 8,
            textShadow: textStroke,
          }}
        >
          신동훈 교수팀
        </div>
      </div>

      {/* Seoul map visualization */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 750,
          height: 400,
          opacity: mapOpacity,
          background: "linear-gradient(135deg, rgba(209, 213, 219, 0.5), rgba(156, 163, 175, 0.3))",
          borderRadius: 16,
          border: "2px solid #6B7280",
        }}
      >
        {/* Map label */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 36,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          서울 주요 발굴 지점
        </div>

        {/* Location pins */}
        {locations.map((loc, i) => {
          const pinStart = mapStart + fps * pinDelays[i];
          const pinOpacity = interpolate(
            frame,
            [pinStart, pinStart + fps * 0.3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const pinDrop = interpolate(
            frame,
            [pinStart, pinStart + fps * 0.4],
            [-30, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const ripple = interpolate(
            frame,
            [pinStart + fps * 0.3, pinStart + fps * 1],
            [0, 50],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const rippleOpacity = interpolate(
            frame,
            [pinStart + fps * 0.3, pinStart + fps * 1],
            [0.8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={loc.name}
              style={{
                position: "absolute",
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transform: `translate(-50%, calc(-50% + ${pinDrop}px))`,
                opacity: pinOpacity,
              }}
            >
              {/* Ripple effect */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: ripple,
                  height: ripple,
                  borderRadius: "50%",
                  border: `2px solid rgba(220, 38, 38, ${rippleOpacity})`,
                }}
              />
              {/* Pin */}
              <div style={{ fontSize: 56, textAlign: "center" }}>📍</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 28,
                  fontFamily,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  textShadow: textStroke,
                }}
              >
                {loc.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Parasite discovery result */}
      <div
        style={{
          position: "absolute",
          bottom: "16%",
          left: "50%",
          transform: `translateX(-50%) scale(${parasiteScale})`,
          opacity: parasiteOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "20px 36px",
            background: `rgba(220, 38, 38, ${0.1 + scienceGlow * 0.1})`,
            borderRadius: 12,
            border: "2px solid #DC2626",
            boxShadow: `0 0 ${15 * scienceGlow}px rgba(220, 38, 38, 0.3)`,
          }}
        >
          <div style={{ fontSize: 80 }}>🔴</div>
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
              기생충 알 대량 발견
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
              회충, 편충 등
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
