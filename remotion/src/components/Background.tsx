import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, staticFile } from "remotion";
import { fadeIn } from "../lib/animations";
import { COLORS } from "../lib/styles";

interface BackgroundProps {
  // 단색 배경
  color?: string;
  // 이미지 배경
  imageSrc?: string;
  // 그라데이션 오버레이
  overlay?: boolean;
  overlayOpacity?: number;
  // 애니메이션
  startFrame?: number;
  fadeInDuration?: number;
}

/**
 * 배경 컴포넌트
 * - 단색 또는 이미지 배경
 * - 선택적 어두운 오버레이
 * - FadeIn 애니메이션
 */
export const Background: React.FC<BackgroundProps> = ({
  color = COLORS.antique.background,
  imageSrc,
  overlay = false,
  overlayOpacity = 0.3,
  startFrame = 0,
  fadeInDuration = 15,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, startFrame, fadeInDuration);

  return (
    <AbsoluteFill style={{ zIndex: -100 }}>
      {/* 기본 배경색 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: color,
        }}
      />

      {/* 이미지 배경 */}
      {imageSrc && (
        <Img
          src={staticFile(imageSrc)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
          }}
        />
      )}

      {/* 어두운 오버레이 */}
      {overlay && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default Background;
