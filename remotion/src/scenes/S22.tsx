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

// Scene S22: Core3 - 이덕무의 엄행수 존경
// Duration: 12.30s (369 frames at 30fps)

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
    text: "박지원의 벗 선귤자,",
    start: 0.0,
    end: 1.62,
  },
  {
    index: 1,
    text: "실제로는 당대 최고의 학자 이덕무는",
    start: 2.22,
    end: 5.0,
  },
  {
    index: 2,
    text: "이 엄행수를 '예덕 선생'이라 부르며 존경했습니다.",
    start: 5.46,
    end: 7.62,
  },
  {
    index: 3,
    text: "왜였을까요?",
    start: 8.48,
    end: 12.3,
  },
];

export const S22: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Lee Deokmu portrait
  const leeOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leeGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.3, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Eom Haengsu figure
  const eomStart = fps * 3.0;
  const eomOpacity = interpolate(
    frame,
    [eomStart, eomStart + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Respect connection
  const connectStart = fps * 5.5;
  const connectProgress = interpolate(
    frame,
    [connectStart, connectStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Question mark
  const questionStart = fps * 8.5;
  const questionScale = spring({
    frame: frame - questionStart,
    fps,
    config: { damping: 8, stiffness: 150 },
  });
  const questionOpacity = interpolate(
    frame,
    [questionStart, questionStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const questionPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.8, 1.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Connection line */}
      <svg
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "40%",
          height: 200,
          opacity: connectProgress,
        }}
      >
        <defs>
          <linearGradient id="respectGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 100 Q ${200 * connectProgress} 50, ${400 * connectProgress} 100`}
          fill="none"
          stroke="url(#respectGradient)"
          strokeWidth="4"
          strokeDasharray="10,5"
        />
        {/* Heart symbol in middle */}
        <text
          x={200 * connectProgress}
          y={60}
          fontSize="30"
          textAnchor="middle"
          opacity={connectProgress}
        >
          🙏
        </text>
      </svg>

      {/* Lee Deokmu portrait */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          opacity: leeOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            filter: `drop-shadow(0 0 ${20 * leeGlow}px rgba(65, 105, 225, ${leeGlow}))`,
          }}
        >
          <Img
            src={staticFile("assets/portraits/lee_deokmu.png")}
            style={{
              width: 320,
              height: "auto",
              borderRadius: 12,
            }}
          />
          {/* Labels */}
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#4169E1",
              }}
            >
              이덕무
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#666",
              }}
            >
              (선귤자)
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "4px 12px",
                background: "rgba(65, 105, 225, 0.1)",
                borderRadius: 20,
                fontSize: 20,
                color: "#4169E1",
              }}
            >
              당대 최고 학자
            </div>
          </div>
        </div>
      </div>

      {/* Eom Haengsu figure */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          opacity: eomOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <Img
            src={staticFile("assets/images/eom_haengsu.png")}
            style={{
              width: 320,
              height: "auto",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          />
          {/* Labels */}
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#FFD700",
                textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
              }}
            >
              엄행수
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#666",
              }}
            >
              (예덕선생)
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "4px 12px",
                background: "rgba(255, 215, 0, 0.1)",
                borderRadius: 20,
                fontSize: 20,
                color: "#8B4513",
              }}
            >
              분뇨 역부 우두머리
            </div>
          </div>
        </div>
      </div>

      {/* "존경" label */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: connectProgress,
          padding: "12px 32px",
          background: "linear-gradient(135deg, rgba(65, 105, 225, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)",
          borderRadius: 30,
          border: "2px solid rgba(255, 215, 0, 0.5)",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontFamily,
            fontWeight: 700,
            color: "#4a4a4a",
          }}
        >
          "예덕 선생" 이라 존경
        </div>
      </div>

      {/* Question mark */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: `translateX(-50%) scale(${questionScale * questionPulse})`,
          opacity: questionOpacity,
        }}
      >
        <Img
          src={staticFile("assets/icons/question_mark.png")}
          style={{
            width: 100,
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(220, 20, 60, 0.5))",
          }}
        />
        <div
          style={{
            marginTop: 16,
            fontSize: 56,
            fontFamily,
            fontWeight: 700,
            color: "#DC143C",
            textAlign: "center",
          }}
        >
          왜?
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
