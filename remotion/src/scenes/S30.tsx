import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";

// Scene S30: Core5 - 경복궁 앞 165개의 알
// Duration: 8.84s (265 frames at 30fps)

const fontFamily = "Pretendard, sans-serif";

// 검은 테두리 텍스트 스타일 (공통)
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

const captions = [
  {
    index: 0,
    text: "특히 경복궁 앞에서 추출한 흙에서는",
    start: 0.0,
    end: 2.04,
  },
  {
    index: 1,
    text: "1그램당 최고 165개의 알이 나왔고,",
    start: 2.24,
    end: 3.92,
  },
  {
    index: 2,
    text: "나머지 샘플에서도 평균 35개의 알이 검출됐습니다.",
    start: 5.42,
    end: 8.84,
  },
];

export const S30: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Microscope view zoom in
  const microscopeOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const microscopeScale = interpolate(frame, [0, fps * 1], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Counter to 165
  const counterStart = fps * 2.0;
  const counterProgress = interpolate(
    frame,
    [counterStart, counterStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayCount = Math.floor(counterProgress * 165);
  const counterOpacity = interpolate(
    frame,
    [counterStart, counterStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Average counter to 35
  const avgStart = fps * 5.5;
  const avgProgress = interpolate(
    frame,
    [avgStart, avgStart + fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayAvg = Math.floor(avgProgress * 35);
  const avgOpacity = interpolate(
    frame,
    [avgStart, avgStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Alert pulse
  const alertPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.7, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Parasite diagram
  const diagramOpacity = interpolate(
    frame,
    [fps * 1, fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Microscope view */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "12%",
          opacity: microscopeOpacity,
          transform: `scale(${microscopeScale})`,
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, #E8E8E8 0%, #B0B0B0 70%, #808080 100%)",
            border: "10px solid #4A4A4A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 100 }}>🔬</div>
        </div>
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 48,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          현미경 분석
        </div>
      </div>

      {/* Parasite diagram image */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "8%",
          opacity: diagramOpacity,
        }}
      >
        <Img
          src={staticFile("assets/images/parasite_diagram.png")}
          style={{
            width: 450,
            height: "auto",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>

      {/* Main data display - 165 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "25%",
          transform: "translateY(-50%)",
          opacity: counterOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 48px",
            background: `rgba(220, 38, 38, ${0.1 + alertPulse * 0.1})`,
            borderRadius: 16,
            border: "3px solid #DC2626",
            boxShadow: `0 0 ${20 * alertPulse}px rgba(220, 38, 38, 0.4)`,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            경복궁 앞
          </div>
          <div
            style={{
              fontSize: 110,
              fontFamily,
              fontWeight: 900,
              color: "#DC2626",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            {displayCount}
          </div>
          <div
            style={{
              fontSize: 48,
              fontFamily,
              fontWeight: 500,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            개 / 1g
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 36,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            기생충 알
          </div>
        </div>
      </div>

      {/* Average data display - 35 */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          right: "10%",
          opacity: avgOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 40px",
            background: "rgba(245, 158, 11, 0.1)",
            borderRadius: 12,
            border: "2px solid #F59E0B",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            기타 샘플 평균
          </div>
          <div
            style={{
              fontSize: 84,
              fontFamily,
              fontWeight: 800,
              color: "#F59E0B",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            {displayAvg}
          </div>
          <div
            style={{
              fontSize: 40,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            개 / 1g
          </div>
        </div>
      </div>

      {/* Soil sample visual */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: counterOpacity,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            background: "linear-gradient(135deg, #8B7355 0%, #5D4E37 100%)",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
          }}
        />
        <div
          style={{
            fontSize: 48,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          = 1g 토양 샘플
        </div>
      </div>

      {/* Caption */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 45,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            textShadow: `${textStroke}, 0 4px 8px rgba(0, 0, 0, 0.5)`,
            padding: "0 60px",
            zIndex: 1000,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
