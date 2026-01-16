import React from "react";
import { Img, useCurrentFrame, staticFile } from "remotion";
import { fadeIn, scaleIn } from "../lib/animations";

interface HistoryImageProps {
  src: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  startFrame?: number;
  fadeInDuration?: number;
  scaleAnimation?: boolean;
  zIndex?: number;
  style?: React.CSSProperties;
}

/**
 * 역사 콘텐츠용 이미지 컴포넌트
 * - FadeIn 애니메이션 내장
 * - 선택적 Scale 애니메이션
 * - 그림자 효과
 */
export const HistoryImage: React.FC<HistoryImageProps> = ({
  src,
  x = 0,
  y = 0,
  width,
  height,
  startFrame = 0,
  fadeInDuration = 15,
  scaleAnimation = false,
  zIndex = 50,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, startFrame, fadeInDuration);
  const scale = scaleAnimation
    ? scaleIn(frame, startFrame, fadeInDuration, 0.8, 1)
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
        opacity,
        zIndex,
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: width ? `${width}px` : "auto",
          height: height ? `${height}px` : "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default HistoryImage;
