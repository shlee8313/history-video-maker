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

// 자막 데이터 (s2_timed.json - 상대 시간으로 변환)
// 원본: scene_start: 7.78s
const captions = [
  { text: "그런데 조선시대에도", start: 0.0, end: 1.52 },
  { text: "한양의 노른자 땅을 쓸어 담은 사람들이 있었습니다.", start: 1.52, end: 4.38 },
  { text: "놀라운 건, 그들의 직업이었죠.", start: 4.52, end: 6.82 },
];

export const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 지도 fadeIn + 줌
  const mapOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mapZoom = interpolate(frame, [0, durationInFrames], [1.1, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 황금빛 하이라이트 펄스 효과
  const pulseStartFrame = 30;
  const highlightOpacity = interpolate(
    frame,
    [pulseStartFrame, pulseStartFrame + 15],
    [0, 0.6],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const highlightPulse = frame >= pulseStartFrame + 15
    ? 0.6 + Math.sin((frame - pulseStartFrame - 15) * 0.15) * 0.2
    : highlightOpacity;

  // 물음표 popUp (4.52초부터)
  const questionStartFrame = 4.52 * fps;
  const questionScale = interpolate(
    frame,
    [questionStartFrame, questionStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const questionOpacity = interpolate(
    frame,
    [questionStartFrame, questionStartFrame + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 노른자 땅 텍스트 등장
  const goldenTextOpacity = interpolate(
    frame,
    [15, 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 한양 지도 */}
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
            width: 700,
            height: 700,
            opacity: mapOpacity,
            filter: "sepia(0.4) contrast(1.1)",
          }}
        />
      </div>

      {/* 황금빛 하이라이트 효과 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)",
          opacity: highlightPulse,
        }}
      />

      {/* 노른자 땅 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 84,
          fontFamily: "Pretendard, sans-serif",
          fontWeight: 800,
          color: "#FFD700",
          textShadow: `${textStroke}, 0 4px 30px rgba(255, 215, 0, 0.8)`,
          opacity: goldenTextOpacity,
        }}
      >
        노른자 땅
      </div>

      {/* 물음표 아이콘 */}
      {frame >= questionStartFrame && (
        <div
          style={{
            position: "absolute",
            right: "15%",
            top: "35%",
            transform: `scale(${questionScale})`,
            opacity: questionOpacity,
          }}
        >
          <Img
            src={staticFile("assets/icons/question_mark.png")}
            style={{
              width: 150,
              height: 220,
            }}
          />
        </div>
      )}

      {/* 직업? 텍스트 */}
      {frame >= questionStartFrame && (
        <div
          style={{
            position: "absolute",
            right: "14%",
            top: "60%",
            fontSize: 56,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
            opacity: questionOpacity,
          }}
        >
          직업 = ?
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

export default S2;
