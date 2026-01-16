import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Img,
  staticFile,
  interpolate,
  Easing,
} from "remotion";
import { FONTS } from "../lib/styles";
import { secondsToFrames } from "../lib/animations";

export const S10: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 4.0] - "좁은 해협에서 대형 함선들이..."
  const bgStraitOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const currentFlowDelay = secondsToFrames(0.5);
  const currentFlowOpacity = interpolate(
    frame,
    [currentFlowDelay, currentFlowDelay + secondsToFrames(1.0)],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Sinking ships appear sequentially
  const sinkingShips = [
    { x: -350, y: -100, rotation: -20, scale: 0.15, delay: 1.0 },
    { x: -100, y: 50, rotation: 15, scale: 0.13, delay: 1.3 },
    { x: 150, y: -50, rotation: -10, scale: 0.14, delay: 1.6 },
    { x: 400, y: 100, rotation: 25, scale: 0.12, delay: 1.9 },
  ];

  const getSinkingOpacity = (delay: number) => {
    const d = secondsToFrames(delay);
    return interpolate(
      frame,
      [d, d + secondsToFrames(0.6)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
    );
  };

  // Step 2: time_range [4.0, 7.0] - "결과는 일본 전함 31척 격침"
  const step2Start = secondsToFrames(4.0);

  const resultPanelOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.7)],
    [0, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const japanLossDelay = step2Start + secondsToFrames(0.5);
  const japanLossScale = interpolate(
    frame,
    [japanLossDelay, japanLossDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const japanLossOpacity = interpolate(
    frame,
    [japanLossDelay, japanLossDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Step 3: time_range [7.0, 10.84] - "조선 측 피해는 단 두 명..."
  const step3Start = secondsToFrames(7.0);

  const separatorOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.4)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const joseonLossDelay = step3Start + secondsToFrames(0.4);
  const joseonLossScale = interpolate(
    frame,
    [joseonLossDelay, joseonLossDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const joseonLossOpacity = interpolate(
    frame,
    [joseonLossDelay, joseonLossDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const ratioDelay = step3Start + secondsToFrames(1.0);
  const ratioScale = interpolate(
    frame,
    [ratioDelay, ratioDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const ratioOpacity = interpolate(
    frame,
    [ratioDelay, ratioDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse for ratio
  const ratioPulseStart = step3Start + secondsToFrames(1.8);
  const ratioPulseScale = frame >= ratioPulseStart
    ? 1 + Math.sin(((frame - ratioPulseStart) / secondsToFrames(1.0)) * Math.PI) * 0.05
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Strait Map */}
      <Img
        src={staticFile("assets/maps/jindo_strait_map.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgStraitOpacity,
          filter: "sepia(0.5) contrast(1.15) brightness(0.9)",
          zIndex: -100,
        }}
      />

      {/* Current Flow Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1.2)",
          opacity: currentFlowOpacity,
          zIndex: 0,
        }}
      >
        <Img
          src={staticFile("assets/backgrounds/current_flow.png")}
          style={{
            width: 1344,
            height: 768,
            filter: "sepia(0.4) brightness(1.0)",
          }}
        />
      </div>

      {/* Sinking Ships */}
      {sinkingShips.map((ship, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${ship.x}px), calc(-50% + ${ship.y}px)) scale(${ship.scale}) rotate(${ship.rotation}deg)`,
            opacity: getSinkingOpacity(ship.delay),
            zIndex: 50,
          }}
        >
          <Img
            src={staticFile("assets/icons/sinking_ship.png")}
            style={{
              width: 1024,
              height: 1024,
              filter: "sepia(0.4) brightness(0.7)",
            }}
          />
        </div>
      ))}

      {/* Result Panel */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${350}px))`,
          width: 1400,
          height: 220,
          backgroundColor: "#1a1208",
          opacity: resultPanelOpacity,
          zIndex: 80,
        }}
      />

      {/* Japan Loss */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-300}px), calc(-50% + ${320}px)) scale(${japanLossScale})`,
          opacity: japanLossOpacity,
          fontSize: 70,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 150,
        }}
      >
        일본 31척 격침
      </div>

      {/* VS Separator */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${320}px))`,
          opacity: separatorOpacity,
          fontSize: 100,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          zIndex: 150,
        }}
      >
        :
      </div>

      {/* Joseon Loss */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${320}px), calc(-50% + ${320}px)) scale(${joseonLossScale})`,
          opacity: joseonLossOpacity,
          fontSize: 70,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#4a9eff",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 150,
        }}
      >
        조선 전사자 2명
      </div>

      {/* Result Ratio */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${410}px)) scale(${ratioScale * ratioPulseScale})`,
          opacity: ratioOpacity,
          fontSize: 85,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 150,
        }}
      >
        31 : 2
      </div>
    </AbsoluteFill>
  );
};

export default S10;
