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

// 자막 데이터 (s12_timed.json - scene_start 26.48을 0으로 변환)
const captions = [
  { text: "왜 이런 법이 생겼을까요?", start: 0.0, end: 1.74 },
  { text: "중국에서 유래한 시비법 때문입니다.", start: 2.54, end: 4.64 },
  { text: "분뇨를 비료로 사용하면 토지 생산량이 급격히 증가했습니다.", start: 5.42, end: 9.04 },
  { text: "조선 후기 실학자 서유구는 임원경제지에서 이렇게 기록했습니다.", start: 10.04, end: 13.92 },
  { text: "\"농사에서 비료보다 중요한 것은 없다.\"", start: 14.90, end: 17.56 },
  { text: "\"분회 1두이면 곡식 1승을 얻을 수 있으니,", start: 17.84, end: 20.48 },
  { text: "재를 버리면 곧 곡식을 버리는 것이다.\"", start: 21.02, end: 23.20 },
];

export const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 물음표 등장 (0~1.74초)
  const questionOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionScale = interpolate(frame, [0, 25], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  // 물음표 사라짐
  const questionFadeOut = interpolate(
    frame,
    [1.5 * fps, 2 * fps],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 시비법 설명 (2.54초부터)
  const sibiStartFrame = 2.54 * fps;
  const sibiOpacity = interpolate(
    frame,
    [sibiStartFrame, sibiStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const sibiSlide = interpolate(
    frame,
    [sibiStartFrame, sibiStartFrame + 25],
    [50, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  // 생산량 증가 그래프 (5.42초부터)
  const graphStartFrame = 5.42 * fps;
  const graphProgress = interpolate(
    frame,
    [graphStartFrame, graphStartFrame + 50],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const graphOpacity = interpolate(
    frame,
    [graphStartFrame, graphStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 서유구 초상화 (10.04초부터)
  const seoStartFrame = 10.04 * fps;
  const seoOpacity = interpolate(
    frame,
    [seoStartFrame, seoStartFrame + 25],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const seoGlow = Math.sin((frame - seoStartFrame) * 0.08) * 0.3 + 0.7;

  // 임원경제지 고서 (10.04초부터, 오른쪽에서 슬라이드)
  const bookSlide = interpolate(
    frame,
    [seoStartFrame, seoStartFrame + 30],
    [100, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  // 인용문 (14.90초부터)
  const quoteStartFrame = 14.90 * fps;
  const quoteOpacity = interpolate(
    frame,
    [quoteStartFrame, quoteStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // 타자기 효과를 위한 텍스트 진행
  const quote1 = "농사에서 비료보다 중요한 것은 없다.";
  const quote1Progress = interpolate(
    frame,
    [quoteStartFrame, quoteStartFrame + 60],
    [0, quote1.length],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const displayedQuote1 = quote1.slice(0, Math.floor(quote1Progress));

  // 두 번째 인용문 (17.84초부터)
  const quote2StartFrame = 17.84 * fps;
  const quote2 = "분회 1두이면 곡식 1승을 얻을 수 있으니, 재를 버리면 곧 곡식을 버리는 것이다.";
  const quote2Progress = interpolate(
    frame,
    [quote2StartFrame, quote2StartFrame + 90],
    [0, quote2.length],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const displayedQuote2 = frame >= quote2StartFrame ? quote2.slice(0, Math.floor(quote2Progress)) : "";

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 물음표 */}
      {frame < 2 * fps && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${questionScale})`,
            opacity: questionOpacity * questionFadeOut,
            fontSize: 180,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 900,
            color: "#FFD700",
            textShadow: "0 0 40px rgba(255, 215, 0, 0.6)",
          }}
        >
          ?
        </div>
      )}

      {/* 시비법 설명 카드 */}
      {frame >= sibiStartFrame && frame < seoStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: `translate(-50%, 0) translateY(${sibiSlide}px)`,
            opacity: sibiOpacity,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)",
              padding: "30px 50px",
              borderRadius: 20,
              border: "3px solid #2E7D32",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              시비법 (施肥法)
            </div>
            <div
              style={{
                fontSize: 32,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 500,
                color: "#E8F5E9",
                textAlign: "center",
                marginTop: 15,
              }}
            >
              중국에서 유래한 비료 농법
            </div>
          </div>
        </div>
      )}

      {/* 생산량 증가 그래프 */}
      {frame >= graphStartFrame && frame < seoStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            left: "50%",
            transform: "translate(-50%, 0)",
            opacity: graphOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 30,
              padding: "20px 40px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 15,
            }}
          >
            {/* 이전 생산량 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: "rgba(158, 158, 158, 0.8)",
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  marginTop: 10,
                }}
              >
                이전
              </div>
            </div>
            {/* 화살표 */}
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#4CAF50",
                marginBottom: 40,
              }}
            >
              →
            </div>
            {/* 이후 생산량 (증가) */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80 + graphProgress * 120,
                  background: "linear-gradient(180deg, #FFD700 0%, #FFA000 100%)",
                  borderRadius: 8,
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
                }}
              />
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  color: "#FFD700",
                  marginTop: 10,
                }}
              >
                시비법 적용
              </div>
            </div>
            {/* 증가율 */}
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#4CAF50",
                marginBottom: 60,
                marginLeft: 20,
              }}
            >
              급증!
            </div>
          </div>
        </div>
      )}

      {/* 서유구 실루엣 + 임원경제지 */}
      {frame >= seoStartFrame && (
        <>
          {/* 서유구 실루엣 (왼쪽) */}
          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "18%",
              opacity: seoOpacity,
            }}
          >
            <div
              style={{
                width: 220,
                height: 280,
                background: "linear-gradient(180deg, rgba(93, 58, 26, 0.9) 0%, rgba(61, 38, 17, 0.9) 100%)",
                borderRadius: "50% 50% 45% 45%",
                boxShadow: `0 0 ${30 * seoGlow}px rgba(139, 69, 19, 0.5)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #8B4513",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#F5E6C8",
                  textAlign: "center",
                }}
              >
                실학자
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 800,
                  color: "#FFD700",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                서유구
              </div>
            </div>
          </div>

          {/* 임원경제지 고서 (오른쪽) */}
          <div
            style={{
              position: "absolute",
              right: "8%",
              top: "18%",
              transform: `translateX(${bookSlide}px)`,
              opacity: seoOpacity,
            }}
          >
            <div
              style={{
                width: 200,
                height: 280,
                background: "linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)",
                borderRadius: 8,
                border: "4px solid #D4AF37",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 800,
                  color: "#FFD700",
                  textAlign: "center",
                  writingMode: "vertical-rl",
                }}
              >
                林園經濟志
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 600,
                  color: "#F5E6C8",
                  textAlign: "center",
                  marginTop: 15,
                }}
              >
                임원경제지
              </div>
            </div>
          </div>
        </>
      )}

      {/* 인용문 패널 */}
      {frame >= quoteStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: "50%",
            transform: "translate(-50%, 0)",
            opacity: quoteOpacity,
            width: "80%",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, rgba(245, 230, 200, 0.95) 0%, rgba(220, 195, 155, 0.95) 100%)",
              padding: "25px 40px",
              borderRadius: 15,
              border: "3px solid #8B4513",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#5D3A1A",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              "{displayedQuote1}"
            </div>
            {frame >= quote2StartFrame && (
              <div
                style={{
                  fontSize: 32,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  color: "#6D4C2A",
                  textAlign: "center",
                  marginTop: 15,
                  lineHeight: 1.5,
                }}
              >
                "{displayedQuote2}"
              </div>
            )}
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

export default S12;
