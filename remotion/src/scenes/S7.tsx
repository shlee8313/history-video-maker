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

export const S7: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 2.5] - "1597년 음력 9월 16일"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const sunDelay = secondsToFrames(0.5);
  const sunOpacity = interpolate(
    frame,
    [sunDelay, sunDelay + secondsToFrames(1.0)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const dateDelay = secondsToFrames(0.8);
  const dateOpacity = interpolate(
    frame,
    [dateDelay, dateDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const titleDelay = secondsToFrames(1.2);
  const titleOpacity = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [2.5, 6.0] - "일본 함대가 울돌목에 진입"
  const step2Start = secondsToFrames(2.5);

  const fleetOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const fleetY = interpolate(
    frame,
    [step2Start + secondsToFrames(0.5), step2Start + secondsToFrames(2.0)],
    [350, 250],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  const labelDelay = step2Start + secondsToFrames(1.5);
  const labelOpacity = interpolate(
    frame,
    [labelDelay, labelDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 3: time_range [6.0, 10.16] - "이순신은 직접 대장선을..."
  const step3Start = secondsToFrames(6.0);

  const flagshipDelay = step3Start + secondsToFrames(0.3);
  const flagshipOpacity = interpolate(
    frame,
    [flagshipDelay, flagshipDelay + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const flagshipLabelDelay = step3Start + secondsToFrames(1.0);
  const flagshipLabelOpacity = interpolate(
    frame,
    [flagshipLabelDelay, flagshipLabelDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulse for flagship
  const pulseStart = step3Start + secondsToFrames(1.5);
  const flagshipScale = frame >= pulseStart
    ? 0.5 + Math.sin(((frame - pulseStart) / secondsToFrames(1.5)) * Math.PI) * 0.015
    : 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map - Myeongnyang Strait */}
      <Img
        src={staticFile("assets/maps/myeongnyang_strait.png")}
        style={{
          position: "absolute",
          width: 2752 * 0.7,
          height: 1536 * 0.7,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.45) contrast(1.2) brightness(0.95)",
          zIndex: -100,
        }}
      />

      {/* Dawn Sun */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${700}px), calc(-50% + ${-300}px)) scale(0.15)`,
          opacity: sunOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile("assets/icons/dawn_sun.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.2)",
          }}
        />
      </div>

      {/* Date Display */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-450}px))`,
          opacity: dateOpacity,
          fontSize: 90,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 200,
        }}
      >
        1597.9.16
      </div>

      {/* Battle Title */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-350}px))`,
          opacity: titleOpacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 200,
        }}
      >
        명량해전
      </div>

      {/* Japanese Fleet */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${fleetY}px)) scale(0.35)`,
          opacity: fleetOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/japanese_fleet_advancing.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(0.8)",
          }}
        />
      </div>

      {/* Japanese Fleet Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${420}px))`,
          opacity: labelOpacity,
          fontSize: 70,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#2a2a2a",
          textShadow: "3px 3px 0 #d4443f",
          WebkitTextStroke: "3px #d4443f",
          zIndex: 100,
        }}
      >
        133척
      </div>

      {/* Yi Flagship (Panokseon) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-50}px)) scale(${flagshipScale})`,
          opacity: flagshipOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/backgrounds/panokseon_flagship.png")}
          style={{
            width: 1344,
            height: 768,
            filter: "sepia(0.4) contrast(1.15)",
          }}
        />
      </div>

      {/* Flagship Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${150}px))`,
          opacity: flagshipLabelOpacity,
          fontSize: 60,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 150,
        }}
      >
        대장선
      </div>
    </AbsoluteFill>
  );
};

export default S7;
