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

export const S9: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.0] - "다른 장수들이 두려움에..."
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const portraitDelay = secondsToFrames(0.5);
  const portraitOpacity = interpolate(
    frame,
    [portraitDelay, portraitDelay + secondsToFrames(0.9)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.0, 7.0] - "이순신은 북을 울리며 외쳤습니다"
  const step2Start = secondsToFrames(3.0);

  const quoteBgOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.7)],
    [0, 0.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const commandDelay = step2Start + secondsToFrames(0.5);
  const commandOpacity = interpolate(
    frame,
    [commandDelay, commandDelay + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Shake portrait
  const shakeStart = step2Start + secondsToFrames(1.5);
  const shakeEnd = shakeStart + secondsToFrames(0.5);
  const shakeOffset = frame >= shakeStart && frame <= shakeEnd
    ? Math.sin((frame - shakeStart) * 0.6) * 6
    : 0;

  // Step 3: time_range [7.0, 11.0] - "그제야 나머지 배들이 합류"
  const step3Start = secondsToFrames(7.0);

  const fleetAreaOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.6)],
    [0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // 11 ships joining
  const shipDelays = [0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3];
  const shipPositions = [-550, -440, -330, -220, -110, 0, 110, 220, 330, 440, 550];

  const getShipOpacity = (index: number) => {
    const delay = step3Start + secondsToFrames(shipDelays[index]);
    return interpolate(
      frame,
      [delay, delay + secondsToFrames(0.3)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
    );
  };

  // Step 4: time_range [11.0, 15.72] - "물살이 바뀌자..."
  const step4Start = secondsToFrames(11.0);

  const currentArrowOpacity = interpolate(
    frame,
    [step4Start, step4Start + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const tideDelay = step4Start + secondsToFrames(0.5);
  const tideLabelOpacity = interpolate(
    frame,
    [tideDelay, tideDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulse for current arrow
  const pulseStart = step4Start + secondsToFrames(1.2);
  const currentPulse = frame >= pulseStart
    ? 0.7 + Math.sin(((frame - pulseStart) / secondsToFrames(1.0)) * Math.PI) * 0.15
    : currentArrowOpacity;

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

      {/* Yi Portrait (Drum) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-600 + shakeOffset}px), -50%) scale(0.45)`,
          opacity: portraitOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/portraits/yi_sunsin_portrait.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) contrast(1.2)",
          }}
        />
      </div>

      {/* Quote Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${250}px), calc(-50% + ${-150}px))`,
          width: 1100,
          height: 280,
          backgroundColor: "#1a1208",
          opacity: quoteBgOpacity,
          zIndex: 80,
        }}
      />

      {/* Famous Command */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${250}px), calc(-50% + ${-150}px))`,
          opacity: commandOpacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textAlign: "center",
          lineHeight: 1.5,
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          whiteSpace: "pre-line",
          zIndex: 150,
        }}
      >
        {`항오를 어지럽히는 자는\n군법으로 다스리겠다`}
      </div>

      {/* Fleet Joining Area */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${300}px))`,
          width: 1400,
          height: 150,
          backgroundColor: "#2a4a6a",
          opacity: fleetAreaOpacity,
          zIndex: 20,
        }}
      />

      {/* 11 Ships Joining */}
      {shipPositions.map((x, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${300}px)) scale(0.08)`,
            opacity: getShipOpacity(index),
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
      ))}

      {/* Current Arrow Change */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${600}px), calc(-50% + ${80}px)) scale(0.2) rotate(180deg)`,
          opacity: frame >= pulseStart ? currentPulse : currentArrowOpacity,
          zIndex: 60,
        }}
      >
        <Img
          src={staticFile("assets/icons/current_arrow.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) hue-rotate(200deg)",
          }}
        />
      </div>

      {/* Tide Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${600}px), calc(-50% + ${180}px))`,
          opacity: tideLabelOpacity,
          fontSize: 50,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#4a9eff",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 100,
        }}
      >
        물살 변화
      </div>
    </AbsoluteFill>
  );
};

export default S9;
