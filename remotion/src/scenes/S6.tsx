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

// 자막 데이터 (s6_timed.json - 상대 시간으로 변환, scene_start: 13.98)
const captions = [
  { text: "그런데 18세기에 이르면 상황이 완전히 달라집니다.", start: 0.0, end: 3.40 },
  { text: "한양의 인구는 무려 20만 명으로 두 배 가까이 폭증했습니다.", start: 3.88, end: 7.46 },
  { text: "같은 시기 1785년 영국에서 인구 5만 명을 넘긴 도시가", start: 8.26, end: 13.34 },
  { text: "런던, 맨체스터, 버밍엄, 리즈 단 네 곳뿐이었다는 점을 생각하면,", start: 13.34, end: 18.08 },
  { text: "한양은 당시 세계에서 손꼽히는 대도시였던 겁니다.", start: 18.18, end: 22.40 },
];

// 영국 도시 데이터 (비교용)
const ukCities = [
  { name: "런던", population: 95 },
  { name: "맨체스터", population: 7 },
  { name: "버밍엄", population: 5.5 },
  { name: "리즈", population: 5 },
];

export const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 18세기 연도 표시
  const yearOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 인구 그래프 애니메이션 (10만 → 20만)
  const graphStartFrame = 3.88 * fps;
  const graphEndFrame = 7 * fps;

  // 왼쪽 막대 (10만)
  const bar1Height = 180;
  const bar1Opacity = interpolate(
    frame,
    [graphStartFrame, graphStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 오른쪽 막대 (20만) - 성장 애니메이션
  const bar2Progress = interpolate(
    frame,
    [graphStartFrame + 20, graphEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const bar2Height = bar1Height + bar1Height * bar2Progress;
  const bar2Opacity = interpolate(
    frame,
    [graphStartFrame + 15, graphStartFrame + 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 영국 비교 차트 (8.26초부터)
  const comparisonStartFrame = 8.26 * fps;
  const comparisonOpacity = interpolate(
    frame,
    [comparisonStartFrame, comparisonStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 한양 강조 (18.18초부터)
  const hanyangHighlightStart = 18.18 * fps;
  const hanyangGlow = interpolate(
    frame,
    [hanyangHighlightStart, hanyangHighlightStart + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const hanyangScale = interpolate(
    frame,
    [hanyangHighlightStart, hanyangHighlightStart + 20],
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
      {/* 18세기 연도 표시 */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "8%",
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
          18세기
        </div>
      </div>

      {/* 인구 비교 그래프 */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "8%",
          display: "flex",
          alignItems: "flex-end",
          gap: 60,
        }}
      >
        {/* 15세기 (10만) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: bar1Opacity,
          }}
        >
          <div
            style={{
              width: 100,
              height: bar1Height,
              background: "linear-gradient(180deg, #8B4513 0%, #5D2E0C 100%)",
              borderRadius: "10px 10px 0 0",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
            }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
            }}
          >
            15세기
          </div>
          <div
            style={{
              fontSize: 40,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#8B4513",
              textShadow: captionStroke,
            }}
          >
            10만명
          </div>
        </div>

        {/* 화살표 */}
        <div
          style={{
            fontSize: 60,
            color: "#FFD700",
            textShadow: `0 0 15px rgba(255, 215, 0, ${glowPulse})`,
            marginBottom: 80,
            opacity: bar2Opacity,
          }}
        >
          →
        </div>

        {/* 18세기 (20만) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: bar2Opacity,
          }}
        >
          <div
            style={{
              width: 100,
              height: bar2Height,
              background: "linear-gradient(180deg, #FFD700 0%, #CC9900 100%)",
              borderRadius: "10px 10px 0 0",
              boxShadow: `0 4px 20px rgba(255, 215, 0, ${glowPulse})`,
            }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
            }}
          >
            18세기
          </div>
          <div
            style={{
              fontSize: 48,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: textStroke,
            }}
          >
            20만명
          </div>

          {/* x2 강조 */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -60,
              fontSize: 56,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FF6B35",
              textShadow: `${textStroke}, 0 0 20px rgba(255, 107, 53, 0.8)`,
              opacity: bar2Progress,
            }}
          >
            x2
          </div>
        </div>
      </div>

      {/* 영국 비교 차트 */}
      {frame >= comparisonStartFrame && (
        <div
          style={{
            position: "absolute",
            right: "6%",
            top: "20%",
            opacity: comparisonOpacity,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            padding: "25px 35px",
            borderRadius: 20,
            border: "2px solid #D4AF37",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#D4AF37",
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            1785년 영국
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              color: "#CCCCCC",
              marginBottom: 12,
            }}
          >
            인구 5만 이상 도시:
          </div>
          {ukCities.map((city, index) => {
            const cityDelay = comparisonStartFrame + (index + 1) * 8;
            const cityOpacity = interpolate(
              frame,
              [cityDelay, cityDelay + 10],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const barWidth = interpolate(
              frame,
              [cityDelay, cityDelay + 15],
              [0, city.population * 2],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.33, 1, 0.68, 1),
              }
            );
            return (
              <div
                key={city.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                  opacity: cityOpacity,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontFamily: "Pretendard, sans-serif",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    width: 110,
                  }}
                >
                  {index + 1}. {city.name}
                </span>
                <div
                  style={{
                    width: barWidth,
                    height: 20,
                    background: "linear-gradient(90deg, #4A90D9 0%, #2E5A8C 100%)",
                    borderRadius: 5,
                  }}
                />
              </div>
            );
          })}
          <div
            style={{
              marginTop: 15,
              fontSize: 36,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#FF6B6B",
              textAlign: "center",
            }}
          >
            단 4곳!
          </div>
        </div>
      )}

      {/* 한양 = 세계적 대도시 강조 */}
      {frame >= hanyangHighlightStart && (
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: hanyangGlow,
            transform: `scale(${hanyangScale})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(204, 153, 0, 0.9) 100%)",
              padding: "20px 50px",
              borderRadius: 20,
              boxShadow: `0 0 40px rgba(255, 215, 0, ${glowPulse})`,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#000000",
              }}
            >
              한양 = 세계적 대도시
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

export default S6;
