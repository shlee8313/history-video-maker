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

// 자막 데이터 (s4_timed.json - 상대 시간으로 변환)
// 원본: scene_start: 24.80s
const captions = [
  { text: "\"아니, 똥 퍼서 부자가 됐다고?\"", start: 0.0, end: 2.04 },
  { text: "오늘 이 영상에서는 조선시대 가장 천한 직업이", start: 2.04, end: 5.42 },
  { text: "어떻게 최고의 투자처가 되었는지,", start: 5.42, end: 7.50 },
  { text: "그 놀라운 역사를 파헤쳐 보겠습니다.", start: 7.50, end: 9.64 },
];

export const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 카메라 줌 효과
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 질문 텍스트 등장 (타이프라이터 효과 + 쉐이크)
  const questionText = "똥 퍼서 부자가 됐다고?";
  const questionOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const questionShake = frame >= 15 && frame <= 30
    ? Math.sin((frame - 15) * 0.5) * 5
    : 0;

  // 배가지 아이콘 (똥푸는 도구) 등장
  const toolStartFrame = 1.5 * fps;
  const toolScale = interpolate(
    frame,
    [toolStartFrame, toolStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const toolOpacity = interpolate(
    frame,
    [toolStartFrame, toolStartFrame + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 도구가 황금으로 변하는 효과
  const goldTransformStart = 2.5 * fps;
  const goldFilter = interpolate(
    frame,
    [goldTransformStart, goldTransformStart + 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 황금 동전 떨어지는 효과
  const coinStartFrame = 3 * fps;
  const coins = [
    { x: -200, delay: 0 },
    { x: -100, delay: 5 },
    { x: 0, delay: 10 },
    { x: 100, delay: 15 },
    { x: 200, delay: 20 },
  ];

  // 스윙 모션 (도구)
  const swingAngle = frame >= toolStartFrame && frame <= goldTransformStart
    ? Math.sin((frame - toolStartFrame) * 0.2) * 10
    : 0;

  // 글로우 효과
  const glowIntensity = interpolate(
    frame,
    [goldTransformStart, goldTransformStart + 30],
    [0, 1],
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
        {/* 질문 텍스트 */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `translateX(${questionShake}px)`,
            opacity: questionOpacity,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: `${textStroke}, 0 4px 20px rgba(255, 215, 0, 0.6)`,
            }}
          >
            {questionText}
          </div>
        </div>

        {/* 배가지 (똥푸는 도구) */}
        {frame >= toolStartFrame && (
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${toolScale}) rotate(${swingAngle}deg)`,
              opacity: toolOpacity,
            }}
          >
            <Img
              src={staticFile("assets/icons/baegaji.png")}
              style={{
                width: 250,
                height: 280,
                filter: `sepia(${goldFilter * 0.5}) saturate(${1 + goldFilter * 2}) brightness(${1 + goldFilter * 0.3})`,
              }}
            />
            {/* 황금 글로우 효과 */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,215,0,0) 70%)",
                opacity: glowIntensity,
              }}
            />
          </div>
        )}

        {/* 황금 동전들 */}
        {coins.map((coin, index) => {
          const coinFrame = coinStartFrame + coin.delay;
          const coinY = interpolate(
            frame,
            [coinFrame, coinFrame + 60],
            [-100, 400],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.33, 1, 0.68, 1),
            }
          );
          const coinOpacity = interpolate(
            frame,
            [coinFrame, coinFrame + 10, coinFrame + 50, coinFrame + 60],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );
          const coinRotation = (frame - coinFrame) * 5;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: coinY,
                left: `calc(50% + ${coin.x}px)`,
                transform: `translateX(-50%) rotate(${coinRotation}deg)`,
                opacity: coinOpacity,
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                boxShadow: "0 0 15px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5)",
              }}
            />
          );
        })}

        {/* 영상 소개 텍스트 */}
        {currentTime >= 5.42 && (
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: interpolate(
                frame,
                [5.42 * fps, 5.42 * fps + 15],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              ),
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              천한 직업 → 최고의 투자처
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

export default S4;
