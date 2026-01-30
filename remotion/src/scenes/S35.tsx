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

// Scene S35: Core6 - 영조의 준천 공사
// Duration: 13.62s (409 frames at 30fps)

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
    text: "영조는 1760년에 오염된 하천의 물이 잘 흐르도록",
    start: 0.0,
    end: 3.94,
  },
  {
    index: 1,
    text: "바닥을 깊게 파내는 대규모 준천 공사를 시작했습니다.",
    start: 3.94,
    end: 7.8,
  },
  {
    index: 2,
    text: "하지만 이런 준설 작업으로도",
    start: 8.76,
    end: 10.6,
  },
  {
    index: 3,
    text: "한양의 분뇨 문제를 근본적으로 해결하지는 못했습니다.",
    start: 10.6,
    end: 13.62,
  },
];

export const S35: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Yeongjo portrait/decree
  const yeongjoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Year 1760
  const yearOpacity = interpolate(
    frame,
    [fps * 0.5, fps * 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const yearScale = spring({
    frame: frame - fps * 0.5,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Animation: Dredging scene
  const dredgeStart = fps * 4.0;
  const dredgeOpacity = interpolate(
    frame,
    [dredgeStart, dredgeStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Workers digging
  const workerY = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [-5, 5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Incomplete resolution
  const incompleteStart = fps * 9.0;
  const incompleteOpacity = interpolate(
    frame,
    [incompleteStart, incompleteStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const incompleteScale = spring({
    frame: frame - incompleteStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Water flow animation
  const waterFlow = interpolate(
    frame,
    [dredgeStart, dredgeStart + fps * 8],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Yeongjo portrait */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          opacity: yeongjoOpacity,
        }}
      >
        <Img
          src={staticFile("assets/portraits/yeongjo.png")}
          style={{
            width: 300,
            height: "auto",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        />
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 48,
            fontFamily,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          영조
        </div>
      </div>

      {/* Year 1760 */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "10%",
          opacity: yearOpacity,
          transform: `scale(${yearScale})`,
        }}
      >
        <div
          style={{
            padding: "24px 48px",
            background: "rgba(139, 0, 0, 0.1)",
            borderRadius: 16,
            border: "3px solid #8B0000",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontFamily,
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: textStroke,
            }}
          >
            1760년
          </div>
          <div
            style={{
              fontSize: 40,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              marginTop: 8,
              textShadow: textStroke,
            }}
          >
            영조 36년
          </div>
        </div>
      </div>

      {/* Dredging project visualization */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          opacity: dredgeOpacity,
        }}
      >
        {/* River/canal representation */}
        <div
          style={{
            width: "100%",
            height: 140,
            background: "linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)",
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Water flow lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 25 + i * 22,
                left: `${(waterFlow + i * 20) % 120 - 20}%`,
                width: 120,
                height: 4,
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: 2,
              }}
            />
          ))}

          {/* Label */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 52,
              fontFamily,
              fontWeight: 700,
              color: "#FFF",
              textShadow: textStroke,
            }}
          >
            청계천 준천 공사
          </div>
        </div>

        {/* Workers digging */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 24,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                transform: `translateY(${workerY + Math.sin(i * 1.5) * 3}px)`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 80 }}>👷</div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily,
                  color: "#FFFFFF",
                  marginTop: 8,
                  textShadow: textStroke,
                }}
              >
                인부
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incomplete resolution warning */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: `translateX(-50%) scale(${incompleteScale})`,
          opacity: incompleteOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 48px",
            background: "rgba(245, 158, 11, 0.15)",
            borderRadius: 16,
            border: "4px solid #F59E0B",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div style={{ fontSize: 100 }}>⚠️</div>
            <div>
              <div
                style={{
                  fontSize: 52,
                  fontFamily,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                근본적 해결 실패
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontFamily,
                  color: "#FFFFFF",
                  marginTop: 8,
                  textShadow: textStroke,
                }}
              >
                분뇨 문제는 여전히 남아있었다
              </div>
            </div>
            <div
              style={{
                fontSize: 80,
                color: "#F59E0B",
              }}
            >
              △
            </div>
          </div>
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
