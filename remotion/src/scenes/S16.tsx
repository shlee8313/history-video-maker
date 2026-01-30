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

// Scene S16: Core2 - 똥장군 소개
// Duration: 15.54s (466 frames at 30fps)

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
    text: "매분자들은 어떻게 일했을까요?",
    start: 0.0,
    end: 1.66,
  },
  {
    index: 1,
    text: "그들의 도구는 '똥장군'이었습니다.",
    start: 2.34,
    end: 4.36,
  },
  {
    index: 2,
    text: "똥장군은 이름 그대로 분뇨를 담는 장군 모양의 용기입니다.",
    start: 4.36,
    end: 8.88,
  },
  {
    index: 3,
    text: "도기나 나무로 만들어졌으며,",
    start: 9.58,
    end: 11.76,
  },
  {
    index: 4,
    text: "쓰임새에 맞게 크기는 상당히 큰 편이었죠.",
    start: 11.76,
    end: 15.54,
  },
];

export const S16: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Question
  const questionOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionFade = interpolate(frame, [fps * 1.5, fps * 2.0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Janggun reveal
  const janggunStart = fps * 2.5;
  const janggunScale = spring({
    frame: frame - janggunStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const janggunOpacity = interpolate(
    frame,
    [janggunStart, janggunStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: 3D rotation effect (simulated)
  const rotateY = interpolate(frame, [janggunStart, janggunStart + fps * 2], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Size comparison
  const sizeStart = fps * 9.5;
  const sizeOpacity = interpolate(
    frame,
    [sizeStart, sizeStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const personScale = interpolate(
    frame,
    [sizeStart, sizeStart + fps * 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Material labels
  const materialStart = fps * 11.0;
  const materialOpacity = interpolate(
    frame,
    [materialStart, materialStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Spotlight effect
  const spotlightIntensity = interpolate(
    Math.sin((frame / fps) * Math.PI),
    [-1, 1],
    [0.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Question */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: questionOpacity * questionFade,
          fontSize: 42,
          fontFamily,
          fontWeight: 700,
          color: "#4a4a4a",
        }}
      >
        매분자들은 어떻게 일했을까요? 🤔
      </div>

      {/* Spotlight background */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -10%)",
          width: 400,
          height: 400,
          background: `radial-gradient(circle, rgba(255, 215, 0, ${0.2 * spotlightIntensity}) 0%, transparent 70%)`,
          opacity: janggunOpacity,
        }}
      />

      {/* Janggun image */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: `translateX(-50%) scale(${janggunScale}) perspective(500px) rotateY(${rotateY}deg)`,
          opacity: janggunOpacity,
        }}
      >
        <Img
          src={staticFile("assets/artifacts/janggun.png")}
          style={{
            width: 280,
            height: "auto",
            filter: `drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3)) brightness(${spotlightIntensity})`,
          }}
        />
      </div>

      {/* Title label */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: janggunOpacity,
          padding: "12px 32px",
          background: "linear-gradient(135deg, #8B4513 0%, #654321 100%)",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            fontWeight: 800,
            color: "#F5DEB3",
          }}
        >
          똥장군
        </div>
      </div>

      {/* Size comparison */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          right: "15%",
          opacity: sizeOpacity,
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
        }}
      >
        {/* Person silhouette */}
        <div
          style={{
            transform: `scale(${personScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
            }}
          >
            🧑
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#666",
              marginTop: 4,
            }}
          >
            사람
          </div>
        </div>

        {/* Size arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: sizeOpacity,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#8B4513",
            }}
          >
            ←→
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#666",
              marginTop: 4,
            }}
          >
            대형
          </div>
        </div>

        {/* Mini janggun for comparison */}
        <div
          style={{
            transform: `scale(${personScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 90,
            }}
          >
            🏺
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#666",
              marginTop: 4,
            }}
          >
            똥장군
          </div>
        </div>
      </div>

      {/* Material labels */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "15%",
          opacity: materialOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          {/* Ceramic */}
          <div
            style={{
              textAlign: "center",
              padding: "16px 24px",
              background: "rgba(139, 69, 19, 0.1)",
              borderRadius: 12,
              border: "2px solid #8B4513",
            }}
          >
            <div style={{ fontSize: 40 }}>🏺</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 20,
                fontFamily,
                fontWeight: 600,
                color: "#8B4513",
              }}
            >
              도기
            </div>
          </div>

          {/* Wood */}
          <div
            style={{
              textAlign: "center",
              padding: "16px 24px",
              background: "rgba(139, 90, 43, 0.1)",
              borderRadius: 12,
              border: "2px solid #8B5A2B",
            }}
          >
            <div style={{ fontSize: 40 }}>🪵</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 20,
                fontFamily,
                fontWeight: 600,
                color: "#8B5A2B",
              }}
            >
              나무
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
