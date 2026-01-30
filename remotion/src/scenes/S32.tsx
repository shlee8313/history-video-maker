import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S32: Core6 - 전염병과 직결되는 생존의 문제
// Duration: 7.46s (224 frames at 30fps)

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
    text: "분뇨 문제는 단순히 냄새나 불쾌함의 문제가 아니었습니다.",
    start: 0.0,
    end: 2.48,
  },
  {
    index: 1,
    text: "전염병과 직결되는 생존의 문제였죠.",
    start: 4.26,
    end: 7.46,
  },
];

export const S32: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: "Not just smell" - crossed out
  const smellOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strikeProgress = interpolate(
    frame,
    [fps * 1.5, fps * 2.0],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Disease/survival reveal
  const diseaseStart = fps * 3.5;
  const diseaseOpacity = interpolate(
    frame,
    [diseaseStart, diseaseStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const diseaseScale = spring({
    frame: frame - diseaseStart,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Animation: Scale comparison
  const scaleStart = fps * 4.5;
  const scaleOpacity = interpolate(
    frame,
    [scaleStart, scaleStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scaleTilt = interpolate(
    frame,
    [scaleStart, scaleStart + fps * 1],
    [0, -15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ominous pulse
  const ominousPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* "Not just smell/discomfort" - to be crossed out */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "15%",
          opacity: smellOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 48px",
            background: "rgba(156, 163, 175, 0.2)",
            borderRadius: 16,
            border: "3px solid #9CA3AF",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div style={{ fontSize: 100, opacity: 0.6 }}>👃</div>
            <div>
              <div
                style={{
                  fontSize: 52,
                  fontFamily,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                냄새
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontFamily,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                불쾌함
              </div>
            </div>
          </div>
          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikeProgress * 100}%`,
              height: 6,
              background: "#DC2626",
              transform: "rotate(-5deg)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 80,
            color: "#DC2626",
            opacity: strikeProgress,
          }}
        >
          ❌
        </div>
      </div>

      {/* Disease/Survival - the real issue */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "8%",
          opacity: diseaseOpacity,
          transform: `scale(${diseaseScale})`,
        }}
      >
        <div
          style={{
            padding: "32px 48px",
            background: `rgba(220, 38, 38, ${0.1 + ominousPulse * 0.1})`,
            borderRadius: 16,
            border: "4px solid #DC2626",
            boxShadow: `0 0 ${25 * ominousPulse}px rgba(220, 38, 38, 0.5)`,
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
                filter: `drop-shadow(0 0 ${10 * ominousPulse}px rgba(220, 38, 38, 0.8))`,
              }}
            >
              ☠️
            </div>
            <div>
              <div
                style={{
                  fontSize: 56,
                  fontFamily,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textShadow: textStroke,
                }}
              >
                전염병
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontFamily,
                  color: "#FFFFFF",
                  marginTop: 8,
                  textShadow: textStroke,
                }}
              >
                생존의 문제
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scale comparison visualization */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          transform: `translateX(-50%) rotate(${scaleTilt}deg)`,
          opacity: scaleOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0,
          }}
        >
          {/* Left side - Smell (light) */}
          <div
            style={{
              width: 220,
              textAlign: "center",
            }}
          >
            <div
              style={{
                padding: "24px",
                background: "rgba(156, 163, 175, 0.2)",
                borderRadius: "12px 12px 0 0",
                border: "3px solid #9CA3AF",
                borderBottom: "none",
              }}
            >
              <div style={{ fontSize: 80, opacity: 0.5 }}>👃</div>
              <div
                style={{
                  fontSize: 36,
                  fontFamily,
                  color: "#FFFFFF",
                  marginTop: 12,
                  textShadow: textStroke,
                }}
              >
                불쾌함
              </div>
            </div>
          </div>

          {/* Fulcrum */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "50px solid transparent",
              borderRight: "50px solid transparent",
              borderBottom: "60px solid #4B5563",
              position: "relative",
              top: 60,
            }}
          />

          {/* Right side - Survival (heavy) */}
          <div
            style={{
              width: 220,
              textAlign: "center",
            }}
          >
            <div
              style={{
                padding: "24px",
                background: `rgba(220, 38, 38, ${0.2 + ominousPulse * 0.1})`,
                borderRadius: "12px 12px 0 0",
                border: "4px solid #DC2626",
                borderBottom: "none",
                boxShadow: `0 0 ${15 * ominousPulse}px rgba(220, 38, 38, 0.3)`,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  filter: `drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))`,
                }}
              >
                ☠️
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontFamily,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginTop: 12,
                  textShadow: textStroke,
                }}
              >
                생존
              </div>
            </div>
          </div>
        </div>

        {/* Base line */}
        <div
          style={{
            width: 540,
            height: 10,
            background: "#4B5563",
            borderRadius: 5,
            marginTop: -6,
          }}
        />
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
