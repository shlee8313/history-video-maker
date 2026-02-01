import React from "react";
import { Composition } from "remotion";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="S1"
        component={S1}
        durationInFrames={182}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="S2"
        component={S2}
        durationInFrames={280}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="S3"
        component={S3}
        durationInFrames={264}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="S4"
        component={S4}
        durationInFrames={280}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="S5"
        component={S5}
        durationInFrames={267}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="S6"
        component={S6}
        durationInFrames={204}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
