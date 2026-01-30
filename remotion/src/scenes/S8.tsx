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

// 자막 데이터 (s8_timed.json - 상대 시간으로 변환)
const captions = [
  { text: "문제는 이 많은 사람들이 매일 쏟아내는 분뇨였습니다.", start: 0.0, end: 2.82 },
  { text: "20만 명이 하루에 배출하는 분뇨의 양은 얼마나 될까요?", start: 2.82, end: 6.54 },
];

export const S8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 인물 아이콘 그룹 등장
  const peopleOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 인물 그룹 스케일
  const groupScale = interpolate(frame, [10, 60], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 20만 명 텍스트
  const populationOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 화살표 흐름 효과 (분뇨 암시)
  const arrowStartFrame = 1.5 * fps;

  // 물음표 등장 (3초부터)
  const questionStartFrame = 3 * fps;
  const questionScale = interpolate(
    frame,
    [questionStartFrame, questionStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const questionOpacity = interpolate(
    frame,
    [questionStartFrame, questionStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 물음표 펄스
  const questionPulse = frame >= questionStartFrame + 20
    ? 1 + Math.sin((frame - questionStartFrame - 20) * 0.15) * 0.1
    : questionScale;

  // 글로우 펄스
  const glowPulse = Math.sin(frame * 0.12) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 인물 아이콘 그룹 */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: `translate(-50%, 0) scale(${groupScale})`,
          opacity: peopleOpacity,
        }}
      >
        <Img
          src={staticFile("assets/icons/people_group.png")}
          style={{
            width: 550,
            height: "auto",
            filter: "drop-shadow(0 6px 15px rgba(0, 0, 0, 0.4))",
          }}
        />
      </div>

      {/* 20만 명 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "10%",
          opacity: populationOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "18px 30px",
            borderRadius: 15,
            border: "3px solid #FFD700",
            boxShadow: `0 0 20px rgba(255, 215, 0, ${glowPulse})`,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
            }}
          >
            20만 명
          </div>
        </div>
      </div>

      {/* 아래로 향하는 화살표 (분뇨 흐름 암시) */}
      {frame >= arrowStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
        >
          {[0, 1, 2].map((i) => {
            const arrowDelay = arrowStartFrame + i * 12;
            const arrowOpacity = interpolate(
              frame,
              [arrowDelay, arrowDelay + 15, arrowDelay + 45, arrowDelay + 55],
              [0, 0.9, 0.9, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const arrowY = interpolate(
              frame,
              [arrowDelay, arrowDelay + 55],
              [0, 60],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${(i - 1) * 90}px`,
                  top: arrowY,
                  width: 0,
                  height: 0,
                  borderLeft: "28px solid transparent",
                  borderRight: "28px solid transparent",
                  borderTop: "45px solid #8B4513",
                  opacity: arrowOpacity,
                  filter: "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.5))",
                }}
              />
            );
          })}
        </div>
      )}

      {/* 매일 분뇨 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "12%",
          opacity: interpolate(frame, [25, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          매일 쏟아내는
        </div>
        <div
          style={{
            fontSize: 60,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 800,
            color: "#8B4513",
            textShadow: captionStroke,
            marginTop: 8,
          }}
        >
          분뇨
        </div>
      </div>

      {/* 물음표 아이콘 + 얼마나? */}
      {frame >= questionStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            left: "50%",
            transform: `translate(-50%, 0) scale(${questionPulse})`,
            opacity: questionOpacity,
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <Img
            src={staticFile("assets/icons/question_mark.png")}
            style={{
              width: 120,
              height: "auto",
              filter: `drop-shadow(0 0 ${15 * glowPulse}px rgba(255, 215, 0, 0.6))`,
            }}
          />
          <div
            style={{
              fontSize: 72,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: `${textStroke}, 0 0 25px rgba(255, 215, 0, ${glowPulse})`,
            }}
          >
            얼마나?
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

export default S8;
