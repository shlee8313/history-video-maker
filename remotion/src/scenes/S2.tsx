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

export const S2: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 2.5] - "1597년, 조선 수군은 사실상 전멸 상태였습니다"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const yearDelay = secondsToFrames(0.3);
  const yearOpacity = interpolate(
    frame,
    [yearDelay, yearDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const burningDelay = secondsToFrames(0.8);
  const burningOpacity = interpolate(
    frame,
    [burningDelay, burningDelay + secondsToFrames(1.0)],
    [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [2.5, 5.5] - "칠천량 해전에서..."
  const step2Start = secondsToFrames(2.5);

  const locationOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.7)],
    [0, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const sinkingDelay = step2Start + secondsToFrames(0.5);
  const sinkingOpacity = interpolate(
    frame,
    [sinkingDelay, sinkingDelay + secondsToFrames(0.8)],
    [0, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const sinkingY = interpolate(
    frame,
    [sinkingDelay, sinkingDelay + secondsToFrames(1.5)],
    [50, 80],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
  );

  // Step 3: time_range [5.5, 11.2] - "전함 백오십여 척이..."
  const step3Start = secondsToFrames(5.5);

  const countScale = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const countOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Shake effect
  const shakeStart = step3Start + secondsToFrames(0.7);
  const shakeEnd = shakeStart + secondsToFrames(0.5);
  const shakeOffset = frame >= shakeStart && frame <= shakeEnd
    ? Math.sin((frame - shakeStart) * 0.5) * 10
    : 0;

  // Pulse for burning ships
  const pulseStart = step3Start + secondsToFrames(1.0);
  const pulseCycle = secondsToFrames(2.0);
  const pulseValue = frame >= pulseStart
    ? 0.8 + Math.sin(((frame - pulseStart) / pulseCycle) * Math.PI * 2) * 0.1
    : burningOpacity;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map */}
      <Img
        src={staticFile("assets/maps/joseon_south_sea.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.4) contrast(1.1) brightness(0.85)",
          zIndex: -100,
        }}
      />

      {/* Burning Ships Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1.15)",
          opacity: frame >= pulseStart ? pulseValue : burningOpacity,
          zIndex: 0,
        }}
      >
        <Img
          src={staticFile("assets/backgrounds/fire_arrows.png")}
          style={{
            width: 1344,
            height: 768,
            filter: "sepia(0.5) contrast(1.2) brightness(0.9)",
          }}
        />
      </div>

      {/* Year Display */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-700}px), calc(-50% + ${-420}px))`,
          opacity: yearOpacity,
          fontSize: 80,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 200,
        }}
      >
        1597
      </div>

      {/* Sinking Ships Icon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${sinkingY}px)) scale(0.4)`,
          opacity: sinkingOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/sinking_ships.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(0.8)",
          }}
        />
      </div>

      {/* Ship Count */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${shakeOffset}px), calc(-50% + ${-150}px)) scale(${countScale})`,
          opacity: countOpacity,
          fontSize: 100,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 100,
        }}
      >
        150척
      </div>

      {/* Location Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${360}px))`,
          opacity: locationOpacity,
          fontSize: 60,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        칠천량
      </div>
    </AbsoluteFill>
  );
};

export default S2;
