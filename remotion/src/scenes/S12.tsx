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

export const S12: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.5] - "그리고 무엇보다 자신이 먼저 움직였습니다"
  const bgShipsOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.9)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const titleDelay = secondsToFrames(0.6);
  const titleOpacity = interpolate(
    frame,
    [titleDelay, titleDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const silhouetteDelay = secondsToFrames(1.0);
  const silhouetteOpacity = interpolate(
    frame,
    [silhouetteDelay, silhouetteDelay + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.5, 8.0] - "부하들이 따라오지 않을 때..."
  const step2Start = secondsToFrames(3.5);

  const arrowOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const eyeDelay = step2Start + secondsToFrames(0.4);
  const eyeOpacity = interpolate(
    frame,
    [eyeDelay, eyeDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const panelDelay = step2Start + secondsToFrames(1.0);
  const panelOpacity = interpolate(
    frame,
    [panelDelay, panelDelay + secondsToFrames(0.7)],
    [0, 0.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const line1Delay = step2Start + secondsToFrames(1.5);
  const line1Opacity = interpolate(
    frame,
    [line1Delay, line1Delay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 3: time_range [8.0, 14.24] - "공포에 질린 군대를 이끄는 방법은..."
  const step3Start = secondsToFrames(8.0);

  const line2Delay = step3Start + secondsToFrames(0.5);
  const line2Opacity = interpolate(
    frame,
    [line2Delay, line2Delay + secondsToFrames(0.9)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulse for silhouette
  const silhouettePulseStart = step3Start + secondsToFrames(2.0);
  const silhouetteScale = frame >= silhouettePulseStart
    ? 0.5 + Math.sin(((frame - silhouettePulseStart) / secondsToFrames(1.5)) * Math.PI) * 0.015
    : 0.5;

  // Pulse for line2
  const line2PulseStart = step3Start + secondsToFrames(2.5);
  const line2Scale = frame >= line2PulseStart
    ? 1 + Math.sin(((frame - line2PulseStart) / secondsToFrames(1.2)) * Math.PI) * 0.025
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Ships */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1.2)",
          opacity: bgShipsOpacity,
          zIndex: -100,
        }}
      >
        <Img
          src={staticFile("assets/backgrounds/joseon_ships_following.png")}
          style={{
            width: 1344,
            height: 768,
            filter: "sepia(0.5) contrast(1.15) brightness(0.9)",
          }}
        />
      </div>

      {/* Flagship Silhouette */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-50}px)) scale(${silhouetteScale})`,
          opacity: silhouetteOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/portraits/joseon_panokseon_silhouette.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.5) brightness(0.4) contrast(1.3)",
          }}
        />
      </div>

      {/* Title Action */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-400}px))`,
          opacity: titleOpacity,
          fontSize: 85,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 200,
        }}
      >
        행동으로 보여준 리더
      </div>

      {/* Arrow Leading */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-600}px), calc(-50% + ${-50}px)) scale(0.12)`,
          opacity: arrowOpacity,
          zIndex: 70,
        }}
      >
        <Img
          src={staticFile("assets/icons/arrow_forward.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) hue-rotate(40deg) brightness(1.2)",
          }}
        />
      </div>

      {/* Eye Icon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${600}px), calc(-50% + ${-50}px)) scale(0.12)`,
          opacity: eyeOpacity,
          zIndex: 70,
        }}
      >
        <Img
          src={staticFile("assets/icons/eye_icon.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(1.1)",
          }}
        />
      </div>

      {/* Insight Panel */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${350}px))`,
          width: 1600,
          height: 200,
          backgroundColor: "#1a1208",
          opacity: panelOpacity,
          zIndex: 80,
        }}
      />

      {/* Insight Line 1 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${310}px))`,
          opacity: line1Opacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 150,
        }}
      >
        명령 대신 행동으로
      </div>

      {/* Insight Line 2 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${395}px)) scale(${line2Scale})`,
          opacity: line2Opacity,
          fontSize: 70,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 150,
        }}
      >
        지휘관이 가장 위험한 곳에 서다
      </div>
    </AbsoluteFill>
  );
};

export default S12;
