import { interpolate, Easing } from "remotion";

/**
 * 역사 콘텐츠용 공통 애니메이션 유틸리티
 */

// FPS 상수
export const FPS = 30;

// 초를 프레임으로 변환
export const secondsToFrames = (seconds: number): number => Math.round(seconds * FPS);

// 프레임을 초로 변환
export const framesToSeconds = (frames: number): number => frames / FPS;

/**
 * FadeIn 애니메이션
 */
export const fadeIn = (
  frame: number,
  startFrame: number,
  durationFrames: number
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * FadeOut 애니메이션
 */
export const fadeOut = (
  frame: number,
  startFrame: number,
  durationFrames: number
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
};

/**
 * SlideIn 애니메이션 (왼쪽에서)
 */
export const slideInLeft = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance: number = 200
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [-distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * SlideIn 애니메이션 (오른쪽에서)
 */
export const slideInRight = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance: number = 200
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Scale 애니메이션
 */
export const scaleIn = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  from: number = 0,
  to: number = 1
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
};

/**
 * 카메라 줌 애니메이션
 */
export const cameraZoom = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  from: number = 1,
  to: number = 1.2
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
};

/**
 * 카메라 팬 애니메이션
 */
export const cameraPan = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  fromX: number,
  toX: number,
  fromY: number,
  toY: number
): { x: number; y: number } => {
  const x = interpolate(frame, [startFrame, startFrame + durationFrames], [fromX, toX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const y = interpolate(frame, [startFrame, startFrame + durationFrames], [fromY, toY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return { x, y };
};

/**
 * 선 그리기 애니메이션 (stroke-dashoffset 방식)
 */
export const drawLine = (
  frame: number,
  startFrame: number,
  durationFrames: number
): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
};

/**
 * Pulse 애니메이션 (반복)
 */
export const pulse = (
  frame: number,
  startFrame: number,
  cycleDurationFrames: number,
  minScale: number = 1,
  maxScale: number = 1.1
): number => {
  const cycleProgress = ((frame - startFrame) % cycleDurationFrames) / cycleDurationFrames;
  const sineValue = Math.sin(cycleProgress * Math.PI * 2);
  return minScale + (maxScale - minScale) * (sineValue + 1) / 2;
};
