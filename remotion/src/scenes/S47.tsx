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

// Scene S47: Outro - 예덕선생의 교훈, 현대인에게 전하는 메시지
// Duration: 16.82s (505 frames at 30fps)
// Scene starts at 53.18s in section, ends at 70.0s

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
    text: "박지원이 엄행수를 존경한 이유는 그가 부자여서가 아니었습니다.",
    start: 0.0,
    end: 5.56,
  },
  {
    index: 1,
    text: "자신의 일에 최선을 다하고,",
    start: 6.82,
    end: 8.5,
  },
  {
    index: 2,
    text: "욕심내지 않으며, 묵묵히 사회에 기여하는 삶의 자세 때문이었죠.",
    start: 8.5,
    end: 13.0,
  },
  {
    index: 3,
    text: "어쩌면 우리 시대에도 이런 '예덕선생'들이 필요한 것 아닐까요?",
    start: 13.48,
    end: 16.82,
  },
];

const virtues = [
  { text: "최선", icon: "💪" },
  { text: "무욕", icon: "🧘" },
  { text: "기여", icon: "🤝" },
];

export const S47: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Park Jiwon portrait with reverent glow
  const parkOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const parkGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.5, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Virtues fade in sequentially
  const virtuesStart = fps * 6.5;
  const virtueOpacity = (index: number) =>
    interpolate(
      frame,
      [virtuesStart + index * fps * 0.8, virtuesStart + index * fps * 0.8 + fps * 0.4],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  const virtueScale = (index: number) =>
    spring({
      frame: frame - (virtuesStart + index * fps * 0.8),
      fps,
      config: { damping: 12, stiffness: 120 },
    });

  // Animation: Modern yedeok silhouettes
  const modernStart = fps * 11.0;
  const modernOpacity = interpolate(
    frame,
    [modernStart, modernStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Question to viewer
  const questionStart = fps * 13.0;
  const questionOpacity = interpolate(
    frame,
    [questionStart, questionStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const questionScale = spring({
    frame: frame - questionStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Warm glow effect
  const warmGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Warm light overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 20% 30%, rgba(255, 200, 100, ${warmGlow * 0.1}) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Park Jiwon portrait (left) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "8%",
          opacity: parkOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            filter: `drop-shadow(0 0 ${20 * parkGlow}px rgba(255, 200, 100, ${parkGlow * 0.6}))`,
          }}
        >
          <Img
            src={staticFile("assets/portraits/park_jiwon.png")}
            style={{
              width: 220,
              height: "auto",
              borderRadius: 12,
            }}
          />
          {/* Warm aura */}
          <div
            style={{
              position: "absolute",
              inset: -15,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 200, 100, ${parkGlow * 0.2}) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 20,
            fontFamily,
            fontWeight: 700,
            color: "#8B7355",
          }}
        >
          박지원
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#A0845C",
          }}
        >
          존경의 이유
        </div>
      </div>

      {/* Virtues (center) */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontFamily,
            fontWeight: 700,
            color: "#5D4E37",
            textAlign: "center",
            opacity: interpolate(frame, [fps * 6, fps * 6.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          엄행수의 덕목
        </div>
        <div
          style={{
            display: "flex",
            gap: 25,
          }}
        >
          {virtues.map((virtue, i) => (
            <div
              key={virtue.text}
              style={{
                opacity: virtueOpacity(i),
                transform: `scale(${virtueScale(i)})`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255, 200, 100, 0.2), rgba(184, 134, 11, 0.1))",
                  border: "3px solid #B8860B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 ${15 * warmGlow}px rgba(255, 200, 100, 0.4)`,
                }}
              >
                <span style={{ fontSize: 36 }}>{virtue.icon}</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontFamily,
                  fontWeight: 700,
                  color: "#B8860B",
                }}
              >
                {virtue.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern yedeok silhouettes (right) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "5%",
          opacity: modernOpacity,
        }}
      >
        <Img
          src={staticFile("assets/images/modern_yedeok.png")}
          style={{
            width: 280,
            height: "auto",
            borderRadius: 12,
            filter: `drop-shadow(0 0 ${15 * warmGlow}px rgba(255, 200, 100, 0.4))`,
          }}
        />
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 18,
            fontFamily,
            fontWeight: 600,
            color: "#5D4E37",
          }}
        >
          현대의 예덕선생들
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#8B7355",
          }}
        >
          청소부, 환경미화원, 돌봄노동자...
        </div>
      </div>

      {/* Question to viewer */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: `translateX(-50%) scale(${questionScale})`,
          opacity: questionOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: "linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(184, 134, 11, 0.08))",
            borderRadius: 16,
            border: "3px solid #8B4513",
            boxShadow: "0 8px 30px rgba(139, 69, 19, 0.2)",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily,
              fontWeight: 700,
              color: "#5D4E37",
              textAlign: "center",
            }}
          >
            우리 시대에도 이런
            <br />
            <span
              style={{
                color: "#B8860B",
                fontSize: 32,
                textShadow: `0 0 ${10 * warmGlow}px rgba(255, 200, 100, 0.5)`,
              }}
            >
              '예덕선생'
            </span>
            들이 필요하지 않을까요?
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
