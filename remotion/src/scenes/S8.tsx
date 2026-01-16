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

export const S8: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 2.5] - "열두 척 중 싸우는 배는 단 한 척"
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.6)],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const battleBgDelay = secondsToFrames(0.3);
  const battleBgOpacity = interpolate(
    frame,
    [battleBgDelay, battleBgDelay + secondsToFrames(0.8)],
    [0, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const spotlightDelay = secondsToFrames(0.5);
  const spotlightOpacity = interpolate(
    frame,
    [spotlightDelay, spotlightDelay + secondsToFrames(0.8)],
    [0, 0.15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const vsDelay = secondsToFrames(1.0);
  const vsScale = interpolate(
    frame,
    [vsDelay, vsDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const vsOpacity = interpolate(
    frame,
    [vsDelay, vsDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Step 2: time_range [2.5, 4.5] - "그의 배뿐이었습니다"
  const step2Start = secondsToFrames(2.5);

  const flagshipPulseCycle = secondsToFrames(0.8);
  const flagshipScale = frame >= step2Start
    ? 0.25 + Math.sin(((frame - step2Start) / flagshipPulseCycle) * Math.PI) * 0.015
    : 0.25;

  const spotlightPulse = frame >= step2Start
    ? 0.15 + Math.sin(((frame - step2Start) / flagshipPulseCycle) * Math.PI) * 0.05
    : spotlightOpacity;

  // Step 3: time_range [4.5, 7.28] - "두 시간 동안 홀로 버텼습니다"
  const step3Start = secondsToFrames(4.5);

  const timeScale = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const timeOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const subtitleDelay = step3Start + secondsToFrames(0.5);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleDelay, subtitleDelay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const collision1Delay = step3Start + secondsToFrames(0.8);
  const collision1Opacity = interpolate(
    frame,
    [collision1Delay, collision1Delay + secondsToFrames(0.4)],
    [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const collision2Delay = step3Start + secondsToFrames(1.1);
  const collision2Opacity = interpolate(
    frame,
    [collision2Delay, collision2Delay + secondsToFrames(0.4)],
    [0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

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
          filter: "sepia(0.5) contrast(1.2) brightness(0.85)",
          zIndex: -100,
        }}
      />

      {/* Battle Background (Fire) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1.2)",
          opacity: battleBgOpacity,
          zIndex: 0,
        }}
      >
        <Img
          src={staticFile("assets/backgrounds/fire_arrows.png")}
          style={{
            width: 1344,
            height: 768,
            filter: "sepia(0.4) contrast(1.15)",
          }}
        />
      </div>

      {/* Spotlight Circle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          backgroundColor: "#d4af37",
          opacity: frame >= step2Start ? spotlightPulse : spotlightOpacity,
          zIndex: 20,
        }}
      />

      {/* Yi Flagship Solo */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${flagshipScale})`,
          opacity: 1,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_joseon.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.1) contrast(1.2)",
          }}
        />
      </div>

      {/* VS Text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-300}px)) scale(${vsScale})`,
          opacity: vsOpacity,
          fontSize: 85,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 200,
        }}
      >
        1척 vs 133척
      </div>

      {/* Time Display */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${300}px)) scale(${timeScale})`,
          opacity: timeOpacity,
          fontSize: 100,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "5px 5px 0 #2a1810",
          WebkitTextStroke: "5px #2a1810",
          zIndex: 200,
        }}
      >
        2시간
      </div>

      {/* Time Subtitle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${390}px))`,
          opacity: subtitleOpacity,
          fontSize: 55,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        홀로 버팀
      </div>

      {/* Collision Effect 1 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-350}px), calc(-50% + ${-150}px)) scale(0.15)`,
          opacity: collision1Opacity,
          zIndex: 80,
        }}
      >
        <Img
          src={staticFile("assets/icons/collision_effect.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.3)",
          }}
        />
      </div>

      {/* Collision Effect 2 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${350}px), calc(-50% + ${150}px)) scale(0.15)`,
          opacity: collision2Opacity,
          zIndex: 80,
        }}
      >
        <Img
          src={staticFile("assets/icons/collision_effect.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) brightness(1.3)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default S8;
