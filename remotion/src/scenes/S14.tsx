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

// 자막 데이터 (s14_timed.json - scene_start 67.70을 0으로 변환)
const captions = [
  { text: "농가월령에서는 측간에 큰 독이나 항아리를 묻고", start: 0.0, end: 3.24 },
  { text: "대소변이나 구정물을 담아 거름으로 이용할 것을 권장했습니다.", start: 3.36, end: 6.98 },
  { text: "17세기에 이르면 인분과 인뇨를 바탕으로 재 등을 섞어,", start: 6.98, end: 12.18 },
  { text: "거름을 만들어 논에 시비하는 방법이 체계화됩니다.", start: 12.18, end: 15.28 },
];

export const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 농가월령 고서 등장
  const bookOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bookSlide = interpolate(frame, [0, 30], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // Step 1: 항아리 묻기 (0~3.24초)
  const step1Opacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Step 2: 담기 (3.36초부터)
  const step2StartFrame = 3.36 * fps;
  const step2Opacity = interpolate(
    frame,
    [step2StartFrame, step2StartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // 채워지는 애니메이션
  const fillProgress = interpolate(
    frame,
    [step2StartFrame + 10, step2StartFrame + 50],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  // Step 3: 재 섞기 (6.98초부터)
  const step3StartFrame = 6.98 * fps;
  const step3Opacity = interpolate(
    frame,
    [step3StartFrame, step3StartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // 섞는 애니메이션 (회전)
  const mixRotation = frame >= step3StartFrame
    ? Math.sin((frame - step3StartFrame) * 0.15) * 15
    : 0;

  // Step 4: 논에 시비 (12.18초부터)
  const step4StartFrame = 12.18 * fps;
  const step4Opacity = interpolate(
    frame,
    [step4StartFrame, step4StartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // 녹색 성장 애니메이션
  const growthProgress = interpolate(
    frame,
    [step4StartFrame + 10, step4StartFrame + 60],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );

  // 17세기 강조 (6.98초부터)
  const centuryOpacity = interpolate(
    frame,
    [step3StartFrame, step3StartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const centuryScale = interpolate(
    frame,
    [step3StartFrame, step3StartFrame + 20],
    [0.7, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  const glowPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 농가월령 고서 (왼쪽 상단) */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: "12%",
          transform: `translateX(${bookSlide}px)`,
          opacity: bookOpacity,
        }}
      >
        <div
          style={{
            width: 160,
            height: 220,
            background: "linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)",
            borderRadius: 8,
            border: "3px solid #D4AF37",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 15,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textAlign: "center",
              writingMode: "vertical-rl",
            }}
          >
            農家月令
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#F5E6C8",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            농가월령
          </div>
        </div>
      </div>

      {/* 비료 제조 과정 다이어그램 */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-start",
          gap: 40,
        }}
      >
        {/* Step 1: 항아리 묻기 */}
        <div
          style={{
            opacity: step1Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 150,
              position: "relative",
            }}
          >
            {/* 땅 */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: 60,
                background: "linear-gradient(180deg, #8B4513 0%, #5D3A1A 100%)",
                borderRadius: "0 0 10px 10px",
              }}
            />
            {/* 항아리 */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 100,
                background: "linear-gradient(180deg, #CD853F 0%, #8B4513 100%)",
                borderRadius: "20% 20% 50% 50%",
                border: "3px solid #D2691E",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
              marginTop: 10,
            }}
          >
            1. 항아리 묻기
          </div>
        </div>

        {/* 화살표 */}
        <div
          style={{
            fontSize: 48,
            color: "#FFD700",
            marginTop: 60,
            opacity: step2Opacity,
          }}
        >
          -&gt;
        </div>

        {/* Step 2: 담기 */}
        <div
          style={{
            opacity: step2Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 150,
              position: "relative",
            }}
          >
            {/* 항아리 */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 100,
                background: "linear-gradient(180deg, #CD853F 0%, #8B4513 100%)",
                borderRadius: "20% 20% 50% 50%",
                border: "3px solid #D2691E",
                overflow: "hidden",
              }}
            >
              {/* 채워지는 내용물 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: `${fillProgress * 70}%`,
                  background: "linear-gradient(180deg, #6B4423 0%, #4A3015 100%)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
              marginTop: 10,
            }}
          >
            2. 분뇨 담기
          </div>
        </div>

        {/* 화살표 */}
        <div
          style={{
            fontSize: 48,
            color: "#FFD700",
            marginTop: 60,
            opacity: step3Opacity,
          }}
        >
          -&gt;
        </div>

        {/* Step 3: 재 섞기 */}
        <div
          style={{
            opacity: step3Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 150,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 섞는 그릇 */}
            <div
              style={{
                width: 100,
                height: 80,
                background: "linear-gradient(180deg, #A0522D 0%, #6B4423 100%)",
                borderRadius: "10px 10px 50% 50%",
                border: "3px solid #8B4513",
                transform: `rotate(${mixRotation}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#F5E6C8",
                }}
              >
                + 재
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
              marginTop: 10,
            }}
          >
            3. 재 섞기
          </div>
        </div>

        {/* 화살표 */}
        <div
          style={{
            fontSize: 48,
            color: "#FFD700",
            marginTop: 60,
            opacity: step4Opacity,
          }}
        >
          -&gt;
        </div>

        {/* Step 4: 논에 시비 */}
        <div
          style={{
            opacity: step4Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 140,
              height: 150,
              position: "relative",
            }}
          >
            {/* 논 */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: 50,
                background: "linear-gradient(180deg, #228B22 0%, #006400 100%)",
                borderRadius: 10,
              }}
            />
            {/* 벼 성장 */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: 45,
                  left: 15 + i * 25,
                  width: 8,
                  height: growthProgress * 80,
                  background: "linear-gradient(180deg, #90EE90 0%, #228B22 100%)",
                  borderRadius: "50% 50% 0 0",
                  transformOrigin: "bottom center",
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#4CAF50",
              textShadow: textStroke,
              marginTop: 10,
            }}
          >
            4. 논에 시비
          </div>
        </div>
      </div>

      {/* 17세기 체계화 강조 */}
      {frame >= step3StartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            left: "50%",
            transform: `translate(-50%, 0) scale(${centuryScale})`,
            opacity: centuryOpacity,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)",
              padding: "20px 50px",
              borderRadius: 15,
              border: "3px solid #2E7D32",
              boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 ${20 * glowPulse}px rgba(76, 175, 80, 0.4)`,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#FFD700" }}>17세기</span> - 시비법 체계화!
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

export default S14;
