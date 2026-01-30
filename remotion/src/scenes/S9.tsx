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

// 자막 데이터 (s9_timed.json - 상대 시간으로 변환)
const captions = [
  { text: "현대인 기준으로 계산하면 하루 약 200톤.", start: 0.0, end: 2.44 },
  { text: "1년이면 7만 톤이 넘습니다.", start: 3.12, end: 5.06 },
  { text: "그런데 당시 한양에는 마땅한 하수도 시설이 없었습니다.", start: 6.42, end: 9.78 },
];

export const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 하루 200톤 카운터
  const dailyCounterEndFrame = 2 * fps;
  const dailyProgress = interpolate(
    frame,
    [10, dailyCounterEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const dailyCount = Math.floor(dailyProgress * 200);
  const dailyOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 연간 7만 톤 카운터 (3.12초부터)
  const yearlyStartFrame = 3.12 * fps;
  const yearlyEndFrame = 4.8 * fps;
  const yearlyProgress = interpolate(
    frame,
    [yearlyStartFrame, yearlyEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const yearlyCount = Math.floor(yearlyProgress * 70000);
  const yearlyOpacity = interpolate(
    frame,
    [yearlyStartFrame, yearlyStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const yearlyScale = interpolate(
    frame,
    [yearlyStartFrame, yearlyStartFrame + 20],
    [0.7, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // 하수도 없음 아이콘 (6.42초부터)
  const noSewerStartFrame = 6.42 * fps;
  const noSewerOpacity = interpolate(
    frame,
    [noSewerStartFrame, noSewerStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const noSewerScale = interpolate(
    frame,
    [noSewerStartFrame, noSewerStartFrame + 20],
    [0.5, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // X 표시 빨간색 글로우
  const redGlow = interpolate(
    frame,
    [noSewerStartFrame + 20, noSewerStartFrame + 40],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 경고 펄스
  const warningPulse = frame >= noSewerStartFrame
    ? Math.sin((frame - noSewerStartFrame) * 0.15) * 0.3 + 0.7
    : 0;

  // 글로우 펄스
  const glowPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 하루 200톤 카드 */}
      <div
        style={{
          position: "absolute",
          left: "12%",
          top: "22%",
          opacity: dailyOpacity,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 50, 10, 0.95) 100%)",
            padding: "30px 45px",
            borderRadius: 20,
            border: "3px solid #D4AF37",
            boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 ${15 * glowPulse}px rgba(212, 175, 55, 0.3)`,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              color: "#F5E6C8",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            하루 배출량
          </div>
          <div
            style={{
              fontSize: 88,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textAlign: "center",
              textShadow: `0 0 20px rgba(255, 215, 0, ${glowPulse})`,
            }}
          >
            {dailyCount}톤
          </div>
        </div>
      </div>

      {/* 연간 7만 톤 카드 */}
      {frame >= yearlyStartFrame && (
        <div
          style={{
            position: "absolute",
            right: "12%",
            top: "22%",
            opacity: yearlyOpacity,
            transform: `scale(${yearlyScale})`,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(229, 57, 53, 0.95) 0%, rgba(180, 40, 40, 0.95) 100%)",
              padding: "30px 45px",
              borderRadius: 20,
              border: "3px solid #FFD700",
              boxShadow: `0 8px 30px rgba(229, 57, 53, 0.5), 0 0 ${20 * glowPulse}px rgba(229, 57, 53, 0.4)`,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 500,
                color: "#FFFFFF",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              1년 배출량
            </div>
            <div
              style={{
                fontSize: 88,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#FFFFFF",
                textAlign: "center",
                textShadow: "0 0 25px rgba(255, 255, 255, 0.6)",
              }}
            >
              {yearlyCount.toLocaleString()}톤
            </div>
          </div>
        </div>
      )}

      {/* 화살표 (하루 → 연간) */}
      {frame >= yearlyStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: yearlyOpacity,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 800,
              color: "#FFD700",
              textShadow: `${textStroke}, 0 0 15px rgba(255, 215, 0, ${glowPulse})`,
            }}
          >
            x 365
          </div>
        </div>
      )}

      {/* 하수도 없음 아이콘 + 경고 텍스트 */}
      {frame >= noSewerStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            left: "50%",
            transform: `translate(-50%, 0) scale(${noSewerScale})`,
            opacity: noSewerOpacity,
            display: "flex",
            alignItems: "center",
            gap: 35,
          }}
        >
          <Img
            src={staticFile("assets/icons/no_sewer.png")}
            style={{
              width: 160,
              height: "auto",
              filter: `drop-shadow(0 0 ${15 * warningPulse}px rgba(229, 57, 53, 0.7))`,
            }}
          />
          <div
            style={{
              background: `rgba(229, 57, 53, ${0.85 + redGlow * 0.1})`,
              padding: "18px 35px",
              borderRadius: 15,
              border: "3px solid #FFFFFF",
              boxShadow: `0 0 ${25 * warningPulse}px rgba(229, 57, 53, 0.7)`,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              하수도 시설 없음!
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

export default S9;
