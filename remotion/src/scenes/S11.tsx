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

// 자막 데이터 (s11_timed.json - scene_start 9.30을 0으로 변환)
const captions = [
  { text: "당시 법률을 보면 놀라운 조항이 있습니다.", start: 0.0, end: 2.18 },
  { text: "\"재를 버리는 자는 곤장 30대에 처하고,", start: 3.10, end: 5.68 },
  { text: "똥을 버리는 자는 곤장 50대에 처한다.\"", start: 6.36, end: 8.90 },
  { text: "재를 버려도 곤장 30대인데, 똥을 버리면 50대입니다.", start: 9.68, end: 13.88 },
  { text: "똥이 재보다 20대나 더 귀하다는 뜻이죠.", start: 14.66, end: 17.18 },
];

export const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // 법전 두루마리 배경 펼쳐지는 효과
  const scrollUnroll = interpolate(frame, [0, 40], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const scrollOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 곤장 아이콘 흔들림 효과
  const gonjangSwing = Math.sin(frame * 0.2) * 5;

  // 재 30대 카운터 (3.1초부터)
  const ashStartFrame = 3.1 * fps;
  const ashCounterProgress = interpolate(
    frame,
    [ashStartFrame, ashStartFrame + 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const ashCount = Math.floor(ashCounterProgress * 30);
  const ashOpacity = interpolate(
    frame,
    [ashStartFrame, ashStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 똥 50대 카운터 (6.36초부터)
  const wasteStartFrame = 6.36 * fps;
  const wasteCounterProgress = interpolate(
    frame,
    [wasteStartFrame, wasteStartFrame + 40],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }
  );
  const wasteCount = Math.floor(wasteCounterProgress * 50);
  const wasteOpacity = interpolate(
    frame,
    [wasteStartFrame, wasteStartFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const wasteScale = interpolate(
    frame,
    [wasteStartFrame, wasteStartFrame + 20],
    [0.7, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    }
  );

  // 비교 강조 (14.66초부터)
  const comparisonStartFrame = 14.66 * fps;
  const comparisonOpacity = interpolate(
    frame,
    [comparisonStartFrame, comparisonStartFrame + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const comparisonScale = interpolate(
    frame,
    [comparisonStartFrame, comparisonStartFrame + 25],
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
      {/* 법전 두루마리 스타일 배경 패널 */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: `translateX(-50%) scaleY(${scrollUnroll})`,
          transformOrigin: "top center",
          opacity: scrollOpacity,
          width: "85%",
          background: "linear-gradient(180deg, rgba(245, 230, 200, 0.95) 0%, rgba(220, 195, 155, 0.95) 100%)",
          borderRadius: 15,
          padding: "25px 40px",
          border: "4px solid #8B4513",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(139, 69, 19, 0.1)",
        }}
      >
        {/* 법전 제목 */}
        <div
          style={{
            fontSize: 38,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 700,
            color: "#5D3A1A",
            textAlign: "center",
            marginBottom: 20,
            borderBottom: "2px solid #8B4513",
            paddingBottom: 15,
          }}
        >
          조선시대 법률
        </div>

        {/* 법률 내용 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {/* 재 버리기 - 30대 */}
          <div
            style={{
              opacity: ashOpacity,
              textAlign: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#5D3A1A",
                marginBottom: 15,
              }}
            >
              재를 버리는 자
            </div>
            <div
              style={{
                fontSize: 80,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#D4A574",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              곤장 {ashCount}대
            </div>
            {/* 곤장 아이콘 (텍스트로 대체) */}
            <div
              style={{
                marginTop: 15,
                fontSize: 50,
                transform: `rotate(${gonjangSwing}deg)`,
              }}
            >
              |
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              fontSize: 56,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 900,
              color: "#C41E3A",
              textShadow: "0 0 10px rgba(196, 30, 58, 0.3)",
              padding: "0 20px",
            }}
          >
            VS
          </div>

          {/* 똥 버리기 - 50대 */}
          <div
            style={{
              opacity: wasteOpacity,
              transform: `scale(${wasteScale})`,
              textAlign: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                color: "#5D3A1A",
                marginBottom: 15,
              }}
            >
              똥을 버리는 자
            </div>
            <div
              style={{
                fontSize: 80,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#C41E3A",
                textShadow: `2px 2px 4px rgba(0,0,0,0.2), 0 0 ${15 * glowPulse}px rgba(196, 30, 58, 0.4)`,
              }}
            >
              곤장 {wasteCount}대
            </div>
            {/* 곤장 아이콘 (텍스트로 대체) */}
            <div
              style={{
                marginTop: 15,
                fontSize: 50,
                transform: `rotate(${-gonjangSwing}deg)`,
              }}
            >
              |||
            </div>
          </div>
        </div>
      </div>

      {/* 하단 비교 강조 박스 */}
      {frame >= comparisonStartFrame && (
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: "50%",
            transform: `translate(-50%, 0) scale(${comparisonScale})`,
            opacity: comparisonOpacity,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(218, 165, 32, 0.95) 100%)",
              padding: "20px 50px",
              borderRadius: 15,
              border: "3px solid #8B4513",
              boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 ${20 * glowPulse}px rgba(255, 215, 0, 0.5)`,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 800,
                color: "#5D3A1A",
                textAlign: "center",
              }}
            >
              똥 = 재보다 <span style={{ color: "#C41E3A", fontSize: 64 }}>+20대</span> 더 귀함!
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

export default S11;
