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

// Scene S21: Core3 - 예덕선생 엄행수 소개
// Duration: 18.44s (553 frames at 30fps)

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
    text: "'예덕'의 '예'는 '더럽다'는 뜻입니다.",
    start: 0.0,
    end: 1.78,
  },
  {
    index: 1,
    text: "그런데 그 더러운 일에서 '덕'을 찾았다는 역설적인 이름이죠.",
    start: 1.78,
    end: 5.44,
  },
  {
    index: 2,
    text: "예덕선생, 즉 엄행수는 종본탑 동편에 살면서",
    start: 6.14,
    end: 9.28,
  },
  {
    index: 3,
    text: "분뇨를 치는 역부의 우두머리였습니다.",
    start: 9.28,
    end: 11.9,
  },
  {
    index: 4,
    text: "'행수'란 막일꾼 가운데 나이가 많은 사람에 대한 칭호이고,",
    start: 13.44,
    end: 16.94,
  },
  {
    index: 5,
    text: "'엄'은 그의 성입니다.",
    start: 17.48,
    end: 18.44,
  },
];

export const S21: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Name breakdown - 예
  const yeOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Name breakdown - 덕
  const deokStart = fps * 2.0;
  const deokOpacity = interpolate(
    frame,
    [deokStart, deokStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Eom Haengsu character
  const characterStart = fps * 6.0;
  const characterOpacity = interpolate(
    frame,
    [characterStart, characterStart + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const characterScale = spring({
    frame: frame - characterStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Animation: Location map
  const mapStart = fps * 7.5;
  const mapOpacity = interpolate(frame, [mapStart, mapStart + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Title badge (행수)
  const badgeStart = fps * 13.0;
  const badgeOpacity = interpolate(
    frame,
    [badgeStart, badgeStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const badgeSlide = interpolate(
    frame,
    [badgeStart, badgeStart + fps * 0.8],
    [50, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Name breakdown (엄)
  const nameStart = fps * 17.0;
  const nameOpacity = interpolate(
    frame,
    [nameStart, nameStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Name breakdown: 예덕 */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* 예 */}
        <div
          style={{
            opacity: yeOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontFamily,
              fontWeight: 900,
              color: "#8B4513",
            }}
          >
            예
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 32,
              color: "#666",
              padding: "8px 16px",
              background: "rgba(139, 69, 19, 0.1)",
              borderRadius: 8,
            }}
          >
            더럽다
          </div>
        </div>

        {/* + */}
        <div
          style={{
            opacity: Math.min(yeOpacity, deokOpacity),
            fontSize: 64,
            color: "#4a4a4a",
          }}
        >
          +
        </div>

        {/* 덕 */}
        <div
          style={{
            opacity: deokOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontFamily,
              fontWeight: 900,
              color: "#FFD700",
              textShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
            }}
          >
            덕
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 32,
              color: "#666",
              padding: "8px 16px",
              background: "rgba(255, 215, 0, 0.1)",
              borderRadius: 8,
            }}
          >
            덕(德)
          </div>
        </div>

        {/* = */}
        <div
          style={{
            opacity: deokOpacity,
            fontSize: 64,
            color: "#4a4a4a",
          }}
        >
          =
        </div>

        {/* 예덕 */}
        <div
          style={{
            opacity: deokOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontFamily,
              fontWeight: 900,
              background: "linear-gradient(135deg, #8B4513 0%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            예덕
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              color: "#666",
              fontStyle: "italic",
            }}
          >
            역설적 이름
          </div>
        </div>
      </div>

      {/* Eom Haengsu character */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "20%",
          opacity: characterOpacity,
          transform: `scale(${characterScale})`,
        }}
      >
        <Img
          src={staticFile("assets/images/eom_haengsu.png")}
          style={{
            width: 320,
            height: "auto",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -35,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 36,
            fontFamily,
            fontWeight: 700,
            color: "#FFD700",
            whiteSpace: "nowrap",
          }}
        >
          엄행수
        </div>
      </div>

      {/* Location map */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "10%",
          opacity: mapOpacity,
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("assets/maps/jongbontap_location.png")}
          style={{
            width: 350,
            height: "auto",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          }}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            fontFamily,
            color: "#DC143C",
            fontWeight: 600,
          }}
        >
          📍 종본탑 동편
        </div>
      </div>

      {/* Title badge explanations */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: `translateX(-50%) translateY(${badgeSlide}px)`,
          opacity: badgeOpacity,
          display: "flex",
          gap: 40,
        }}
      >
        {/* 행수 explanation */}
        <div
          style={{
            padding: "16px 32px",
            background: "rgba(139, 69, 19, 0.1)",
            borderRadius: 12,
            border: "2px solid #8B4513",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontFamily,
              fontWeight: 700,
              color: "#8B4513",
            }}
          >
            행수 (行首)
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              color: "#666",
            }}
          >
            막일꾼 중 연장자
            <br />
            우두머리
          </div>
        </div>

        {/* 엄 explanation */}
        <div
          style={{
            padding: "16px 32px",
            background: "rgba(255, 215, 0, 0.1)",
            borderRadius: 12,
            border: "2px solid #FFD700",
            opacity: nameOpacity,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontFamily,
              fontWeight: 700,
              color: "#8B0000",
            }}
          >
            엄 (嚴)
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              color: "#666",
            }}
          >
            그의 성씨
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
