import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Scene S26: Core4 - 자목의 질문
// Duration: 11.02s (331 frames at 30fps)

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
    text: "예덕선생전에서는 제자 자목이",
    start: 0.0,
    end: 2.12,
  },
  {
    index: 1,
    text: "스승 선귤자에게 불만을 표시하는 장면이 나옵니다.",
    start: 2.12,
    end: 5.26,
  },
  {
    index: 2,
    text: '"스승님께서는 왜 사대부와 교유하지 않고',
    start: 6.1,
    end: 9.08,
  },
  {
    index: 3,
    text: '비천한 엄행수를 벗하십니까?"',
    start: 9.08,
    end: 11.02,
  },
];

export const S26: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Animation: Scene introduction
  const sceneOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Seongyulja (teacher)
  const teacherOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation: Jamok (student) with questioning gesture
  const studentStart = fps * 1.5;
  const studentOpacity = interpolate(
    frame,
    [studentStart, studentStart + fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation: Question bubble
  const bubbleStart = fps * 6.0;
  const bubbleScale = spring({
    frame: frame - bubbleStart,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const bubbleOpacity = interpolate(
    frame,
    [bubbleStart, bubbleStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Question text typewriter
  const question1 = "스승님께서는 왜 사대부와 교유하지 않고";
  const question2 = "비천한 엄행수를 벗하십니까?";
  const q1Progress = interpolate(
    frame,
    [bubbleStart, bubbleStart + fps * 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const q2Start = bubbleStart + fps * 2.5;
  const q2Progress = interpolate(frame, [q2Start, q2Start + fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shaking animation for frustrated student
  const shakeX =
    frame > studentStart + fps * 5
      ? Math.sin(frame * 0.8) *
        3 *
        interpolate(frame, [studentStart + fps * 5, studentStart + fps * 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Scene title */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: sceneOpacity,
          padding: "10px 24px",
          background: "rgba(139, 69, 19, 0.8)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontFamily,
            fontWeight: 600,
            color: "#F5DEB3",
          }}
        >
          <span style={{ fontSize: 50 }}>📖</span> 예덕선생전 中
        </div>
      </div>

      {/* Traditional room background element */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "85%",
          height: "55%",
          background: "linear-gradient(180deg, rgba(245, 235, 210, 0.3) 0%, rgba(222, 184, 135, 0.2) 100%)",
          borderRadius: 16,
          opacity: sceneOpacity,
        }}
      />

      {/* Seongyulja (Teacher) - left side */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "15%",
          opacity: teacherOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 140,
            height: 180,
            background: "linear-gradient(180deg, #4169E1 0%, #1E3A8A 100%)",
            borderRadius: "50% 50% 20% 20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(65, 105, 225, 0.3)",
          }}
        >
          <div style={{ fontSize: 80 }}>👨‍🏫</div>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            fontFamily,
            fontWeight: 700,
            color: "#4169E1",
          }}
        >
          선귤자
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#666",
          }}
        >
          (스승)
        </div>
        {/* Calm expression */}
        <div
          style={{
            marginTop: 8,
            fontSize: 28,
            color: "#4169E1",
          }}
        >
          <span style={{ fontSize: 50 }}>🧘</span> 차분히 경청
        </div>
      </div>

      {/* Jamok (Student) - right side */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "15%",
          opacity: studentOpacity,
          textAlign: "center",
          transform: `translateX(${shakeX}px)`,
        }}
      >
        <div
          style={{
            width: 140,
            height: 180,
            background: "linear-gradient(180deg, #228B22 0%, #006400 100%)",
            borderRadius: "50% 50% 20% 20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(34, 139, 34, 0.3)",
          }}
        >
          <div style={{ fontSize: 80 }}>🙋</div>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            fontFamily,
            fontWeight: 700,
            color: "#228B22",
          }}
        >
          자목
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#666",
          }}
        >
          (제자)
        </div>
        {/* Frustrated expression */}
        <div
          style={{
            marginTop: 8,
            fontSize: 28,
            color: "#DC143C",
          }}
        >
          <span style={{ fontSize: 50 }}>😤</span> 불만 표출
        </div>
      </div>

      {/* Question speech bubble */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          right: "8%",
          opacity: bubbleOpacity,
          transform: `scale(${bubbleScale})`,
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "20px 28px",
            background: "#FFF",
            borderRadius: 16,
            border: "3px solid #228B22",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            maxWidth: 380,
          }}
        >
          {/* Bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: -20,
              right: 40,
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "20px solid #228B22",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -14,
              right: 43,
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "17px solid #FFF",
            }}
          />

          {/* Question text */}
          <div
            style={{
              fontSize: 28,
              fontFamily,
              lineHeight: 1.6,
              color: "#333",
            }}
          >
            "{question1.slice(0, Math.floor(question1.length * q1Progress))}
            <br />
            {question2.slice(0, Math.floor(question2.length * q2Progress))}"
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
