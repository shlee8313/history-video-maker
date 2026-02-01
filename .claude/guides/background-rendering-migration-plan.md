# 배경 포함 렌더링 전환 작업계획서

> **적용 범위**: 새 프로젝트부터 적용 (기존 프로젝트 수정하지 않음)
> **목적**: 투명 렌더링 + FFmpeg 합성 대신, Remotion에서 배경을 직접 포함하여 렌더링
> **장점**: FFmpeg 합성 단계 생략, 파이프라인 단순화

---

## 1. 워크플로우 비교

### 1.1 기존 워크플로우 (투명 렌더링 + FFmpeg 합성)
```
Phase 5-0a: 에셋 동기화 (backgrounds 제외)
Phase 5-1: Remotion 투명 렌더링 → 5_renders/s{n}_raw.webm
Phase 5-2: FFmpeg 배경 합성 → 6_scenes/s{n}.mp4
Phase 5-3: 섹션 합성
Phase 6: 최종 병합
```

### 1.2 새 워크플로우 (배경 포함 렌더링)
```
Phase 5-0a: 에셋 동기화 (backgrounds 포함!) ← 변경점
Phase 5-1: Remotion 배경 포함 렌더링 → 6_scenes/s{n}.mp4 (직접!)
Phase 5-2: (생략)
Phase 5-3: 섹션 합성
Phase 6: 최종 병합
```

---

## 2. 수정 대상 파일

### 2.1 CLAUDE.md 수정 필요
**위치**: Step 5-0a 에셋 동기화 섹션

**기존 (배경 이미지 미포함):**
```bash
# 에셋 동기화 (assets/ → remotion/public/assets/)
cp assets/icons/*.png remotion/public/assets/icons/
cp assets/maps/*.png remotion/public/assets/maps/
cp assets/portraits/*.png remotion/public/assets/portraits/
cp assets/artifacts/*.png remotion/public/assets/artifacts/
mkdir -p remotion/public/assets/images && cp assets/images/*.png remotion/public/assets/images/
rm -rf remotion/node_modules/.cache
# 참고: 배경(3_backgrounds)은 FFmpeg 합성에서 사용, Remotion에선 투명배경이 정상!
```

**변경 후 (배경 이미지 포함):**
```bash
# 에셋 동기화 (assets/ + output/3_backgrounds/ → remotion/public/assets/)
cp assets/icons/*.png remotion/public/assets/icons/
cp assets/maps/*.png remotion/public/assets/maps/
cp assets/portraits/*.png remotion/public/assets/portraits/
cp assets/artifacts/*.png remotion/public/assets/artifacts/
mkdir -p remotion/public/assets/images && cp assets/images/*.png remotion/public/assets/images/

# ★ 배경 이미지 동기화 (배경 포함 렌더링 모드)
mkdir -p remotion/public/assets/backgrounds
cp output/3_backgrounds/bg_s*.png remotion/public/assets/backgrounds/

rm -rf remotion/node_modules/.cache
```

### 2.2 scene-coder 에이전트 수정 필요
**위치**: `.claude/agents/scene-coder.md`

**변경 사항**:
- 씬 컴포넌트 템플릿에 배경 이미지 레이어 추가
- `backgroundColor: "transparent"` 대신 배경 이미지 사용
- Ken Burns 효과 (cameraZoom) 적용

### 2.3 pipeline.py 수정 필요
**변경 사항**:
- `render` 명령어: 배경 포함 모드 옵션 추가
- 렌더링 옵션: `--codec h264 --image-format jpeg --crf 18`
- 출력 경로: `6_scenes/` 직접 출력

---

## 3. 에셋 동기화 스크립트 (참고용)

### 3.1 기존 동기화 (배경 미포함)
```bash
#!/bin/bash
# sync_assets.sh (기존 버전)

# 에셋 폴더 동기화
cp assets/icons/*.png remotion/public/assets/icons/ 2>/dev/null
cp assets/maps/*.png remotion/public/assets/maps/ 2>/dev/null
cp assets/portraits/*.png remotion/public/assets/portraits/ 2>/dev/null
cp assets/artifacts/*.png remotion/public/assets/artifacts/ 2>/dev/null
mkdir -p remotion/public/assets/images
cp assets/images/*.png remotion/public/assets/images/ 2>/dev/null

# 캐시 삭제
rm -rf remotion/node_modules/.cache

echo "에셋 동기화 완료 (배경 제외)"
```

### 3.2 새 동기화 (배경 포함)
```bash
#!/bin/bash
# sync_assets_with_bg.sh (새 버전)

# 에셋 폴더 동기화
cp assets/icons/*.png remotion/public/assets/icons/ 2>/dev/null
cp assets/maps/*.png remotion/public/assets/maps/ 2>/dev/null
cp assets/portraits/*.png remotion/public/assets/portraits/ 2>/dev/null
cp assets/artifacts/*.png remotion/public/assets/artifacts/ 2>/dev/null
mkdir -p remotion/public/assets/images
cp assets/images/*.png remotion/public/assets/images/ 2>/dev/null

# ★ 배경 이미지 동기화 (새로 추가)
mkdir -p remotion/public/assets/backgrounds
cp output/3_backgrounds/bg_s*.png remotion/public/assets/backgrounds/ 2>/dev/null
BG_COUNT=$(ls -1 remotion/public/assets/backgrounds/bg_s*.png 2>/dev/null | wc -l)
echo "배경 이미지 ${BG_COUNT}개 동기화 완료"

# 캐시 삭제
rm -rf remotion/node_modules/.cache

echo "에셋 동기화 완료 (배경 포함)"
```

---

## 4. 씬 컴포넌트 템플릿 (배경 포함 버전)

새 프로젝트의 scene-coder가 사용할 템플릿:

```tsx
// remotion/src/scenes/S{n}.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  TEXT_STROKE,
  COLORS,
  Z_INDEX,
} from "../lib/styles";
import { fadeIn, cameraZoom } from "../lib/animations";

// Scene S{n}: {섹션명} - {씬 설명}
// Duration: {duration} seconds

const captions = [
  { text: "자막 1", start: 0.0, end: 2.0 },
  { text: "자막 2", start: 2.5, end: 5.0 },
  // ...
];

export const S{n}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (cap) => currentTime >= cap.start && currentTime < cap.end
  );

  // ========================================
  // 배경 애니메이션 (Ken Burns 효과)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================
  const iconOpacity = fadeIn(frame, 0, 15);
  // ...

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s{n}.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale})`,
            transformOrigin: "center center",
          }}
        />
        {/* 다크 오버레이 (가독성 향상, 선택사항) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.2)",
          }}
        />
      </AbsoluteFill>

      {/* ========================================
          Layer 1: 콘텐츠 요소
          ======================================== */}
      {/* 아이콘, 텍스트, 이미지 등 */}

      {/* ========================================
          Layer 2: 자막 (최상단)
          ======================================== */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: CAPTION_STYLE.bottom,
            left: 0,
            right: 0,
            textAlign: "center",
            padding: CAPTION_STYLE.padding,
            zIndex: Z_INDEX.caption,
          }}
        >
          <span
            style={{
              fontSize: CAPTION_STYLE.fontSize,
              fontFamily: CAPTION_STYLE.fontFamily,
              fontWeight: CAPTION_STYLE.fontWeight,
              color: CAPTION_STYLE.color,
              textShadow: CAPTION_STROKE,
            }}
          >
            {currentCaption.text}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default S{n};
```

---

## 5. 렌더링 명령어

### 5.1 배경 포함 렌더링 (새 방식)
```bash
# 단일 씬
cd remotion
npx remotion render S1 ../output/6_scenes/s1.mp4 --codec h264 --image-format jpeg --crf 18

# 전체 씬 (pipeline.py 사용)
python pipeline.py render --with-background
```

### 5.2 투명 렌더링 (기존 방식, 호환용)
```bash
# 단일 씬
cd remotion
npx remotion render S1 ../output/5_renders/s1_raw.webm --codec vp9 --image-format png --pixel-format yuva420p

# 전체 씬 (pipeline.py 사용)
python pipeline.py render --transparent
python pipeline.py composite  # FFmpeg 배경 합성
```

---

## 6. 체크리스트

### 새 프로젝트 시작 시
- [ ] scene-coder 에이전트가 배경 포함 템플릿 사용
- [ ] Phase 5-0a에서 배경 이미지 동기화 포함
- [ ] 렌더링 시 `--with-background` 옵션 사용 (또는 기본값)

### 에셋 동기화 확인
- [ ] `remotion/public/assets/icons/` 존재
- [ ] `remotion/public/assets/maps/` 존재
- [ ] `remotion/public/assets/portraits/` 존재
- [ ] `remotion/public/assets/artifacts/` 존재
- [ ] `remotion/public/assets/images/` 존재
- [ ] **`remotion/public/assets/backgrounds/`** 존재 (새로 추가!)

### 렌더링 후 확인
- [ ] `output/6_scenes/s*.mp4` 파일 생성
- [ ] 배경이 정상적으로 포함됨
- [ ] 자막 가독성 양호

---

## 7. 예상 효과

| 항목 | 기존 (투명 + FFmpeg) | 변경 후 (배경 포함) |
|------|---------------------|-------------------|
| 렌더링 단계 | 2단계 | 1단계 |
| 중간 파일 | WebM + MP4 | MP4만 |
| 디스크 사용량 | ~2x | ~1x |
| 파이프라인 복잡도 | 높음 | 낮음 |
| FFmpeg 의존성 | 필수 | 최종 병합만 |

---

## 8. 참고 문서

- `background-included-rendering.md`: 배경 포함 렌더링 상세 가이드
- `remotion/src/scenes/S5_test.tsx`: 배경 포함 씬 예시
- `test_render.py`: 테스트 렌더링 스크립트
