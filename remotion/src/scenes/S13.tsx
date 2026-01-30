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

// 자막 데이터 (s13_timed.json - scene_start 50.48을 0으로 변환)
const captions = [
  { text: "비료 한 말로 곡식 한 되를 얻을 수 있다는 계산이죠.", start: 0.0, end: 3.38 },
  { text: "당시 농촌에서는", start: 4.82, end: 5.66 },
  { text: "\"다른 사람에게 한 사발의 밥은 줄지언정", start: 5.66, end: 8.38 },
  { text: "한 삼태기의 분뇨는 주지 말라\"는 속담이 있었을 정도입니다.", start: 8.92, end: 12.38 },
  { text: "밥보다 똥이 더 귀했다는 뜻입니다.", start: 13.26, end: 15.60 },
];

export const S13: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 계산식 등장 (0~3.38초)
  const calcOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const calcSlide = interpolate(frame, [0, 25], [-50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  // 속담 패널 (5.66초부터)
  const proverbStartFrame = 5.66 * fps;
  const proverbOpacity = interpolate(
    frame,
    [proverbStartFrame, proverbStartFrame + 25],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // 타자기 효과
  const proverbText = "다른 사람에게 한 사발의 밥은 줄지언정, 한 삼태기의 분뇨는 주지 말라";
  const proverbProgress = interpolate(
    frame,
    [proverbStartFrame, proverbStartFrame + 120],
    [0, proverbText.length],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const displayedProverb = proverbText.slice(0, Math.floor(proverbProgress));

  // VS 비교 (13.26초부터)
  const vsStartFrame = 13.26 * fps;
  const vsOpacity = interpolate(
    frame,
    [vsStartFrame, vsStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 밥그릇 아이콘 등장 + 흔들림
  const riceBowlOpacity = interpolate(
    frame,
    [vsStartFrame, vsStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const riceBowlShake = frame >= vsStartFrame
    ? Math.sin((frame - vsStartFrame) * 0.3) * 3
    : 0;

  // 삼태기 아이콘 등장 + 황금빛 글로우
  const samtaegiOpacity = interpolate(
    frame,
    [vsStartFrame + 10, vsStartFrame + 25],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const samtaegiScale = interpolate(
    frame,
    [vsStartFrame + 10, vsStartFrame + 30],
    [0.7, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );
  const goldGlow = Math.sin(frame * 0.12) * 0.3 + 0.7;

  // 계산식 사라짐 (속담 등장 시)
  const calcFadeOut = interpolate(
    frame,
    [proverbStartFrame - 15, proverbStartFrame],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 계산식 카드 */}
      {frame < proverbStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: `translate(-50%, 0) translateY(${calcSlide}px)`,
            opacity: calcOpacity * calcFadeOut,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 50, 10, 0.95) 100%)",
              padding: "35px 60px",
              borderRadius: 20,
              border: "4px solid #D4AF37",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 30,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#D4AF37",
                }}
              >
                비료 1말
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                =
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#FFD700",
                  textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
                }}
              >
                곡식 1되
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 속담 패널 (전통 붓글씨 스타일) */}
      {frame >= proverbStartFrame && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translate(-50%, 0)",
            opacity: proverbOpacity,
            width: "85%",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, rgba(245, 230, 200, 0.95) 0%, rgba(220, 195, 155, 0.95) 100%)",
              padding: "30px 50px",
              borderRadius: 15,
              border: "4px solid #8B4513",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(139, 69, 19, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#8B4513",
                textAlign: "center",
                marginBottom: 15,
              }}
            >
              조선시대 농촌 속담
            </div>
            <div
              style={{
                fontSize: 40,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#5D3A1A",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              "{displayedProverb}"
            </div>
          </div>
        </div>
      )}

      {/* VS 비교 섹션 */}
      {frame >= vsStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            left: "50%",
            transform: "translate(-50%, 0)",
            opacity: vsOpacity,
            display: "flex",
            alignItems: "center",
            gap: 60,
          }}
        >
          {/* 밥그릇 */}
          <div
            style={{
              opacity: riceBowlOpacity,
              transform: `translateY(${riceBowlShake}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 140,
                height: 100,
                background: "linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 100%)",
                borderRadius: "0 0 50% 50%",
                border: "3px solid #9E9E9E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 40,
                  background: "linear-gradient(180deg, #F5F5DC 0%, #DEB887 100%)",
                  borderRadius: "50%",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 36,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#757575",
                marginTop: 15,
                textShadow: textStroke,
              }}
            >
              밥 한 사발
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              fontSize: 64,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 900,
              color: "#C41E3A",
              textShadow: `${textStroke}, 0 0 15px rgba(196, 30, 58, 0.5)`,
            }}
          >
            VS
          </div>

          {/* 삼태기 (비료) */}
          <div
            style={{
              opacity: samtaegiOpacity,
              transform: `scale(${samtaegiScale})`,
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 160,
                height: 120,
                background: "linear-gradient(180deg, #8B4513 0%, #5D3A1A 100%)",
                borderRadius: "10px 10px 50% 50%",
                border: "4px solid #D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 5px 25px rgba(0, 0, 0, 0.4), 0 0 ${30 * goldGlow}px rgba(255, 215, 0, 0.4)`,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  color: "#FFD700",
                }}
              >
                비료
              </div>
            </div>
            <div
              style={{
                fontSize: 36,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 700,
                color: "#FFD700",
                marginTop: 15,
                textShadow: `${textStroke}, 0 0 15px rgba(255, 215, 0, 0.5)`,
              }}
            >
              분뇨 한 삼태기
            </div>
            {/* 승리 표시 */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -20,
                fontSize: 48,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 900,
                color: "#FFD700",
                textShadow: `${textStroke}, 0 0 20px rgba(255, 215, 0, 0.8)`,
              }}
            >
              WIN!
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

export default S13;
