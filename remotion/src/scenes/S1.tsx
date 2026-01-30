import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
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

// 자막 데이터 (s1_timed.json)
const captions = [
  { text: "여러분, 오늘날 서울 강남 땅 부러우시죠?", start: 0.0, end: 2.52 },
  { text: "압구정, 청담, 도곡동...", start: 3.08, end: 4.92 },
  { text: "평당 1억이 넘는 금싸라기 땅.", start: 5.52, end: 7.62 },
];

// 지역명 데이터
const districts = ["압구정", "청담", "도곡동"];

export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 카메라 줌 효과
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 지역명 타이프라이터 효과 (3.08초부터 시작)
  const districtStartFrame = 3.08 * fps;
  const districtShowDuration = 0.5 * fps;

  // 금액 카운트업 효과 (5.52초부터 시작)
  const priceStartFrame = 5.52 * fps;
  const priceEndFrame = 7.2 * fps;
  const priceProgress = interpolate(
    frame,
    [priceStartFrame, priceEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const displayPrice = Math.floor(priceProgress * 10000);

  // 금액 글로우 효과
  const priceGlow = interpolate(
    frame,
    [priceStartFrame, priceStartFrame + 30, priceEndFrame],
    [0, 1, 0.7],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 카메라 줌 컨테이너 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* 지역명 표시 (중앙 상단) */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 60,
          }}
        >
          {districts.map((district, index) => {
            const showFrame = districtStartFrame + index * districtShowDuration;
            const opacity = interpolate(
              frame,
              [showFrame, showFrame + 10],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const translateY = interpolate(
              frame,
              [showFrame, showFrame + 10],
              [20, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.33, 1, 0.68, 1),
              }
            );

            return (
              <div
                key={district}
                style={{
                  fontSize: 72,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textShadow: `${textStroke}, 0 4px 20px rgba(255, 215, 0, 0.5)`,
                  opacity,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {district}
              </div>
            );
          })}
        </div>

        {/* 금액 표시 (중앙) */}
        {frame >= priceStartFrame && (
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#FFD700",
                textShadow: `
                  ${textStroke},
                  0 0 ${30 * priceGlow}px rgba(255, 215, 0, 0.8),
                  0 0 ${60 * priceGlow}px rgba(255, 215, 0, 0.5)
                `,
              }}
            >
              평당 {displayPrice.toLocaleString()}만원
            </div>
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#FFFFFF",
                textShadow: textStroke,
                marginTop: 10,
                opacity: priceProgress,
              }}
            >
              = 1억원 이상
            </div>
          </div>
        )}
      </div>

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

export default S1;
