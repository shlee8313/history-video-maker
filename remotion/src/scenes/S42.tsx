import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S42: Insight - 중용 철학과 엄행수의 실천
// Duration: 16.86s (506 frames at 30fps)
// Scene starts at 28.16s in section, ends at 45.02s

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
    text: "양반들이 텃세 부리며 천농사상을 강조할 때,",
    start: 0.0,
    end: 3.24,
  },
  {
    index: 1,
    text: "엄행수는 묵묵히 자신의 일에서 가치를 창출했습니다.",
    start: 3.24,
    end: 7.04,
  },
  {
    index: 2,
    text: "\"부귀한 처지에 있으면 부귀에 맞게 도를 행하며,",
    start: 8.08,
    end: 10.92,
  },
  {
    index: 3,
    text: "빈천한 처지에 있으면 빈천에 맞게 도를 행한다\"는",
    start: 10.92,
    end: 14.72,
  },
  {
    index: 4,
    text: "중용의 정신을 몸소 실천한 거죠.",
    start: 14.72,
    end: 16.86,
  },
];

export const S42: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Yangban pompous figure (left)
  const yangbanOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yangbanFade = interpolate(frame, [fps * 6, fps * 7], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yangbanWobble = Math.sin((frame / fps) * Math.PI * 2) * 3;

  // Animation: Eom working steadily (right)
  const eomStart = fps * 3.0;
  const eomOpacity = interpolate(frame, [eomStart, eomStart + fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eomGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Jungyong quote typewriter
  const quoteStart = fps * 8.0;
  const quoteProgress = interpolate(
    frame,
    [quoteStart, quoteStart + fps * 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Value creation effect
  const valueStart = fps * 5.5;
  const valueOpacity = interpolate(
    frame,
    [valueStart, valueStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const valueScale = spring({
    frame: frame - valueStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const jungyongText1 = "부귀한 처지에 있으면 부귀에 맞게 도를 행하며,";
  const jungyongText2 = "빈천한 처지에 있으면 빈천에 맞게 도를 행한다";
  const totalChars = jungyongText1.length + jungyongText2.length;
  const visibleChars = Math.floor(quoteProgress * totalChars);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Left: Yangban pompous figure */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          opacity: yangbanOpacity * yangbanFade,
          transform: `rotate(${yangbanWobble}deg)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 160,
            height: 200,
            background: "linear-gradient(180deg, #8B4513 0%, #654321 100%)",
            borderRadius: "30% 30% 20% 20%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Hat */}
          <div
            style={{
              position: "absolute",
              top: -30,
              width: 120,
              height: 50,
              background: "#1a1a1a",
              borderRadius: "50% 50% 0 0",
            }}
          />
          {/* Face */}
          <div style={{ fontSize: 40, marginTop: 30 }}>😤</div>
          {/* Hand gesture */}
          <div
            style={{
              position: "absolute",
              right: -30,
              top: "40%",
              fontSize: 40,
              transform: `rotate(${-20 + yangbanWobble * 2}deg)`,
            }}
          >
            👆
          </div>
        </div>
        <div
          style={{
            marginTop: 15,
            fontSize: 20,
            fontFamily,
            fontWeight: 600,
            color: "#8B4513",
          }}
        >
          양반
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#A0522D",
            fontStyle: "italic",
          }}
        >
          "천한 일은 하지 않는다"
        </div>
      </div>

      {/* VS divider */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * yangbanFade,
          fontSize: 36,
          fontFamily,
          fontWeight: 900,
          color: "#666",
        }}
      >
        VS
      </div>

      {/* Right: Eom working with dignity */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          right: "10%",
          opacity: eomOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 180,
            height: 220,
            filter: `drop-shadow(0 0 ${20 * eomGlow}px rgba(255, 215, 0, ${eomGlow * 0.6}))`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(180deg, #5D4E37 0%, #3D3426 100%)",
              borderRadius: "30% 30% 20% 20%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${30 * eomGlow}px rgba(255, 215, 0, 0.3)`,
            }}
          >
            <div style={{ fontSize: 48 }}>🧑‍🌾</div>
            {/* Working hands */}
            <div
              style={{
                marginTop: 10,
                fontSize: 32,
                transform: `translateY(${Math.sin((frame / fps) * Math.PI * 4) * 3}px)`,
              }}
            >
              🧹
            </div>
          </div>
          {/* Golden aura */}
          <div
            style={{
              position: "absolute",
              inset: -15,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 215, 0, ${eomGlow * 0.3}) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 15,
            fontSize: 22,
            fontFamily,
            fontWeight: 700,
            color: "#B8860B",
            textShadow: `0 0 ${10 * eomGlow}px rgba(255, 215, 0, 0.5)`,
          }}
        >
          엄행수
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#8B7355",
          }}
        >
          묵묵히 가치 창출
        </div>

        {/* Value creation sparkles */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: -40,
            opacity: valueOpacity,
            transform: `scale(${valueScale})`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              filter: `drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))`,
            }}
          >
            ✨
          </div>
        </div>
      </div>

      {/* Jungyong quote - bottom with typewriter effect */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          opacity: interpolate(frame, [quoteStart, quoteStart + fps * 0.3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            padding: "24px 32px",
            background: "rgba(139, 69, 19, 0.1)",
            borderRadius: 16,
            border: "3px solid #8B4513",
            borderLeft: "8px solid #8B4513",
          }}
        >
          {/* Quote label */}
          <div
            style={{
              fontSize: 16,
              fontFamily,
              color: "#8B4513",
              marginBottom: 12,
            }}
          >
            《중용》
          </div>
          {/* Quote text with typewriter */}
          <div
            style={{
              fontSize: 24,
              fontFamily,
              fontWeight: 500,
              color: "#4a3728",
              lineHeight: 1.6,
              minHeight: 80,
            }}
          >
            <div>
              {jungyongText1.slice(0, Math.min(visibleChars, jungyongText1.length))}
              {visibleChars <= jungyongText1.length && (
                <span
                  style={{
                    opacity: Math.sin((frame / fps) * Math.PI * 8) > 0 ? 1 : 0,
                  }}
                >
                  |
                </span>
              )}
            </div>
            {visibleChars > jungyongText1.length && (
              <div>
                {jungyongText2.slice(0, visibleChars - jungyongText1.length)}
                {visibleChars < totalChars && (
                  <span
                    style={{
                      opacity: Math.sin((frame / fps) * Math.PI * 8) > 0 ? 1 : 0,
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            )}
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
