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

export const S4: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 4.0] - "일본은 백서른세 척의 대함대로..."
  const bgMapOpacity = interpolate(
    frame,
    [0, secondsToFrames(0.8)],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const pathDelay = secondsToFrames(0.8);
  const pathOpacity = interpolate(
    frame,
    [pathDelay, pathDelay + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const fleetDelay = secondsToFrames(1.5);
  const fleetOpacity = interpolate(
    frame,
    [fleetDelay, fleetDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const countDelay = secondsToFrames(2.0);
  const fleetCountOpacity = interpolate(
    frame,
    [countDelay, countDelay + secondsToFrames(0.6)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [4.0, 7.5] - "누가 봐도 전쟁은 끝난 것처럼..."
  const step2Start = secondsToFrames(4.0);
  const pulseCycle = secondsToFrames(1.0);
  const pulseScale = frame >= step2Start
    ? 1 + Math.sin(((frame - step2Start) / pulseCycle) * Math.PI * 2) * 0.05
    : 1;

  // Step 3: time_range [7.5, 12.0] - "조정에서는 수군을 폐지하고..."
  const step3Start = secondsToFrames(7.5);
  const decreeOpacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.8)],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 4: time_range [12.0, 18.8] - "그러나 이순신은 한 마디로..."
  const step4Start = secondsToFrames(12.0);

  const quoteDelay = step4Start + secondsToFrames(0.5);
  const quoteOpacity = interpolate(
    frame,
    [quoteDelay, quoteDelay + secondsToFrames(1.2)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const portraitDelay = step4Start + secondsToFrames(1.5);
  const portraitOpacity = interpolate(
    frame,
    [portraitDelay, portraitDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Quote pulse
  const quotePulseStart = step4Start + secondsToFrames(2.5);
  const quotePulseScale = frame >= quotePulseStart
    ? 1 + Math.sin(((frame - quotePulseStart) / secondsToFrames(1.5)) * Math.PI) * 0.025
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background Map */}
      <Img
        src={staticFile("assets/maps/joseon_peninsula_west_sea.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: bgMapOpacity,
          filter: "sepia(0.5) contrast(1.1) brightness(0.9)",
          zIndex: -100,
        }}
      />

      {/* Japanese Fleet Path (Arrow North) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-200}px), calc(-50% + ${100}px)) scale(0.25)`,
          opacity: pathOpacity,
          zIndex: 30,
        }}
      >
        <Img
          src={staticFile("assets/icons/arrow_north.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.3) hue-rotate(340deg)",
          }}
        />
      </div>

      {/* Japanese Fleet Icon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-200}px), calc(-50% + ${200}px)) scale(0.2)`,
          opacity: fleetOpacity,
          zIndex: 50,
        }}
      >
        <Img
          src={staticFile("assets/icons/japanese_fleet_shadow.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) brightness(0.7)",
          }}
        />
      </div>

      {/* Fleet Count */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${-200}px), calc(-50% + ${330}px)) scale(${pulseScale})`,
          opacity: fleetCountOpacity,
          fontSize: 70,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#2a2a2a",
          textShadow: "3px 3px 0 #d4443f",
          WebkitTextStroke: "3px #d4443f",
          zIndex: 100,
        }}
      >
        133척
      </div>

      {/* Decree Background Overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1208",
          opacity: decreeOpacity,
          zIndex: 60,
        }}
      />

      {/* Famous Quote */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${-50}px)) scale(${quotePulseScale})`,
          opacity: quoteOpacity,
          fontSize: 90,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textAlign: "center",
          lineHeight: 1.4,
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 150,
          whiteSpace: "pre-line",
        }}
      >
        {`신에게는 아직\n열두 척의 배가\n있사옵니다`}
      </div>

      {/* Yi Sun-sin Portrait (Small) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${600}px), calc(-50% + ${200}px)) scale(0.35)`,
          opacity: portraitOpacity,
          zIndex: 120,
        }}
      >
        <Img
          src={staticFile("assets/portraits/lee_sunsin_portrait.png")}
          style={{
            width: 1024,
            height: 1024,
            filter: "sepia(0.4) contrast(1.1)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default S4;
