import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fadeIn } from "../lib/animations";
import { FONTS, COLORS, FONT_SIZES } from "../lib/styles";

interface HistoryTextProps {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  startFrame?: number;
  fadeInDuration?: number;
  zIndex?: number;
}

/**
 * 역사 콘텐츠용 텍스트 컴포넌트
 * - 한글 폰트 기본 적용
 * - FadeIn 애니메이션 내장
 * - 그림자 효과
 */
export const HistoryText: React.FC<HistoryTextProps> = ({
  text,
  x = 0,
  y = 0,
  fontSize = FONT_SIZES.body,
  color = COLORS.antique.gold,
  fontFamily = FONTS.korean.serif,
  fontWeight = 700,
  startFrame = 0,
  fadeInDuration = 15,
  zIndex = 100,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, startFrame, fadeInDuration);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        fontSize,
        fontFamily,
        fontWeight,
        color,
        opacity,
        zIndex,
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export default HistoryText;
