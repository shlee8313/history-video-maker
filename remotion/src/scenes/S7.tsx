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

// 자막 데이터 (s7_timed.json - 상대 시간으로 변환)
const captions = [
  { text: "승정원일기를 보면 영조는", start: 0.0, end: 1.60 },
  { text: "\"도성 안에 인민이 너무 많다\"고 한탄했습니다.", start: 1.60, end: 4.36 },
  { text: "좁은 성곽 안에 20만 명이 빽빽이 모여 살았으니,", start: 5.34, end: 9.24 },
  { text: "오늘날 서울 종로구 면적에 강남구 인구가 몰려 사는 것과 비슷한 상황이었죠.", start: 9.24, end: 14.36 },
];

export const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 영조 초상화 fadeIn + 미세 움직임
  const portraitOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 숨쉬는 효과
  const breathingScale = 1 + Math.sin(frame * 0.05) * 0.01;

  // 승정원일기 배지
  const badgeOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 말풍선 등장 (1.60초부터)
  const bubbleStartFrame = 1.60 * fps;
  const bubbleOpacity = interpolate(
    frame,
    [bubbleStartFrame, bubbleStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const bubbleScale = interpolate(
    frame,
    [bubbleStartFrame, bubbleStartFrame + 20],
    [0.8, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // 타이프라이터 효과
  const quoteText = "도성 안에 인민이 너무 많다";
  const typeEndFrame = bubbleStartFrame + 2 * fps;
  const typeProgress = interpolate(
    frame,
    [bubbleStartFrame + 10, typeEndFrame],
    [0, quoteText.length],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const displayQuote = quoteText.substring(0, Math.floor(typeProgress));

  // 종로구 vs 강남구 비교 (9.24초부터)
  const comparisonStartFrame = 9.24 * fps;
  const comparisonOpacity = interpolate(
    frame,
    [comparisonStartFrame, comparisonStartFrame + 25],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const comparisonSlideY = interpolate(
    frame,
    [comparisonStartFrame, comparisonStartFrame + 25],
    [40, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  // 글로우 펄스
  const glowPulse = Math.sin(frame * 0.12) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 승정원일기 배지 */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(139, 90, 43, 0.95) 0%, rgba(101, 67, 33, 0.95) 100%)",
            padding: "15px 40px",
            borderRadius: 12,
            border: "3px solid #D4A574",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#F5DEB3",
            }}
          >
            『승정원일기』
          </span>
        </div>
      </div>

      {/* 영조 초상화 */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          top: "28%",
          opacity: portraitOpacity,
          transform: `scale(${breathingScale})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile("assets/portraits/yeongjo.png")}
          style={{
            width: 320,
            height: "auto",
            filter: "sepia(0.2) drop-shadow(0 8px 25px rgba(0, 0, 0, 0.5))",
          }}
        />
        {/* 이름 라벨 */}
        <div
          style={{
            textAlign: "center",
            marginTop: 15,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#D4AF37",
              textShadow: textStroke,
            }}
          >
            英祖
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
            }}
          >
            영조
          </div>
        </div>
      </div>

      {/* 말풍선 */}
      {frame >= bubbleStartFrame && (
        <div
          style={{
            position: "absolute",
            left: "42%",
            top: "25%",
            opacity: bubbleOpacity,
            transform: `scale(${bubbleScale})`,
          }}
        >
          {/* 말풍선 배경 */}
          <div
            style={{
              backgroundColor: "#F5E6C8",
              padding: "30px 40px",
              borderRadius: 20,
              border: "3px solid #8B4513",
              boxShadow: `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 ${20 * glowPulse}px rgba(139, 69, 19, 0.3)`,
              position: "relative",
              maxWidth: 450,
            }}
          >
            {/* 말풍선 꼬리 */}
            <div
              style={{
                position: "absolute",
                left: -22,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "18px solid transparent",
                borderBottom: "18px solid transparent",
                borderRight: "22px solid #8B4513",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderRight: "19px solid #F5E6C8",
              }}
            />
            {/* 말풍선 텍스트 */}
            <div
              style={{
                fontSize: 44,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#8B4513",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              "{displayQuote}"
            </div>
          </div>
        </div>
      )}

      {/* 종로구 면적 = 강남구 인구 비교 */}
      {frame >= comparisonStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            left: 0,
            right: 0,
            opacity: comparisonOpacity,
            transform: `translateY(${comparisonSlideY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 35,
            }}
          >
            {/* 종로구 */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(74, 144, 217, 0.9) 0%, rgba(46, 90, 140, 0.9) 100%)",
                padding: "20px 35px",
                borderRadius: 18,
                boxShadow: "0 6px 20px rgba(74, 144, 217, 0.4)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                종로구
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                면적
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: "Pretendard, sans-serif",
                  color: "#B8D4F0",
                  marginTop: 5,
                }}
              >
                23.91km²
              </div>
            </div>

            {/* = 기호 */}
            <div
              style={{
                fontSize: 72,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#FFD700",
                textShadow: `${textStroke}, 0 0 20px rgba(255, 215, 0, ${glowPulse})`,
              }}
            >
              =
            </div>

            {/* 강남구 */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(200, 60, 60, 0.9) 100%)",
                padding: "20px 35px",
                borderRadius: 18,
                boxShadow: `0 6px 20px rgba(255, 107, 107, ${glowPulse})`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                강남구
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                인구
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: "Pretendard, sans-serif",
                  color: "#FFD0D0",
                  marginTop: 5,
                }}
              >
                54만 명
              </div>
            </div>
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

export default S7;
