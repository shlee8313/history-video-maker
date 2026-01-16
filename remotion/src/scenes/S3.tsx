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

export const S3: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.5] - "이순신은 삼도수군통제사에서 파직되어..."
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const portraitDelay = secondsToFrames(0.5);
  const portraitOpacity = interpolate(
    frame,
    [portraitDelay, portraitDelay + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const baekuiDelay = secondsToFrames(1.5);
  const baekuiOpacity = interpolate(
    frame,
    [baekuiDelay, baekuiDelay + secondsToFrames(0.7)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const baekuiSubDelay = secondsToFrames(2.0);
  const baekuiSubOpacity = interpolate(
    frame,
    [baekuiSubDelay, baekuiSubDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.5, 6.5] - "조정은 그를 다시 부를 수밖에..."
  const step2Start = secondsToFrames(3.5);
  const shipRowBgOpacity = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(0.8)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 3: time_range [6.5, 11.52] - "하지만 그가 돌아왔을 때..."
  const step3Start = secondsToFrames(6.5);

  // 12 ships appearing sequentially
  const shipDelays = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.35, 1.5, 1.65];
  const shipPositions = [-660, -550, -440, -330, -220, -110, 0, 110, 220, 330, 440, 550];

  const getShipOpacity = (index: number) => {
    const delay = step3Start + secondsToFrames(shipDelays[index]);
    return interpolate(
      frame,
      [delay, delay + secondsToFrames(0.3)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
    );
  };

  // Ship count label popUp
  const countDelay = step3Start + secondsToFrames(2.2);
  const countScale = interpolate(
    frame,
    [countDelay, countDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const countOpacity = interpolate(
    frame,
    [countDelay, countDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map */}
      <Img
        src={staticFile("assets/maps/joseon_peninsula_1597.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.5) contrast(1.0) brightness(0.9)",
          zIndex: -100,
        }}
      />

      {/* Yi Sun-sin Portrait */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(0.35)",
          opacity: portraitOpacity,
          zIndex: 100,
        }}
      >
        <Img
          src={staticFile("assets/portraits/yi_sun_sin_portrait.png")}
          style={{
            width: 1696,
            height: 2528,
            filter: "sepia(0.4) contrast(1.15)",
          }}
        />
      </div>

      {/* Baekui Title (Korean) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-550}px), calc(-50% + ${80}px))`,
          opacity: baekuiOpacity,
          fontSize: 72,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#e8d5b7",
          textShadow: "3px 3px 0 #2a1810",
          WebkitTextStroke: "3px #2a1810",
          zIndex: 150,
        }}
      >
        白衣從軍
      </div>

      {/* Baekui Subtitle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-550}px), calc(-50% + ${150}px))`,
          opacity: baekuiSubOpacity,
          fontSize: 40,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#c9b896",
          zIndex: 150,
        }}
      >
        백의종군
      </div>

      {/* Ship Row Background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${400}px))`,
          width: 1600,
          height: 180,
          backgroundColor: "#1a1208",
          opacity: shipRowBgOpacity,
          zIndex: 20,
        }}
      />

      {/* 12 Ships */}
      {shipPositions.map((x, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${400}px)) scale(0.08)`,
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

      {/* Ship Count Label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${320}px)) scale(${countScale})`,
          opacity: countOpacity,
          fontSize: 90,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 100,
        }}
      >
        12척
      </div>
    </AbsoluteFill>
  );
};

export default S3;
