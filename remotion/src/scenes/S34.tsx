import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S34: Core6 - 간이벽온방언해 인용
// Duration: 25.94s (778 frames at 30fps)

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
    text: "간이벽온방언해라는 의서에는 전염병의 원인이 이렇게 기록되어 있습니다.",
    start: 0.0,
    end: 4.24,
  },
  {
    index: 1,
    text: "\"시궁창을 쳐서 흘려보내지 않아",
    start: 5.42,
    end: 7.12,
  },
  {
    index: 2,
    text: "그 더러운 나쁜 것이 사람에게 쏘이어 병이 된다.\"",
    start: 7.12,
    end: 10.84,
  },
  {
    index: 3,
    text: "도성 내의 분뇨를 효과적으로 처리할 법적·제도적 장치의 부재가",
    start: 11.76,
    end: 16.76,
  },
  {
    index: 4,
    text: "심각한 환경오염을 일으켰고,",
    start: 16.76,
    end: 19.08,
  },
  {
    index: 5,
    text: "이것이 수인성 전염병의 온상이 된 것입니다.",
    start: 19.08,
    end: 21.66,
  },
  {
    index: 6,
    text: "매분자들의 역할이 얼마나 중요했는지 알 수 있는 대목이죠.",
    start: 22.44,
    end: 25.94,
  },
];

export const S34: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Medical book fade in
  const bookOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Quote typewriter effect
  const quoteStart = fps * 5.0;
  const quoteOpacity = interpolate(
    frame,
    [quoteStart, quoteStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const quoteText = "시궁창을 쳐서 흘려보내지 않아 그 더러운 나쁜 것이 사람에게 쏘이어 병이 된다";
  const typeProgress = interpolate(
    frame,
    [quoteStart, quoteStart + fps * 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const visibleChars = Math.floor(typeProgress * quoteText.length);

  // Animation: Cause-effect diagram
  const diagramStart = fps * 12.0;
  const step1Opacity = interpolate(
    frame,
    [diagramStart, diagramStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const step2Opacity = interpolate(
    frame,
    [diagramStart + fps * 1.5, diagramStart + fps * 1.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const step3Opacity = interpolate(
    frame,
    [diagramStart + fps * 3, diagramStart + fps * 3.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Maebunza importance
  const importanceStart = fps * 22.5;
  const importanceOpacity = interpolate(
    frame,
    [importanceStart, importanceStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const importanceScale = spring({
    frame: frame - importanceStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Glow pulse
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Medical book */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "8%",
          opacity: bookOpacity,
        }}
      >
        <div
          style={{
            width: 220,
            height: 280,
            background: "linear-gradient(135deg, #F5DEB3 0%, #D2B48C 100%)",
            borderRadius: 6,
            border: "4px solid #8B4513",
            boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily,
              fontWeight: 700,
              color: "#5D4037",
              textAlign: "center",
              writingMode: "vertical-rl",
            }}
          >
            簡易辟溫方諺解
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            fontSize: 32,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          간이벽온방언해
        </div>
      </div>

      {/* Quote box */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 600,
          opacity: quoteOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 40px",
            background: "rgba(245, 222, 179, 0.95)",
            borderRadius: 12,
            border: "3px solid #8B4513",
            boxShadow: "0 4px 20px rgba(139, 69, 19, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontFamily,
              fontStyle: "italic",
              color: "#5D4037",
              lineHeight: 1.6,
            }}
          >
            "{quoteText.substring(0, visibleChars)}"
            <span
              style={{
                opacity: frame % 30 < 15 ? 1 : 0,
                color: "#8B4513",
              }}
            >
              |
            </span>
          </div>
        </div>
      </div>

      {/* Cause-effect diagram */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Step 1: No treatment */}
        <div
          style={{
            opacity: step1Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              background: "rgba(139, 69, 19, 0.1)",
              borderRadius: 16,
              border: "3px solid #8B4513",
            }}
          >
            <div style={{ fontSize: 80 }}>🚫</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 600,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              분뇨 미처리
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              법적·제도적 부재
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 56,
            color: "#DC2626",
            opacity: step2Opacity,
          }}
        >
          →
        </div>

        {/* Step 2: Pollution */}
        <div
          style={{
            opacity: step2Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              background: "rgba(107, 114, 128, 0.1)",
              borderRadius: 16,
              border: "3px solid #6B7280",
            }}
          >
            <div style={{ fontSize: 80 }}>🏭</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 600,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              환경오염
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 56,
            color: "#DC2626",
            opacity: step3Opacity,
          }}
        >
          →
        </div>

        {/* Step 3: Disease */}
        <div
          style={{
            opacity: step3Opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              background: `rgba(220, 38, 38, ${0.1 + glowPulse * 0.1})`,
              borderRadius: 16,
              border: "4px solid #DC2626",
              boxShadow: `0 0 ${15 * glowPulse}px rgba(220, 38, 38, 0.4)`,
            }}
          >
            <div style={{ fontSize: 80 }}>☠️</div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#FFFFFF",
                textShadow: textStroke,
              }}
            >
              수인성 전염병
            </div>
          </div>
        </div>
      </div>

      {/* Maebunza importance highlight */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: `translateX(-50%) scale(${importanceScale})`,
          opacity: importanceOpacity,
        }}
      >
        <div
          style={{
            padding: "24px 52px",
            background: `rgba(255, 215, 0, ${0.15 + glowPulse * 0.1})`,
            borderRadius: 16,
            border: "4px solid #FFD700",
            boxShadow: `0 0 ${25 * glowPulse}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 100,
                filter: `drop-shadow(0 0 ${10 * glowPulse}px rgba(255, 215, 0, 0.8))`,
              }}
            >
              ⭐
            </div>
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
                매분자의 중요성
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
                위생 관리의 핵심 역할
              </div>
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
