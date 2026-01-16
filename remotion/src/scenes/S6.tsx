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

export const S6: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 1.5] - "대형 함선이 많을수록"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.5)],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const straitBgDelay = secondsToFrames(0.3);
  const straitBgOpacity = interpolate(
    frame,
    [straitBgDelay, straitBgDelay + secondsToFrames(0.6)],
    [0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const ship1Delay = secondsToFrames(0.5);
  const ship1Opacity = interpolate(
    frame,
    [ship1Delay, ship1Delay + secondsToFrames(0.4)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const ship2Delay = secondsToFrames(0.7);
  const ship2Opacity = interpolate(
    frame,
    [ship2Delay, ship2Delay + secondsToFrames(0.4)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const ship3Delay = secondsToFrames(0.9);
  const ship3Opacity = interpolate(
    frame,
    [ship3Delay, ship3Delay + secondsToFrames(0.4)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [1.5, 3.32] - "불리한 지형입니다"
  const step2Start = secondsToFrames(1.5);

  const chaosOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const mainTextDelay = step2Start + secondsToFrames(0.3);
  const mainTextOpacity = interpolate(
    frame,
    [mainTextDelay, mainTextDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Shake effect for ships
  const shakeStart = step2Start + secondsToFrames(0.5);
  const shakeEnd = shakeStart + secondsToFrames(0.6);
  const shakeIntensity = 5;
  const shakeOffset = frame >= shakeStart && frame <= shakeEnd
    ? Math.sin((frame - shakeStart) * 0.6) * shakeIntensity
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map */}
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
          filter: "sepia(0.4) contrast(1.1) brightness(0.9)",
          zIndex: -100,
        }}
      />

      {/* Narrow Strait Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 800,
          backgroundColor: "#2a4a6a",
          opacity: straitBgOpacity,
          zIndex: 10,
        }}
      />

      {/* Large Ship Left */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-100 + shakeOffset}px), calc(-50% + ${-100}px)) scale(0.2) rotate(15deg)`,
          opacity: ship1Opacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_japan.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(0.8)",
          }}
        />
      </div>

      {/* Large Ship Right */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${100 + shakeOffset}px), calc(-50% + ${50}px)) scale(0.2) rotate(-15deg)`,
          opacity: ship2Opacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_japan.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(0.8)",
          }}
        />
      </div>

      {/* Large Ship Center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${shakeOffset}px), calc(-50% + ${150}px)) scale(0.18) rotate(8deg)`,
          opacity: ship3Opacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_japan.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(0.8)",
          }}
        />
      </div>

      {/* Chaos Symbol */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(0.3)",
          opacity: chaosOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/icons/chaos_symbol.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(1.1)",
          }}
        />
      </div>

      {/* Main Text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-300}px))`,
          opacity: mainTextOpacity,
          fontSize: 75,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textAlign: "center",
          lineHeight: 1.5,
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          whiteSpace: "pre-line",
          zIndex: 200,
        }}
      >
        {`대형 함선이 많을수록\n불리한 지형`}
      </div>
    </AbsoluteFill>
  );
};

export default S6;
