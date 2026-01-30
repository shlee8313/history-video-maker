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

// Scene S19: Core3 - 박지원과 예덕선생전 소개
// Duration: 11.32s (340 frames at 30fps)

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
    text: "그런데 매분자들 중에는 단순한 노동자를 넘어선 인물도 있었습니다.",
    start: 0.0,
    end: 5.26,
  },
  {
    index: 1,
    text: "조선 후기 실학자 박지원의 예덕선생전에 등장하는",
    start: 5.52,
    end: 9.04,
  },
  {
    index: 2,
    text: "엄행수가 바로 그런 사람이었죠.",
    start: 9.04,
    end: 11.32,
  },
];

export const S19: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Introduction text
  const introOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introFade = interpolate(frame, [fps * 4.5, fps * 5.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Park Jiwon portrait
  const parkStart = fps * 5.0;
  const parkOpacity = interpolate(
    frame,
    [parkStart, parkStart + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const parkGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.3, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Yedeok book
  const bookStart = fps * 6.5;
  const bookOpacity = interpolate(
    frame,
    [bookStart, bookStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const bookSlideX = interpolate(
    frame,
    [bookStart, bookStart + fps * 0.8],
    [50, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Eom Haengsu silhouette
  const eomStart = fps * 9.0;
  const eomOpacity = interpolate(
    frame,
    [eomStart, eomStart + fps * 1.5],
    [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const eomScale = spring({
    frame: frame - eomStart,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Introduction text */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: introOpacity * introFade,
          textAlign: "center",
          width: "80%",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily,
            fontWeight: 600,
            color: "#4a4a4a",
            lineHeight: 1.6,
          }}
        >
          매분자들 중에는
          <br />
          <span style={{ color: "#FFD700", fontWeight: 700 }}>
            단순한 노동자를 넘어선
          </span>
          <br />
          인물도 있었습니다...
        </div>
      </div>

      {/* Park Jiwon portrait */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          opacity: parkOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            filter: `drop-shadow(0 0 ${20 * parkGlow}px rgba(255, 215, 0, ${parkGlow}))`,
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
          {/* Name label */}
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "8px 20px",
              background: "rgba(139, 69, 19, 0.9)",
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontFamily,
                fontWeight: 700,
                color: "#F5DEB3",
              }}
            >
              박지원
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#D2B48C",
              }}
            >
              조선 후기 실학자
            </div>
          </div>
        </div>
      </div>

      {/* Yedeok Seonsaengjeon book */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "12%",
          opacity: bookOpacity,
          transform: `translateX(${bookSlideX}px)`,
        }}
      >
        <Img
          src={staticFile("assets/images/yedeok_book.png")}
          style={{
            width: 180,
            height: "auto",
            borderRadius: 8,
            boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        />
        {/* Book title label */}
        <div
          style={{
            position: "absolute",
            bottom: -35,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 20,
            fontFamily,
            fontWeight: 700,
            color: "#8B4513",
            whiteSpace: "nowrap",
          }}
        >
          예덕선생전
        </div>
      </div>

      {/* Arrow connecting Park Jiwon to book */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "35%",
          opacity: bookOpacity,
          fontSize: 32,
          color: "#8B4513",
        }}
      >
        ✍️ →
      </div>

      {/* Eom Haengsu mysterious silhouette */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: `translateX(-50%) scale(${eomScale})`,
          opacity: eomOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 150,
            height: 200,
            background: "linear-gradient(180deg, #333 0%, #1a1a1a 100%)",
            borderRadius: "50% 50% 30% 30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#666",
            }}
          >
            ?
          </div>
          {/* Mystery glow */}
          <div
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50% 50% 30% 30%",
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
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
            fontSize: 18,
            color: "#888",
          }}
        >
          예덕선생
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
