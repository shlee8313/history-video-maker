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

export const S11: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.0] - "명량해전은 단순한 승리가 아닙니다"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const titleDelay = secondsToFrames(0.6);
  const titleOpacity = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.9)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const titleY = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.9)],
    [-400, -350],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.0, 5.5] - "이것은 리더십의 교과서입니다"
  const step2Start = secondsToFrames(3.0);

  const analysisBgOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.7)],
    [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulse for title
  const titlePulseStart = step2Start + secondsToFrames(0.5);
  const titlePulseScale = frame >= titlePulseStart
    ? 1 + Math.sin(((frame - titlePulseStart) / secondsToFrames(1.0)) * Math.PI) * 0.025
    : 1;

  // Step 3: time_range [5.5, 9.48] - "이순신은 적의 숫자가 아니라..."
  const step3Start = secondsToFrames(5.5);

  const insight1Opacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const insight2Delay = step3Start + secondsToFrames(0.6);
  const insight2Opacity = interpolate(
    frame,
    [insight2Delay, insight2Delay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const icon1Delay = step3Start + secondsToFrames(1.2);
  const icon1Opacity = interpolate(
    frame,
    [icon1Delay, icon1Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const icon2Delay = step3Start + secondsToFrames(1.4);
  const icon2Opacity = interpolate(
    frame,
    [icon2Delay, icon2Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const widthDelay = step3Start + secondsToFrames(1.8);
  const widthOpacity = interpolate(
    frame,
    [widthDelay, widthDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const calcDelay = step3Start + secondsToFrames(2.2);
  const calcOpacity = interpolate(
    frame,
    [calcDelay, calcDelay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map */}
      <Img
        src={staticFile("assets/maps/jindo_uldolmok_map.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.45) contrast(1.1) brightness(0.95)",
          zIndex: -100,
        }}
      />

      {/* Title Main */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${titleY}px)) scale(${titlePulseScale})`,
          opacity: titleOpacity,
          fontSize: 95,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "5px 5px 0 #2a1810",
          WebkitTextStroke: "5px #2a1810",
          zIndex: 200,
        }}
      >
        리더십의 교과서
      </div>

      {/* Terrain Analysis Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${50}px))`,
          width: 1200,
          height: 400,
          backgroundColor: "#1a1208",
          opacity: analysisBgOpacity,
          zIndex: 20,
        }}
      />

      {/* Insight Text 1 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-50}px))`,
          opacity: insight1Opacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 100,
        }}
      >
        적의 숫자가 아니라
      </div>

      {/* Insight Text 2 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${50}px))`,
          opacity: insight2Opacity,
          fontSize: 75,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 100,
        }}
      >
        지형을 읽었다
      </div>

      {/* Terrain Icon 1 (Waves) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-450}px), calc(-50% + ${50}px)) scale(0.15)`,
          opacity: icon1Opacity,
          zIndex: 50,
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

      {/* Terrain Icon 2 (Arrow) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${450}px), calc(-50% + ${50}px)) scale(0.15) rotate(90deg)`,
          opacity: icon2Opacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/current_arrow.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.1)",
          }}
        />
      </div>

      {/* Width Highlight */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${180}px))`,
          opacity: widthOpacity,
          fontSize: 60,
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

      {/* Calculation Icon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${350}px)) scale(0.12)`,
          opacity: calcOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/calculation_icon.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(1.2)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default S11;
