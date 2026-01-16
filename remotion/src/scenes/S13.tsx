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

export const S13: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 1.8] - "백서른셋 척을 이긴 건"
  const bgGradientOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.6)],
    [0, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const bgMapDelay = secondsToFrames(0.3);
  const bgMapOpacity = interpolate(
    frame,
    [bgMapDelay, bgMapDelay + secondsToFrames(0.8)],
    [0, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const beforeDelay = secondsToFrames(0.5);
  const beforeOpacity = interpolate(
    frame,
    [beforeDelay, beforeDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [1.8, 3.5] - "열두 척의 배가 아니라"
  const step2Start = secondsToFrames(1.8);

  const arrowOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const afterDelay = step2Start + secondsToFrames(0.4);
  const afterOpacity = interpolate(
    frame,
    [afterDelay, afterDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const portraitDelay = step2Start + secondsToFrames(0.6);
  const portraitOpacity = interpolate(
    frame,
    [portraitDelay, portraitDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const victoryDelay = step2Start + secondsToFrames(0.8);
  const victoryOpacity = interpolate(
    frame,
    [victoryDelay, victoryDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 3: time_range [3.5, 5.38] - "한 사람의 결단이었습니다"
  const step3Start = secondsToFrames(3.5);

  const messageScale = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const messageOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse for message
  const messagePulseStart = step3Start + secondsToFrames(0.8);
  const messagePulseScale = frame >= messagePulseStart
    ? 1 + Math.sin(((frame - messagePulseStart) / secondsToFrames(0.9)) * Math.PI) * 0.025
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1208" }}>
      {/* Dark Background */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1208",
          opacity: bgGradientOpacity,
          zIndex: -100,
        }}
      />

      {/* Faded Background Map */}
      <Img
        src={staticFile("assets/maps/joseon_south_sea_detail.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.6) blur(2px) brightness(0.7)",
          zIndex: -50,
        }}
      />

      {/* Comparison Before */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-400}px), calc(-50% + ${-100}px))`,
          opacity: beforeOpacity,
          fontSize: 90,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#6a6a6a",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 100,
        }}
      >
        12 vs 133
      </div>

      {/* Arrow Transform */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-100}px)) scale(0.15)`,
          opacity: arrowOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/icons/arrow_forward.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) hue-rotate(40deg)",
          }}
        />
      </div>

      {/* Comparison After */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${400}px), calc(-50% + ${-100}px))`,
          opacity: afterOpacity,
          fontSize: 100,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 100,
        }}
      >
        승리
      </div>

      {/* Yi Portrait Center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${80}px)) scale(0.32)`,
          opacity: portraitOpacity,
          zIndex: 150,
        }}
      >
        <Img
          src={staticFile("assets/portraits/yi_sun_sin_portrait.png")}
          style={{
            width: 1696,
            height: 2528,
            filter: "sepia(0.45) contrast(1.25) brightness(1.05)",
          }}
        />
      </div>

      {/* Victory Symbol */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-350}px)) scale(0.15)`,
          opacity: victoryOpacity,
          zIndex: 120,
        }}
      >
        <Img
          src={staticFile("assets/icons/victory_symbol.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(1.2)",
          }}
        />
      </div>

      {/* Main Message */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${450}px)) scale(${messageScale * messagePulseScale})`,
          opacity: messageOpacity,
          fontSize: 95,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "5px 5px 0 #2a1810",
          WebkitTextStroke: "5px #2a1810",
          zIndex: 200,
        }}
      >
        한 사람의 결단
      </div>
    </AbsoluteFill>
  );
};

export default S13;
