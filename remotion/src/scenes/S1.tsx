import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Img,
  staticFile,
  interpolate,
  Easing,
} from "remotion";
import { FONTS, COLORS } from "../lib/styles";
import { secondsToFrames } from "../lib/animations";

const FPS = 30;

export const S1: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 2.5] - "열두 척 대 백서른셋 척"
  // bg_map fadeIn
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(1.0)],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // ship_joseon popUp (delay 0.8, duration 0.5)
  const shipJoseonDelay = secondsToFrames(0.8);
  const shipJoseonScale = interpolate(
    frame,
    [shipJoseonDelay, shipJoseonDelay + secondsToFrames(0.5)],
    [0, 0.18],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const shipJoseonOpacity = interpolate(
    frame,
    [shipJoseonDelay, shipJoseonDelay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // number_12 popUp (delay 1.0, duration 0.5)
  const number12Delay = secondsToFrames(1.0);
  const number12Scale = interpolate(
    frame,
    [number12Delay, number12Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const number12Opacity = interpolate(
    frame,
    [number12Delay, number12Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ship_japan popUp (delay 1.5, duration 0.5)
  const shipJapanDelay = secondsToFrames(1.5);
  const shipJapanScale = interpolate(
    frame,
    [shipJapanDelay, shipJapanDelay + secondsToFrames(0.5)],
    [0, 0.18],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const shipJapanOpacity = interpolate(
    frame,
    [shipJapanDelay, shipJapanDelay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // number_133 popUp (delay 1.7, duration 0.5)
  const number133Delay = secondsToFrames(1.7);
  const number133Scale = interpolate(
    frame,
    [number133Delay, number133Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const number133Opacity = interpolate(
    frame,
    [number133Delay, number133Delay + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Step 2: time_range [2.5, 5.0] - "이 말도 안 되는 숫자 앞에서"
  const step2Start = secondsToFrames(2.5);

  // vs_symbol fadeIn (delay 0)
  const vsOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // shake effect for numbers (delay 0.5, duration 0.4)
  const shakeStart = step2Start + secondsToFrames(0.5);
  const shakeEnd = shakeStart + secondsToFrames(0.4);
  const shakeIntensity = 8;
  const shakeOffset = frame >= shakeStart && frame <= shakeEnd
    ? Math.sin((frame - shakeStart) * 0.5) * shakeIntensity
    : 0;

  // Step 3: time_range [5.0, 7.5] - "한 남자는 도망치지 않았습니다"
  const step3Start = secondsToFrames(5.0);

  // yi_silhouette fadeIn + move
  const yiSilhouetteOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const yiSilhouetteY = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.8)],
    [200, 150],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 4: time_range [7.5, 9.28] - "그는 대체 무엇을 믿고 있었던 걸까요"
  const step4Start = secondsToFrames(7.5);

  // question_mark popUp + pulse
  const questionScale = interpolate(
    frame,
    [step4Start, step4Start + secondsToFrames(0.5)],
    [0, 0.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const questionOpacity = interpolate(
    frame,
    [step4Start, step4Start + secondsToFrames(0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse effect (delay 0.6, duration 0.8)
  const pulseStart = step4Start + secondsToFrames(0.6);
  const pulseProgress = frame >= pulseStart
    ? Math.sin(((frame - pulseStart) / secondsToFrames(0.8)) * Math.PI) * 0.02
    : 0;
  const finalQuestionScale = questionScale + (questionScale > 0 ? pulseProgress : 0);

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
          filter: "sepia(0.4) contrast(1.1) brightness(0.95)",
          zIndex: -100,
        }}
      />

      {/* Ship Joseon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-400}px), calc(-50% + ${50}px)) scale(${shipJoseonScale})`,
          opacity: shipJoseonOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_joseon.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3)",
          }}
        />
      </div>

      {/* Number 12 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-400 + shakeOffset}px), calc(-50% + ${-50}px)) scale(${number12Scale})`,
          opacity: number12Opacity,
          fontSize: 140,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 100,
        }}
      >
        12
      </div>

      {/* Ship Japan */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${400}px), calc(-50% + ${50}px)) scale(${shipJapanScale})`,
          opacity: shipJapanOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/ship_icon_japan.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3)",
          }}
        />
      </div>

      {/* Number 133 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${400 + shakeOffset}px), calc(-50% + ${-50}px)) scale(${number133Scale})`,
          opacity: number133Opacity,
          fontSize: 140,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#1a1a1a",
          textShadow: "4px 4px 0 #4a4a4a",
          WebkitTextStroke: "4px #4a4a4a",
          zIndex: 100,
        }}
      >
        133
      </div>

      {/* VS Symbol */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-50}px)) scale(0.15)`,
          opacity: vsOpacity,
          zIndex: 75,
        }}
      >
        <Img
          src={staticFile("assets/icons/vs_symbol.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4)",
          }}
        />
      </div>

      {/* Yi Sun-sin Silhouette */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${yiSilhouetteY}px)) scale(0.3)`,
          opacity: yiSilhouetteOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/portraits/yi_sun_sin_silhouette.png")}
          style={{
            width: 768,
            height: 1344,
            filter: "sepia(0.5) brightness(0.3)",
          }}
        />
      </div>

      {/* Question Mark */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-250}px)) scale(${finalQuestionScale})`,
          opacity: questionOpacity,
          zIndex: 200,
        }}
      >
        <Img
          src={staticFile("assets/icons/question_mark_antique.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default S1;
