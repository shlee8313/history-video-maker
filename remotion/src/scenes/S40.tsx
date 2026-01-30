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

// Scene S40: Insight - 박지원의 근대적 의식
// Duration: 10.38s (311 frames at 30fps)

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
    text: "연구자들은 예덕선생전에서 박지원의 '근대적 의식'을 읽어냅니다.",
    start: 0.0,
    end: 4.02,
  },
  {
    index: 1,
    text: "단순히 엄행수의 근면과 검소를 칭찬한 것이 아니라,",
    start: 4.72,
    end: 8.12,
  },
  {
    index: 2,
    text: "그 너머에 있는 것을 봤다는 거죠.",
    start: 8.12,
    end: 10.38,
  },
];

const modernKeywords = ["평등", "노동존중", "경제주체"];

export const S40: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Park Jiwon portrait with visionary glow
  const parkOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const parkGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Keywords fade in progressively
  const keywordStart = fps * 4.5;
  const keywordOpacity = (index: number) =>
    interpolate(
      frame,
      [keywordStart + index * fps * 0.6, keywordStart + index * fps * 0.6 + fps * 0.4],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  const keywordScale = (index: number) =>
    spring({
      frame: frame - (keywordStart + index * fps * 0.6),
      fps,
      config: { damping: 12, stiffness: 120 },
    });

  // Animation: "Beyond surface" effect - layers reveal
  const beyondStart = fps * 8.0;
  const beyondOpacity = interpolate(
    frame,
    [beyondStart, beyondStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const layerPeel = interpolate(
    frame,
    [beyondStart, beyondStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Enlightenment light rays
  const lightRayRotation = interpolate(frame, [0, fps * 10], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Enlightenment light rays from behind portrait */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: 400,
          height: 400,
          opacity: parkOpacity * parkGlow * 0.6,
          transform: `rotate(${lightRayRotation}deg)`,
        }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 4,
              height: 200,
              background: `linear-gradient(180deg, rgba(255, 215, 0, 0.8) 0%, transparent 100%)`,
              transformOrigin: "center top",
              transform: `rotate(${angle}deg) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Park Jiwon portrait with visionary glow */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "8%",
          opacity: parkOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            filter: `drop-shadow(0 0 ${25 * parkGlow}px rgba(255, 215, 0, ${parkGlow * 0.8}))`,
          }}
        >
          <Img
            src={staticFile("assets/portraits/park_jiwon.png")}
            style={{
              width: 280,
              height: "auto",
              borderRadius: 12,
            }}
          />
          {/* Vision eye effect */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 215, 0, ${parkGlow * 0.4}) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        </div>
        {/* Name label */}
        <div
          style={{
            marginTop: 15,
            textAlign: "center",
            fontSize: 24,
            fontFamily,
            fontWeight: 700,
            color: "#B8860B",
          }}
        >
          박지원
        </div>
      </div>

      {/* Modern consciousness keywords */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: "#4169E1",
            opacity: interpolate(frame, [fps * 3.5, fps * 4.0], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginBottom: 10,
          }}
        >
          근대적 의식
        </div>
        {modernKeywords.map((keyword, i) => (
          <div
            key={keyword}
            style={{
              opacity: keywordOpacity(i),
              transform: `scale(${keywordScale(i)})`,
              padding: "14px 28px",
              background: "linear-gradient(135deg, rgba(65, 105, 225, 0.15), rgba(255, 215, 0, 0.1))",
              borderRadius: 12,
              border: "2px solid #4169E1",
              boxShadow: "0 4px 12px rgba(65, 105, 225, 0.2)",
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontFamily,
                fontWeight: 600,
                color: "#1E3A8A",
              }}
            >
              {keyword}
            </div>
          </div>
        ))}
      </div>

      {/* Beyond surface - layered reveal effect */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: beyondOpacity,
        }}
      >
        {/* Layers peeling back */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Surface layer */}
          <div
            style={{
              width: 120,
              height: 80,
              background: "rgba(128, 128, 128, 0.6)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateX(${-layerPeel * 30}px) rotateY(${layerPeel * 20}deg)`,
              opacity: 1 - layerPeel * 0.5,
            }}
          >
            <span style={{ fontSize: 20, color: "#666" }}>표면</span>
          </div>

          {/* Arrow */}
          <div
            style={{
              fontSize: 36,
              color: "#FFD700",
              transform: `scale(${1 + layerPeel * 0.2})`,
            }}
          >
            →
          </div>

          {/* Deep meaning layer */}
          <div
            style={{
              width: 150,
              height: 100,
              background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.3 + layerPeel * 0.3}), rgba(65, 105, 225, 0.2))`,
              borderRadius: 12,
              border: "3px solid #FFD700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${20 * layerPeel}px rgba(255, 215, 0, 0.5)`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontFamily,
                fontWeight: 700,
                color: "#B8860B",
              }}
            >
              그 너머
            </span>
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
