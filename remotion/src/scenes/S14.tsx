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

export const S14: React.FC = () => {
  const frame = useCurrentFrame();

  // Step 1: time_range [0, 3.5] - "죽고자 하면 살고, 살고자 하면 죽는다"
  const bgAerialOpacity = interpolate(
    frame,
    [0, secondsToFrames(1.0)],
    [0, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const vignetteDelay = secondsToFrames(0.5);
  const vignetteOpacity = interpolate(
    frame,
    [vignetteDelay, vignetteDelay + secondsToFrames(1.0)],
    [0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const quoteDelay = secondsToFrames(1.0);
  const quoteOpacity = interpolate(
    frame,
    [quoteDelay, quoteDelay + secondsToFrames(1.2)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const quoteY = interpolate(
    frame,
    [quoteDelay, quoteDelay + secondsToFrames(1.2)],
    [-200, -150],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 2: time_range [3.5, 6.0] - "명량에서 그는 이 말을 증명했습니다"
  const step2Start = secondsToFrames(3.5);

  // Underline (simulated with SVG)
  const underlineProgress = interpolate(
    frame,
    [step2Start, step2Start + secondsToFrames(1.0)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear }
  );

  const verifyDelay = step2Start + secondsToFrames(0.8);
  const verifyOpacity = interpolate(
    frame,
    [verifyDelay, verifyDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 3: time_range [6.0, 9.0] - "역사는 때때로 불가능을 기록합니다"
  const step3Start = secondsToFrames(6.0);

  const final1Opacity = interpolate(
    frame,
    [step3Start, step3Start + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const final2Delay = step3Start + secondsToFrames(0.6);
  const final2Opacity = interpolate(
    frame,
    [final2Delay, final2Delay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Step 4: time_range [9.0, 12.12] - "그리고 그 중심에는..."
  const step4Start = secondsToFrames(9.0);

  const keywordDelay = step4Start + secondsToFrames(0.3);
  const keywordScale = interpolate(
    frame,
    [keywordDelay, keywordDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );
  const keywordOpacity = interpolate(
    frame,
    [keywordDelay, keywordDelay + secondsToFrames(0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse for keyword
  const keywordPulseStart = step4Start + secondsToFrames(1.2);
  const keywordPulseScale = frame >= keywordPulseStart
    ? 1 + Math.sin(((frame - keywordPulseStart) / secondsToFrames(1.5)) * Math.PI) * 0.04
    : 1;

  // FadeOut for background
  const fadeOutStart = step4Start + secondsToFrames(1.5);
  const bgFadeOut = interpolate(
    frame,
    [fadeOutStart, fadeOutStart + secondsToFrames(1.5)],
    [0.4, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
  );
  const finalBgOpacity = frame >= fadeOutStart ? bgFadeOut : bgAerialOpacity;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0604" }}>
      {/* Background Aerial */}
      <Img
        src={staticFile("assets/maps/uldolmok_strait.png")}
        style={{
          position: "absolute",
          width: "143%",
          height: "143%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: finalBgOpacity,
          filter: "sepia(0.5) blur(1px) brightness(0.8)",
          zIndex: -100,
        }}
      />

      {/* Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0604",
          opacity: vignetteOpacity,
          zIndex: -50,
        }}
      />

      {/* Famous Quote Main */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${quoteY}px))`,
          opacity: quoteOpacity,
          fontSize: 100,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4af37",
          textAlign: "center",
          lineHeight: 1.5,
          textShadow: "5px 5px 0 #2a1810",
          WebkitTextStroke: "5px #2a1810",
          whiteSpace: "pre-line",
          zIndex: 200,
        }}
      >
        {`죽고자 하면 살고,\n살고자 하면 죽는다`}
      </div>

      {/* Quote Underline (SVG) */}
      <svg
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% + 50px))",
          width: 900,
          height: 10,
          zIndex: 180,
        }}
      >
        <line
          x1={0}
          y1={5}
          x2={900}
          y2={5}
          stroke="#d4af37"
          strokeWidth={4}
          strokeDasharray={900}
          strokeDashoffset={900 * (1 - underlineProgress)}
        />
      </svg>

      {/* Verification Text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${150}px))`,
          opacity: verifyOpacity,
          fontSize: 60,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#e8d5b7",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        명량에서 그는 이 말을 증명했습니다
      </div>

      {/* Final Message 1 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${300}px))`,
          opacity: final1Opacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#c9b896",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        역사는 때때로 불가능을 기록합니다
      </div>

      {/* Final Message 2 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${380}px))`,
          opacity: final2Opacity,
          fontSize: 65,
          fontFamily: FONTS.korean.serif,
          fontWeight: "normal",
          color: "#c9b896",
          textShadow: "2px 2px 0 #2a1810",
          WebkitTextStroke: "2px #2a1810",
          zIndex: 200,
        }}
      >
        그 중심에는 언제나
      </div>

      {/* Final Keyword */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${460}px)) scale(${keywordScale * keywordPulseScale})`,
          opacity: keywordOpacity,
          fontSize: 85,
          fontFamily: FONTS.korean.serif,
          fontWeight: "bold",
          color: "#d4443f",
          textShadow: "4px 4px 0 #2a1810",
          WebkitTextStroke: "4px #2a1810",
          zIndex: 200,
        }}
      >
        한 사람의 선택
      </div>
    </AbsoluteFill>
  );
};

export default S14;
