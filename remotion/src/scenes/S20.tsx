import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  Img,
} from "remotion";

// Scene S20: Core3 - 예덕선생전 구조 설명
// Duration: 11.12s (334 frames at 30fps)

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
    text: "박지원은 20세 전후, 젊은 시절에 이 작품을 썼습니다.",
    start: 0.0,
    end: 3.62,
  },
  {
    index: 1,
    text: "예덕선생전은 열전체의 변체로,",
    start: 4.52,
    end: 7.14,
  },
  {
    index: 2,
    text: "스승 선귤자와 제자 자목 사이의 대화체로 구성되어 있습니다.",
    start: 7.38,
    end: 11.12,
  },
];

export const S20: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Young Park Jiwon
  const parkOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Age badge
  const ageStart = fps * 1.0;
  const ageOpacity = interpolate(frame, [ageStart, ageStart + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ageScale = interpolate(frame, [ageStart, ageStart + fps * 0.5], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Book
  const bookStart = fps * 4.0;
  const bookOpacity = interpolate(
    frame,
    [bookStart, bookStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Dialogue structure
  const structureStart = fps * 7.0;
  const structureOpacity = interpolate(
    frame,
    [structureStart, structureStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Arrow between characters
  const arrowProgress = interpolate(
    frame,
    [structureStart + fps * 0.5, structureStart + fps * 1.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse animation for dialogue
  const pulseSeon = Math.sin((frame / fps) * Math.PI * 2);
  const pulseJamok = Math.sin((frame / fps) * Math.PI * 2 + Math.PI);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Young Park Jiwon */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          opacity: parkOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 180,
            height: 220,
            background: "linear-gradient(180deg, #D2B48C 0%, #8B7355 100%)",
            borderRadius: "50% 50% 30% 30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily,
              color: "#4a4a4a",
              textAlign: "center",
            }}
          >
            젊은
            <br />
            박지원
          </div>

          {/* Youth glow */}
          <div
            style={{
              position: "absolute",
              inset: -5,
              borderRadius: "50% 50% 30% 30%",
              background: "radial-gradient(circle, rgba(255, 223, 186, 0.3) 0%, transparent 70%)",
            }}
          />
        </div>
      </div>

      {/* Age badge */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "22%",
          opacity: ageOpacity,
          transform: `scale(${ageScale})`,
        }}
      >
        <div
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            borderRadius: 30,
            boxShadow: "0 4px 12px rgba(255, 165, 0, 0.4)",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontFamily,
              fontWeight: 800,
              color: "#8B0000",
            }}
          >
            20세
          </div>
        </div>
      </div>

      {/* Book - Yedeok Seonsaengjeon */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "15%",
          opacity: bookOpacity,
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("assets/images/yedeok_book.png")}
          style={{
            width: 230,
            height: "auto",
            borderRadius: 8,
            boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            fontFamily,
            color: "#8B4513",
          }}
        >
          열전체의 변체
        </div>
      </div>

      {/* Dialogue structure diagram */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: structureOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 100,
            alignItems: "center",
          }}
        >
          {/* Seongyulja (Teacher) */}
          <div
            style={{
              textAlign: "center",
              transform: `scale(${1 + pulseSeon * 0.03})`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 150,
                background: "linear-gradient(180deg, #4169E1 0%, #1E3A8A 100%)",
                borderRadius: "50% 50% 20% 20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(65, 105, 225, 0.4)",
              }}
            >
              <div style={{ fontSize: 80 }}>👨‍🏫</div>
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#4169E1",
              }}
            >
              선귤자
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#666",
              }}
            >
              (스승)
            </div>
          </div>

          {/* Dialogue arrows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                opacity: arrowProgress,
              }}
            >
              <div
                style={{
                  width: 80 * arrowProgress,
                  height: 4,
                  background: "#4169E1",
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 24, color: "#4169E1" }}>→</div>
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily,
                color: "#666",
                textAlign: "center",
              }}
            >
              대화
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                opacity: arrowProgress,
              }}
            >
              <div style={{ fontSize: 24, color: "#228B22" }}>←</div>
              <div
                style={{
                  width: 80 * arrowProgress,
                  height: 4,
                  background: "#228B22",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* Jamok (Student) */}
          <div
            style={{
              textAlign: "center",
              transform: `scale(${1 + pulseJamok * 0.03})`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 150,
                background: "linear-gradient(180deg, #228B22 0%, #006400 100%)",
                borderRadius: "50% 50% 20% 20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(34, 139, 34, 0.4)",
              }}
            >
              <div style={{ fontSize: 80 }}>👨‍🎓</div>
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontFamily,
                fontWeight: 700,
                color: "#228B22",
              }}
            >
              자목
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#666",
              }}
            >
              (제자)
            </div>
          </div>
        </div>

        {/* Structure label */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontSize: 32,
            fontFamily,
            color: "#4a4a4a",
            padding: "12px 24px",
            background: "rgba(245, 235, 210, 0.8)",
            borderRadius: 8,
          }}
        >
          📖 대화체 구성
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
