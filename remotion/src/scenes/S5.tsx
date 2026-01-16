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

export const S5: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.5] - "이순신이 선택한 곳은 울돌목"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(1.0)],
    [0, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const titleDelay = secondsToFrames(0.8);
  const titleOpacity = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const titleY = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.8)],
    [-450, -400],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.5, 7.5] - "전라남도 진도와 화원반도..."
  const step2Start = secondsToFrames(3.5);

  const subtitleOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // inkWrite for strait highlight lines (simulated with opacity)
  const lineDelay = step2Start + secondsToFrames(1.0);
  const lineProgress = interpolate(
    frame,
    [lineDelay, lineDelay + secondsToFrames(1.2)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear }
  );

  // Step 3: time_range [7.5, 11.0] - "이곳의 폭은 고작 290미터"
  const step3Start = secondsToFrames(7.5);

  const arrowProgress = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear }
  );

  const widthDelay = step3Start + secondsToFrames(0.8);
  const widthScale = interpolate(
    frame,
    [widthDelay, widthDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const widthOpacity = interpolate(
    frame,
    [widthDelay, widthDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Step 4: time_range [11.0, 14.16] - "물살은 시속 11노트..."
  const step4Start = secondsToFrames(11.0);

  const wavesOpacity = interpolate(
    frame,
    [step4Start, step4Start + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const speedDelay = step4Start + secondsToFrames(0.6);
  const speedOpacity = interpolate(
    frame,
    [speedDelay, speedDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulse for waves
  const pulseStart = step4Start + secondsToFrames(1.0);
  const wavesPulse = frame >= pulseStart
    ? 0.7 + Math.sin(((frame - pulseStart) / secondsToFrames(1.0)) * Math.PI) * 0.15
    : wavesOpacity;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map - Uldolmok */}
      <Img
        src={staticFile("assets/maps/uldolmok_strait.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.4) contrast(1.15) brightness(1.0)",
          zIndex: -100,
        }}
      />

      {/* Location Title */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${titleY}px))`,
          opacity: titleOpacity,
          fontSize: 120,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "5px 5px 0 #2a1810",
          WebkitTextStroke: "5px #2a1810",
          zIndex: 200,
        }}
      >
        울돌목
      </div>

      {/* Location Subtitle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-310}px))`,
          opacity: subtitleOpacity,
          fontSize: 48,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        전라남도 진도 - 화원반도
      </div>

      {/* Strait Highlight Lines (SVG) */}
      <svg
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          zIndex: 50,
        }}
      >
        {/* Left Line */}
        <line
          x1={50}
          y1={120}
          x2={50}
          y2={320}
          stroke="#d4443f"
          strokeWidth={4}
          strokeDasharray={200}
          strokeDashoffset={200 * (1 - lineProgress)}
        />
        {/* Right Line */}
        <line
          x1={350}
          y1={120}
          x2={350}
          y2={320}
          stroke="#d4443f"
          strokeWidth={4}
          strokeDasharray={200}
          strokeDashoffset={200 * (1 - lineProgress)}
        />
      </svg>

      {/* Width Arrow (SVG) */}
      <svg
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% + 120px))",
          width: 400,
          height: 20,
          zIndex: 60,
        }}
      >
        <line
          x1={50}
          y1={10}
          x2={350}
          y2={10}
          stroke="#d4af37"
          strokeWidth={3}
          strokeDasharray={300}
          strokeDashoffset={300 * (1 - arrowProgress)}
        />
      </svg>

      {/* Width Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${180}px)) scale(${widthScale})`,
          opacity: widthOpacity,
          fontSize: 80,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 100,
        }}
      >
        290m
      </div>

      {/* Current Waves */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(0.5)",
          opacity: frame >= pulseStart ? wavesPulse : wavesOpacity,
          zIndex: 20,
        }}
      >
        <Img
          src={staticFile("assets/icons/current_waves.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.1)",
          }}
        />
      </div>

      {/* Current Speed */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${350}px))`,
          opacity: speedOpacity,
          fontSize: 60,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#4a9eff",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 100,
        }}
      >
        시속 11노트 급류
      </div>
    </AbsoluteFill>
  );
};

export default S5;
