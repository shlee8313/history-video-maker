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

// 자막 데이터 (s10_timed.json)
const captions = [
  { text: "그런데 여기서 반전이 있습니다.", start: 0.0, end: 1.66 },
  { text: "조선시대 분뇨는 단순한 오물이 아니었습니다.", start: 2.40, end: 4.88 },
  { text: "농촌에서는 황금보다 귀한 '비료'였죠.", start: 5.90, end: 8.46 },
];

export const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // "반전!" 텍스트 등장 (popUp with shake)
  const reversalScale = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const reversalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 카메라 흔들림 효과 (0~30프레임)
  const shakeX = frame < 30 ? Math.sin(frame * 1.5) * (1 - frame / 30) * 10 : 0;
  const shakeY = frame < 30 ? Math.cos(frame * 2) * (1 - frame / 30) * 5 : 0;

  // 오물 → 황금 변환 효과 (2.4초부터)
  const transformStartFrame = 2.4 * fps;
  const transformProgress = interpolate(
    frame,
    [transformStartFrame, transformStartFrame + 40],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  // 갈색 → 금색 색상 전환
  const brownR = 139, brownG = 69, brownB = 19;
  const goldR = 255, goldG = 215, goldB = 0;
  const currentR = Math.round(brownR + (goldR - brownR) * transformProgress);
  const currentG = Math.round(brownG + (goldG - brownG) * transformProgress);
  const currentB = Math.round(brownB + (goldB - brownB) * transformProgress);

  // 비료 아이콘 (가마니) 등장 (5.9초부터)
  const fertilizerStartFrame = 5.9 * fps;
  const fertilizerOpacity = interpolate(
    frame,
    [fertilizerStartFrame, fertilizerStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const fertilizerScale = interpolate(
    frame,
    [fertilizerStartFrame, fertilizerStartFrame + 20],
    [0.5, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // 황금빛 글로우 펄스
  const goldGlow = Math.sin(frame * 0.12) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 반전! 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: `translate(-50%, 0) translate(${shakeX}px, ${shakeY}px) scale(${reversalScale})`,
          opacity: reversalOpacity,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 900,
            color: "#FFD700",
            textShadow: `${textStroke}, 0 0 40px rgba(255, 215, 0, ${goldGlow})`,
            letterSpacing: 8,
          }}
        >
          반전!
        </div>
      </div>

      {/* 오물 → 황금 변환 원형 효과 */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* 변환 중인 원 */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgb(${currentR}, ${currentG}, ${currentB}) 0%, rgba(${currentR}, ${currentG}, ${currentB}, 0.6) 70%, transparent 100%)`,
            boxShadow: transformProgress > 0.5
              ? `0 0 ${60 * goldGlow}px rgba(255, 215, 0, ${transformProgress * 0.8})`
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 변환 텍스트 */}
          <div
            style={{
              fontSize: 48,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: transformProgress > 0.5 ? "#000000" : "#FFFFFF",
              textShadow: transformProgress > 0.5
                ? "none"
                : "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {transformProgress < 0.5 ? "오물" : "황금"}
          </div>
        </div>
      </div>

      {/* 화살표 표시 (변환 효과) */}
      {transformProgress > 0 && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(140px, -50%)",
            opacity: transformProgress,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: `${textStroke}, 0 0 20px rgba(255, 215, 0, ${goldGlow})`,
            }}
          >
            =
          </div>
        </div>
      )}

      {/* 비료 아이콘 (가마니) */}
      {frame >= fertilizerStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "38%",
            right: "18%",
            transform: `scale(${fertilizerScale})`,
            opacity: fertilizerOpacity,
          }}
        >
          <Img
            src={staticFile("assets/icons/gamani.png")}
            style={{
              width: 180,
              height: "auto",
              filter: `drop-shadow(0 0 ${25 * goldGlow}px rgba(255, 215, 0, 0.6))`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 36,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              color: "#FFD700",
              textShadow: `${textStroke}, 0 0 15px rgba(255, 215, 0, 0.5)`,
              whiteSpace: "nowrap",
            }}
          >
            비료
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

export default S10;
