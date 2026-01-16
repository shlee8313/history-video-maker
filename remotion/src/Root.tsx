import React from "react";
import { Composition } from "remotion";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";
import { S8 } from "./scenes/S8";
import { S9 } from "./scenes/S9";
import { S10 } from "./scenes/S10";
import { S11 } from "./scenes/S11";
import { S12 } from "./scenes/S12";
import { S13 } from "./scenes/S13";
import { S14 } from "./scenes/S14";

const FPS = 30;

// Duration in frames (duration in seconds * 30 FPS)
const sceneDurations = {
  S1: Math.ceil(9.28 * FPS),    // 279 frames
  S2: Math.ceil(11.2 * FPS),    // 336 frames
  S3: Math.ceil(11.52 * FPS),   // 346 frames
  S4: Math.ceil(18.8 * FPS),    // 564 frames
  S5: Math.ceil(14.16 * FPS),   // 425 frames
  S6: Math.ceil(3.32 * FPS),    // 100 frames
  S7: Math.ceil(10.16 * FPS),   // 305 frames
  S8: Math.ceil(7.28 * FPS),    // 219 frames
  S9: Math.ceil(15.72 * FPS),   // 472 frames
  S10: Math.ceil(10.84 * FPS),  // 326 frames
  S11: Math.ceil(9.48 * FPS),   // 285 frames
  S12: Math.ceil(14.24 * FPS),  // 428 frames
  S13: Math.ceil(5.38 * FPS),   // 162 frames
  S14: Math.ceil(12.12 * FPS),  // 364 frames
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="S1"
        component={S1}
        durationInFrames={sceneDurations.S1}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S2"
        component={S2}
        durationInFrames={sceneDurations.S2}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S3"
        component={S3}
        durationInFrames={sceneDurations.S3}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S4"
        component={S4}
        durationInFrames={sceneDurations.S4}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S5"
        component={S5}
        durationInFrames={sceneDurations.S5}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S6"
        component={S6}
        durationInFrames={sceneDurations.S6}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S7"
        component={S7}
        durationInFrames={sceneDurations.S7}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S8"
        component={S8}
        durationInFrames={sceneDurations.S8}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S9"
        component={S9}
        durationInFrames={sceneDurations.S9}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S10"
        component={S10}
        durationInFrames={sceneDurations.S10}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S11"
        component={S11}
        durationInFrames={sceneDurations.S11}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S12"
        component={S12}
        durationInFrames={sceneDurations.S12}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S13"
        component={S13}
        durationInFrames={sceneDurations.S13}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S14"
        component={S14}
        durationInFrames={sceneDurations.S14}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
