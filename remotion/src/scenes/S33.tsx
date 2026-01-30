import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S33: Core6 - 조선왕조실록 전염병 기록
// Duration: 17.72s (532 frames at 30fps)

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
    text: "조선왕조실록에는 전염병에 대해 총 1,455건의 기록이 있습니다.",
    start: 0.0,
    end: 4.66,
  },
  {
    index: 1,
    text: "조선왕조 518년 역사에서",
    start: 5.56,
    end: 7.8,
  },
  {
    index: 2,
    text: "평균 1년에 2~3건의 전염병이 발생한 셈입니다.",
    start: 7.8,
    end: 11.3,
  },
  {
    index: 3,
    text: "특히 영조 25년에는 역병으로 인한 민간 사망자 수가",
    start: 12.14,
    end: 15.58,
  },
  {
    index: 4,
    text: "50~60만 명에 달했습니다.",
    start: 15.58,
    end: 17.72,
  },
];

export const S33: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Sillok book fade in
  const sillokOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Counter to 1455
  const counterStart = fps * 1.0;
  const counterProgress = interpolate(
    frame,
    [counterStart, counterStart + fps * 2.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayCounter = Math.floor(counterProgress * 1455);
  const counterOpacity = interpolate(
    frame,
    [counterStart, counterStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Timeline 518 years
  const timelineStart = fps * 5.5;
  const timelineOpacity = interpolate(
    frame,
    [timelineStart, timelineStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const timelineWidth = interpolate(
    frame,
    [timelineStart, timelineStart + fps * 1.5],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Death toll counter
  const deathStart = fps * 12.0;
  const deathProgress = interpolate(
    frame,
    [deathStart, deathStart + fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayDeath = Math.floor(deathProgress * 60);
  const deathOpacity = interpolate(
    frame,
    [deathStart, deathStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const deathScale = spring({
    frame: frame - deathStart,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Alarm pulse
  const alarmPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 3),
    [-1, 1],
    [0.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Sillok book visual */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          opacity: sillokOpacity,
        }}
      >
        <div
          style={{
            width: 240,
            height: 320,
            background: "linear-gradient(135deg, #8B0000 0%, #5C0000 100%)",
            borderRadius: 6,
            boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontFamily,
              fontWeight: 700,
              color: "#FFD700",
              textAlign: "center",
              writingMode: "vertical-rl",
            }}
          >
            朝鮮王朝實錄
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 36,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          조선왕조실록
        </div>
      </div>

      {/* Epidemic counter - 1455 */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "10%",
          opacity: counterOpacity,
        }}
      >
        <div
          style={{
            padding: "28px 52px",
            background: "rgba(139, 0, 0, 0.1)",
            borderRadius: 16,
            border: "3px solid #8B0000",
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
            전염병 기록
          </div>
          <div
            style={{
              fontSize: 96,
              fontFamily,
              fontWeight: 900,
              color: "#8B0000",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            {displayCounter.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 48,
              fontFamily,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            건
          </div>
        </div>
      </div>

      {/* Timeline - 518 years */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          opacity: timelineOpacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            marginBottom: 16,
            textShadow: textStroke,
          }}
        >
          조선왕조 518년
        </div>
        <div
          style={{
            width: "100%",
            height: 32,
            background: "rgba(139, 0, 0, 0.1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${timelineWidth}%`,
              height: "100%",
              background: "linear-gradient(90deg, #8B0000 0%, #DC2626 100%)",
              borderRadius: 16,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            fontSize: 32,
            fontFamily,
            color: "#FFFFFF",
            textShadow: textStroke,
          }}
        >
          <span>1392년</span>
          <span>평균 2~3건/년</span>
          <span>1910년</span>
        </div>
      </div>

      {/* Death toll - 50-60만 */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "50%",
          transform: `translateX(-50%) scale(${deathScale})`,
          opacity: deathOpacity,
        }}
      >
        <div
          style={{
            padding: "32px 60px",
            background: `rgba(220, 38, 38, ${0.15 + alarmPulse * 0.1})`,
            borderRadius: 16,
            border: "4px solid #DC2626",
            boxShadow: `0 0 ${30 * alarmPulse}px rgba(220, 38, 38, 0.6)`,
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
            영조 25년 역병 사망자
          </div>
          <div
            style={{
              fontSize: 110,
              fontFamily,
              fontWeight: 900,
              color: "#DC2626",
              textAlign: "center",
              textShadow: `${textStroke}, 0 0 ${20 * alarmPulse}px rgba(220, 38, 38, 0.8)`,
            }}
          >
            {displayDeath}만
          </div>
          <div
            style={{
              fontSize: 52,
              fontFamily,
              fontWeight: 600,
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: textStroke,
            }}
          >
            명 사망
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
