import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S43: Insight - 신분 체제를 넘어선 우정, 평등 사회의 비전
// Duration: 15.72s (472 frames at 30fps)
// Scene starts at 46.04s in section, ends at 61.76s

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
    text: "뭇 양반들이 교우 관계를 맺고 싶어 하는 최고의 학자 선귤자가",
    start: 0.0,
    end: 2.72,
  },
  {
    index: 1,
    text: "최하층 신분인 엄행수와 교우한다는 설정에는,",
    start: 4.66,
    end: 7.84,
  },
  {
    index: 2,
    text: "당시 봉건 사회의 엄격한 신분 체제에 대한 부정적 인식이 드러납니다.",
    start: 7.84,
    end: 12.46,
  },
  {
    index: 3,
    text: "평등한 사회를 꿈꾸는 작가의 의지가 반영된 것이죠.",
    start: 12.92,
    end: 15.72,
  },
];

const classPyramidLevels = [
  { label: "왕족", width: 60, color: "#FFD700" },
  { label: "양반", width: 120, color: "#C0C0C0" },
  { label: "중인", width: 180, color: "#CD853F" },
  { label: "상민", width: 240, color: "#8B7355" },
  { label: "천민", width: 300, color: "#5D4E37" },
];

export const S43: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Class pyramid with cracking effect
  const pyramidOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crackStart = fps * 8.0;
  const crackProgress = interpolate(
    frame,
    [crackStart, crackStart + fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Scholar and Eom meeting
  const meetingStart = fps * 4.5;
  const meetingOpacity = interpolate(
    frame,
    [meetingStart, meetingStart + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const meetingScale = spring({
    frame: frame - meetingStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Animation: Equality symbol
  const equalityStart = fps * 10.0;
  const equalityOpacity = interpolate(
    frame,
    [equalityStart, equalityStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const equalityGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Park Jiwon dream text
  const dreamStart = fps * 12.5;
  const dreamOpacity = interpolate(
    frame,
    [dreamStart, dreamStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dreamScale = spring({
    frame: frame - dreamStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Dawn light for new era
  const dawnProgress = interpolate(
    frame,
    [fps * 10, fps * 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Dawn light gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 50% 0%, rgba(255, 200, 100, ${dawnProgress * 0.2}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Class pyramid (left side) with cracking effect */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          opacity: pyramidOpacity * (1 - crackProgress * 0.5),
          transform: `scale(${1 - crackProgress * 0.1})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {classPyramidLevels.map((level, i) => (
            <div
              key={level.label}
              style={{
                width: level.width,
                height: 32,
                background: level.color,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: crackProgress > 0.3
                  ? `translateX(${(Math.random() - 0.5) * crackProgress * 20}px) rotate(${(Math.random() - 0.5) * crackProgress * 5}deg)`
                  : "none",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontFamily,
                  fontWeight: 600,
                  color: i < 2 ? "#000" : "#FFF",
                }}
              >
                {level.label}
              </span>
              {/* Crack lines */}
              {crackProgress > 0.2 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${30 + i * 10}%`,
                    width: 2,
                    height: level.width * 0.3,
                    background: "#DC2626",
                    transform: `rotate(${45 + i * 15}deg)`,
                    opacity: crackProgress,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {/* Breaking barrier text */}
        {crackProgress > 0.5 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-10deg)",
              fontSize: 24,
              fontFamily,
              fontWeight: 800,
              color: "#DC2626",
              opacity: crackProgress - 0.5,
            }}
          >
            ✖ 신분 철폐
          </div>
        )}
      </div>

      {/* Scholar and Eom together (center) */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: `translateX(-50%) scale(${meetingScale})`,
          opacity: meetingOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 20,
          }}
        >
          {/* Scholar (Seongyulja) */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 100,
                height: 140,
                background: "linear-gradient(180deg, #1E3A8A 0%, #1E40AF 100%)",
                borderRadius: "30% 30% 20% 20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(30, 58, 138, 0.4)",
              }}
            >
              <span style={{ fontSize: 40 }}>📚</span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 16,
                fontFamily,
                fontWeight: 600,
                color: "#1E3A8A",
              }}
            >
              선귤자
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>최고의 학자</div>
          </div>

          {/* Handshake/connection */}
          <div
            style={{
              fontSize: 48,
              marginBottom: 60,
              filter: `drop-shadow(0 0 ${10 * equalityGlow}px rgba(255, 215, 0, 0.8))`,
            }}
          >
            🤝
          </div>

          {/* Eom Haengsu */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 100,
                height: 140,
                background: "linear-gradient(180deg, #5D4E37 0%, #3D3426 100%)",
                borderRadius: "30% 30% 20% 20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(93, 78, 55, 0.4)",
              }}
            >
              <span style={{ fontSize: 40 }}>🧹</span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 16,
                fontFamily,
                fontWeight: 600,
                color: "#8B7355",
              }}
            >
              엄행수
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>최하층 신분</div>
          </div>
        </div>

        {/* Equal level indicator */}
        <div
          style={{
            marginTop: 20,
            height: 4,
            width: 300,
            background: `linear-gradient(90deg, #1E3A8A, #FFD700, #8B7355)`,
            borderRadius: 2,
            opacity: equalityOpacity,
            boxShadow: `0 0 ${15 * equalityGlow}px rgba(255, 215, 0, 0.5)`,
          }}
        />
      </div>

      {/* Equality symbol (top) */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "15%",
          opacity: equalityOpacity,
          transform: `scale(${1 + equalityGlow * 0.1})`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.3 + equalityGlow * 0.3}), rgba(255, 200, 100, 0.2))`,
            border: "4px solid #FFD700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${30 * equalityGlow}px rgba(255, 215, 0, 0.6)`,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "#B8860B",
            }}
          >
            =
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 18,
            fontFamily,
            fontWeight: 700,
            color: "#B8860B",
          }}
        >
          평등
        </div>
      </div>

      {/* Park Jiwon's dream text */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: `translateX(-50%) scale(${dreamScale})`,
          opacity: dreamOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: `linear-gradient(135deg, rgba(255, 200, 100, ${0.2 + dawnProgress * 0.2}), rgba(255, 215, 0, 0.1))`,
            borderRadius: 16,
            border: "3px solid #FFD700",
            boxShadow: `0 0 ${30 * equalityGlow}px rgba(255, 215, 0, 0.4)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily,
              fontWeight: 700,
              color: "#B8860B",
              textAlign: "center",
            }}
          >
            평등한 사회를 꿈꾸는 작가의 의지
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 18,
              fontFamily,
              color: "#8B7355",
              textAlign: "center",
            }}
          >
            신분을 넘어선 진정한 교우 관계
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
