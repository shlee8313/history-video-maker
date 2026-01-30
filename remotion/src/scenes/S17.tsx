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

// Scene S17: Core2 - 장군의 두 얼굴 (똥장군 vs 의례용기)
// Duration: 16.08s (482 frames at 30fps)

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
    text: "문화재청 자료에 따르면,",
    start: 0.0,
    end: 1.36,
  },
  {
    index: 1,
    text: "'장군'은 어떤 것을 담느냐에 따라",
    start: 1.36,
    end: 3.62,
  },
  {
    index: 2,
    text: "똥장군이 되기도 하고,",
    start: 3.62,
    end: 5.26,
  },
  {
    index: 3,
    text: "왕실에서 사용하는 의례용기가 되기도 하는 재미있는 기물입니다.",
    start: 5.26,
    end: 9.24,
  },
  {
    index: 4,
    text: "같은 모양이라도 무엇을 담느냐에 따라 천지차이가 나는 셈이죠.",
    start: 10.2,
    end: 16.08,
  },
];

export const S17: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Source citation
  const sourceOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Ttong Janggun (left)
  const ttongStart = fps * 3.0;
  const ttongOpacity = interpolate(
    frame,
    [ttongStart, ttongStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ttongSlideX = interpolate(
    frame,
    [ttongStart, ttongStart + fps * 0.8],
    [-100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Royal Janggun (right)
  const royalStart = fps * 5.5;
  const royalOpacity = interpolate(
    frame,
    [royalStart, royalStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const royalSlideX = interpolate(
    frame,
    [royalStart, royalStart + fps * 0.8],
    [100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: VS symbol
  const vsStart = fps * 7.0;
  const vsScale = spring({
    frame: frame - vsStart,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const vsOpacity = interpolate(frame, [vsStart, vsStart + fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Conclusion emphasis
  const conclusionStart = fps * 10.0;
  const conclusionOpacity = interpolate(
    frame,
    [conclusionStart, conclusionStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow effects
  const humbleGlow = 0.3;
  const royalGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Source citation */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: sourceOpacity,
          padding: "10px 24px",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily,
            color: "#FFF",
          }}
        >
          📜 문화재청 자료
        </div>
      </div>

      {/* Comparison section */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Ttong Janggun (humble) */}
        <div
          style={{
            opacity: ttongOpacity,
            transform: `translateX(${ttongSlideX}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 200,
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `radial-gradient(circle, rgba(139, 90, 43, ${humbleGlow * 0.3}) 0%, transparent 70%)`,
              borderRadius: 16,
            }}
          >
            <Img
              src={staticFile("assets/artifacts/janggun.png")}
              style={{
                width: 160,
                height: "auto",
                filter: "sepia(0.3) brightness(0.9)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 28,
              fontFamily,
              fontWeight: 700,
              color: "#8B4513",
            }}
          >
            똥장군
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              color: "#666",
            }}
          >
            분뇨 운반용
          </div>
          <div
            style={{
              marginTop: 8,
              padding: "6px 16px",
              background: "#8B4513",
              borderRadius: 20,
              display: "inline-block",
            }}
          >
            <span style={{ fontSize: 16, color: "#FFF" }}>천한 용도</span>
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            opacity: vsOpacity,
            transform: `scale(${vsScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontFamily,
              fontWeight: 900,
              color: "#DC143C",
              textShadow: "0 0 20px rgba(220, 20, 60, 0.5)",
            }}
          >
            VS
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              color: "#666",
            }}
          >
            같은 모양
            <br />
            다른 가치
          </div>
        </div>

        {/* Royal Janggun (noble) */}
        <div
          style={{
            opacity: royalOpacity,
            transform: `translateX(${royalSlideX}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 200,
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `radial-gradient(circle, rgba(255, 215, 0, ${royalGlow * 0.4}) 0%, transparent 70%)`,
              borderRadius: 16,
            }}
          >
            <Img
              src={staticFile("assets/artifacts/janggun.png")}
              style={{
                width: 160,
                height: "auto",
                filter: `drop-shadow(0 0 ${15 * royalGlow}px rgba(255, 215, 0, 0.6)) brightness(1.1)`,
              }}
            />
            {/* Crown overlay */}
            <div
              style={{
                position: "absolute",
                top: -20,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 40,
              }}
            >
              👑
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 28,
              fontFamily,
              fontWeight: 700,
              color: "#FFD700",
              textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
            }}
          >
            의례용 장군
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              color: "#666",
            }}
          >
            왕실 의례용
          </div>
          <div
            style={{
              marginTop: 8,
              padding: "6px 16px",
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              borderRadius: 20,
              display: "inline-block",
            }}
          >
            <span style={{ fontSize: 16, color: "#8B0000", fontWeight: 600 }}>
              귀한 용도
            </span>
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: conclusionOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "20px 40px",
            background: "linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)",
            borderRadius: 16,
            border: "2px solid #8B4513",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily,
              fontWeight: 700,
              color: "#4a4a4a",
            }}
          >
            무엇을 담느냐에 따라 <span style={{ color: "#FFD700" }}>천지차이</span>
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
