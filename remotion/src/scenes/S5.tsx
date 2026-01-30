import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  Easing,
} from "remotion";

// 자막용 흰 테두리
const captionStroke = `
  -2px -2px 0 #FFF,
   2px -2px 0 #FFF,
  -2px  2px 0 #FFF,
   2px  2px 0 #FFF,
  -3px  0   0 #FFF,
   3px  0   0 #FFF,
   0   -3px 0 #FFF,
   0    3px 0 #FFF
`;

// 일반 텍스트용 검은 테두리
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

// 자막 데이터 (s5_timed.json - 상대 시간)
const captions = [
  { text: "먼저 조선시대 한양이 어떤 도시였는지 살펴봐야 합니다.", start: 0.0, end: 3.84 },
  { text: "15세기 초, 태조 이성계가 한양으로 천도했을 때", start: 4.98, end: 8.30 },
  { text: "인구는 약 10만 명이었습니다.", start: 8.30, end: 10.60 },
  { text: "이것만 해도 당시로서는 어마어마한 규모였죠.", start: 10.72, end: 13.30 },
];

export const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 한양 지도 줌 아웃 효과
  const mapZoom = interpolate(frame, [0, durationInFrames], [1.3, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  const mapOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 15세기 연도 표시 (4.98초부터)
  const taejoStartFrame = 4.98 * fps;
  const yearOpacity = interpolate(
    frame,
    [taejoStartFrame - 15, taejoStartFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 태조 초상화 fadeIn (4.98초부터)
  const taejoOpacity = interpolate(
    frame,
    [taejoStartFrame, taejoStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const taejoScale = interpolate(
    frame,
    [taejoStartFrame, taejoStartFrame + 20],
    [0.8, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const taejoGlow = interpolate(
    frame,
    [taejoStartFrame + 20, taejoStartFrame + 40],
    [0, 0.5],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 인구 카운터 (8.30초부터)
  const counterStartFrame = 8.30 * fps;
  const counterEndFrame = 10.5 * fps;
  const counterProgress = interpolate(
    frame,
    [counterStartFrame, counterEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const displayCount = Math.floor(counterProgress * 100000);

  const counterOpacity = interpolate(
    frame,
    [counterStartFrame, counterStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 어마어마한 규모 강조 (10.72초부터)
  const scaleTextStartFrame = 10.72 * fps;
  const scaleTextOpacity = interpolate(
    frame,
    [scaleTextStartFrame, scaleTextStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const scaleTextScale = interpolate(
    frame,
    [scaleTextStartFrame, scaleTextStartFrame + 15],
    [0.5, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // 글로우 펄스
  const glowPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 한양 조감도/지도 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${mapZoom})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile("assets/maps/hanyang.png")}
          style={{
            width: 650,
            height: 650,
            opacity: mapOpacity,
            filter: "sepia(0.3) contrast(1.1)",
          }}
        />
      </div>

      {/* 15세기 연도 표시 */}
      {frame >= taejoStartFrame - 15 && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            opacity: yearOpacity,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#D4AF37",
              textShadow: `${textStroke}, 0 0 20px rgba(212, 175, 55, 0.5)`,
            }}
          >
            15세기
          </div>
        </div>
      )}

      {/* 태조 이성계 초상화 */}
      {frame >= taejoStartFrame && (
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "25%",
            opacity: taejoOpacity,
            transform: `scale(${taejoScale})`,
          }}
        >
          <Img
            src={staticFile("assets/portraits/taejo.png")}
            style={{
              width: 280,
              height: "auto",
              filter: `sepia(0.2) drop-shadow(0 0 ${15 * taejoGlow}px rgba(212, 175, 55, 0.6))`,
            }}
          />
          {/* 글로우 효과 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0) 70%)",
              opacity: taejoGlow,
            }}
          />
          {/* 이름 라벨 */}
          <div
            style={{
              textAlign: "center",
              marginTop: 15,
              fontSize: 36,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
            }}
          >
            태조 이성계
          </div>
        </div>
      )}

      {/* 인구 카운터 */}
      {frame >= counterStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: counterOpacity,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              color: "#FFFFFF",
              textShadow: textStroke,
              marginBottom: 10,
            }}
          >
            한양 인구
          </div>
          <div
            style={{
              fontSize: 96,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: `
                ${textStroke},
                0 4px 20px rgba(255, 215, 0, ${glowPulse})
              `,
            }}
          >
            {displayCount.toLocaleString()}명
          </div>
        </div>
      )}

      {/* 어마어마한 규모 강조 */}
      {frame >= scaleTextStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: scaleTextOpacity,
            transform: `scale(${scaleTextScale})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(255, 107, 53, 0.9)",
              padding: "15px 40px",
              borderRadius: 15,
              boxShadow: `0 0 30px rgba(255, 107, 53, ${glowPulse})`,
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              어마어마한 규모!
            </span>
          </div>
        </div>
      )}

      {/* 자막 */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 45,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 600,
            color: "#000000",
            textShadow: `${captionStroke}, 0 4px 8px rgba(0, 0, 0, 0.3)`,
            padding: "0 40px",
            zIndex: 1000,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default S5;
