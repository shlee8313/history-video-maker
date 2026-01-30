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

// Scene S15: Core2 - 매분자의 비즈니스 모델 탄생
// Duration: 20.74s (622 frames at 30fps)

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
    text: "바로 여기서 매분자들의 비즈니스 모델이 탄생합니다.",
    start: 0.0,
    end: 3.66,
  },
  {
    index: 1,
    text: "한양 도성 안에서는 법으로 농사가 금지되어 있었습니다.",
    start: 4.6,
    end: 8.04,
  },
  {
    index: 2,
    text: "분뇨를 직접 쓸 곳이 없었던 거죠.",
    start: 8.24,
    end: 9.76,
  },
  {
    index: 3,
    text: "반면 성 밖 농촌에서는 분뇨가 절실히 필요했습니다.",
    start: 11.88,
    end: 15.1,
  },
  {
    index: 4,
    text: "수요와 공급의 불균형.",
    start: 16.0,
    end: 17.62,
  },
  {
    index: 5,
    text: "바로 이 틈새에서 매분자들이 등장한 겁니다.",
    start: 17.78,
    end: 20.74,
  },
];

export const S15: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Title
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Animation: Map fade in
  const mapStart = fps * 4.0;
  const mapOpacity = interpolate(frame, [mapStart, mapStart + fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: City (supply overflow)
  const cityStart = fps * 5.0;
  const cityOpacity = interpolate(
    frame,
    [cityStart, cityStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cityPulse =
    1 +
    Math.sin((frame / fps) * Math.PI * 2) *
      0.05 *
      interpolate(frame, [cityStart, cityStart + fps * 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Animation: Farm (demand)
  const farmStart = fps * 11.5;
  const farmOpacity = interpolate(
    frame,
    [farmStart, farmStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const farmPulse =
    1 +
    Math.sin((frame / fps) * Math.PI * 3) *
      0.05 *
      interpolate(frame, [farmStart, farmStart + fps * 3], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Animation: Arrow flow
  const arrowStart = fps * 15.5;
  const arrowProgress = interpolate(
    frame,
    [arrowStart, arrowStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Maebunza emergence
  const maebunzaStart = fps * 17.5;
  const maebunzaScale = spring({
    frame: frame - maebunzaStart,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const maebunzaOpacity = interpolate(
    frame,
    [maebunzaStart, maebunzaStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Title: 비즈니스 모델 탄생 */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: `translateX(-50%) scale(${titleScale})`,
          opacity: titleOpacity,
          fontSize: 40,
          fontFamily,
          fontWeight: 800,
          color: "#2F4F4F",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        💼 비즈니스 모델 탄생
      </div>

      {/* Map background */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: mapOpacity * 0.6,
          width: 350,
          height: 350,
        }}
      >
        <Img
          src={staticFile("assets/maps/hanyang.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "sepia(0.3)",
          }}
        />
      </div>

      {/* Supply-Demand visualization */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 120,
          alignItems: "center",
        }}
      >
        {/* City - Supply overflow */}
        <div
          style={{
            opacity: cityOpacity,
            textAlign: "center",
            transform: `scale(${cityPulse})`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #DC143C 0%, #8B0000 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(220, 20, 60, 0.4)",
            }}
          >
            <Img
              src={staticFile("assets/icons/sungnyemun.png")}
              style={{
                width: 70,
                height: "auto",
                filter: "brightness(1.2)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              fontFamily,
              fontWeight: 700,
              color: "#DC143C",
            }}
          >
            도성 안
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#666",
            }}
          >
            공급 과잉 ↑
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 16,
              color: "#999",
              fontStyle: "italic",
            }}
          >
            농사 금지
          </div>
        </div>

        {/* Arrow flow */}
        <div
          style={{
            position: "relative",
            width: 100,
            height: 40,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${arrowProgress * 100}%`,
              height: 8,
              background: "linear-gradient(90deg, #DC143C, #228B22)",
              borderRadius: 4,
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              fontSize: 32,
              color: "#228B22",
              opacity: arrowProgress,
            }}
          >
            →
          </div>
          <div
            style={{
              position: "absolute",
              top: -30,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 14,
              color: "#666",
              opacity: arrowProgress,
              whiteSpace: "nowrap",
            }}
          >
            수요-공급 연결
          </div>
        </div>

        {/* Farm - Demand */}
        <div
          style={{
            opacity: farmOpacity,
            textAlign: "center",
            transform: `scale(${farmPulse})`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #228B22 0%, #006400 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(34, 139, 34, 0.4)",
            }}
          >
            <Img
              src={staticFile("assets/icons/farm_village.png")}
              style={{
                width: 80,
                height: "auto",
                filter: "brightness(1.2)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              fontFamily,
              fontWeight: 700,
              color: "#228B22",
            }}
          >
            성 밖 농촌
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#666",
            }}
          >
            수요 급증 ↑
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 16,
              color: "#999",
              fontStyle: "italic",
            }}
          >
            비료 필요
          </div>
        </div>
      </div>

      {/* Maebunza emergence */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          transform: `translateX(-50%) scale(${maebunzaScale})`,
          opacity: maebunzaOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "20px 48px",
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            borderRadius: 16,
            boxShadow: "0 6px 24px rgba(255, 165, 0, 0.5)",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontFamily,
              fontWeight: 800,
              color: "#8B0000",
            }}
          >
            💰 매분자 등장!
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              color: "#654321",
            }}
          >
            틈새시장 공략
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
