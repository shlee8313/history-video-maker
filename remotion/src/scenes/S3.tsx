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

// 자막 데이터 (s3_timed.json - 상대 시간으로 변환)
// 원본: scene_start: 14.66s
const captions = [
  { text: "모두가 코를 막고 피하던 지옥의 냄새.", start: 0.0, end: 3.46 },
  { text: "양반은 물론이고 상인조차 멀리하던 그 일.", start: 3.46, end: 6.38 },
  { text: "바로 '매분자', 똥 푸는 사람들이었습니다.", start: 6.76, end: 10.14 },
];

export const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 매분자 실루엣 fadeIn
  const silhouetteOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 매분자 실루엣 걷는 효과 (좌우 미세 이동)
  const walkCycle = Math.sin(frame * 0.1) * 5;

  // 악취 파동 효과 (ripple)
  const smellWaveOpacity = interpolate(frame, [30, 50], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const smellWaveScale = interpolate(frame, [30, durationInFrames], [0.8, 1.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 코 막는 아이콘 popIn (0.5초부터)
  const noseIconStartFrame = 0.5 * fps;
  const noseIconScale = interpolate(
    frame,
    [noseIconStartFrame, noseIconStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const noseIconOpacity = interpolate(
    frame,
    [noseIconStartFrame, noseIconStartFrame + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 아이콘 흔들기 효과
  const shakeOffset = frame >= noseIconStartFrame + 15
    ? Math.sin((frame - noseIconStartFrame - 15) * 0.4) * 3
    : 0;

  // "매분자" 텍스트 등장 (6.76초부터)
  const titleStartFrame = 6.76 * fps;
  const titleOpacity = interpolate(
    frame,
    [titleStartFrame, titleStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const titleScale = interpolate(
    frame,
    [titleStartFrame, titleStartFrame + 20],
    [0.8, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 악취 파동 효과 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${smellWaveScale})`,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,80,60,0.3) 0%, rgba(100,80,60,0) 70%)",
          opacity: smellWaveOpacity,
        }}
      />

      {/* 두 번째 파동 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${smellWaveScale * 0.8})`,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(80,60,40,0.4) 0%, rgba(80,60,40,0) 70%)",
          opacity: smellWaveOpacity * 0.8,
        }}
      />

      {/* 매분자 실루엣 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${walkCycle}px), -55%)`,
          opacity: silhouetteOpacity,
        }}
      >
        <Img
          src={staticFile("assets/images/maebunza_silhouette.png")}
          style={{
            width: 450,
            height: 630,
            filter: "brightness(0.9)",
          }}
        />
      </div>

      {/* 코 막는 아이콘 */}
      <div
        style={{
          position: "absolute",
          left: "12%",
          top: "30%",
          transform: `scale(${noseIconScale}) translateX(${shakeOffset}px)`,
          opacity: noseIconOpacity,
        }}
      >
        <Img
          src={staticFile("assets/icons/nose_cover.png")}
          style={{
            width: 160,
            height: 200,
          }}
        />
      </div>

      {/* "매분자" 타이틀 */}
      {frame >= titleStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontFamily: "'Gowun Batang', serif",
              fontWeight: 700,
              color: "#8B4513",
              textShadow: `
                -3px -3px 0 #F5E6C8,
                 3px -3px 0 #F5E6C8,
                -3px  3px 0 #F5E6C8,
                 3px  3px 0 #F5E6C8,
                0 4px 20px rgba(139, 69, 19, 0.5)
              `,
            }}
          >
            賣糞者
          </div>
          <div
            style={{
              fontSize: 56,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: textStroke,
              marginTop: 10,
            }}
          >
            매분자 - 똥 푸는 사람
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

export default S3;
