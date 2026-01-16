import React from "react";
import { useCurrentFrame } from "remotion";
import { cameraZoom, cameraPan } from "../lib/animations";

interface CameraMove {
  startFrame: number;
  durationFrames: number;
  fromScale?: number;
  toScale?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
}

interface CameraContainerProps {
  children: React.ReactNode;
  moves?: CameraMove[];
  initialScale?: number;
  initialX?: number;
  initialY?: number;
}

/**
 * 카메라 컨테이너 컴포넌트
 * - 줌/팬 애니메이션을 자식 요소에 적용
 * - 여러 카메라 무브를 순차적으로 처리
 */
export const CameraContainer: React.FC<CameraContainerProps> = ({
  children,
  moves = [],
  initialScale = 1,
  initialX = 0,
  initialY = 0,
}) => {
  const frame = useCurrentFrame();

  // 현재 프레임에서의 카메라 상태 계산
  let currentScale = initialScale;
  let currentX = initialX;
  let currentY = initialY;

  for (const move of moves) {
    const {
      startFrame,
      durationFrames,
      fromScale = currentScale,
      toScale = currentScale,
      fromX = currentX,
      toX = currentX,
      fromY = currentY,
      toY = currentY,
    } = move;

    if (frame >= startFrame) {
      if (fromScale !== toScale) {
        currentScale = cameraZoom(frame, startFrame, durationFrames, fromScale, toScale);
      }
      if (fromX !== toX || fromY !== toY) {
        const pos = cameraPan(frame, startFrame, durationFrames, fromX, toX, fromY, toY);
        currentX = pos.x;
        currentY = pos.y;
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

export default CameraContainer;
