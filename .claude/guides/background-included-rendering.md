# 배경 이미지 포함 렌더링 가이드

> **목적**: 투명 렌더링 + FFmpeg 합성 대신, Remotion에서 배경을 직접 포함하여 렌더링
> **장점**: FFmpeg 합성 단계 생략, 파이프라인 단순화

---

## 테스트 결과 요약

| 항목 | 값 |
|------|-----|
| 테스트 씬 | S5 (13.3초, 399프레임) |
| 렌더링 시간 | **22.3초** (프레임 렌더링만) |
| 출력 파일 | `test/s5_with_bg.mp4` |
| 파일 크기 | 17.43 MB |
| 해상도 | 1920x1080 |

---

## 핵심 변경사항

### 1. 배경 레이어 추가

**기존 (투명 배경):**
```tsx
<AbsoluteFill style={{ backgroundColor: "transparent" }}>
  {/* 콘텐츠만 */}
</AbsoluteFill>
```

**변경 (배경 포함):**
```tsx
<AbsoluteFill>
  {/* 배경 이미지 레이어 - 최하단 */}
  <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
    <Img
      src={staticFile("assets/backgrounds/bg_s{n}.png")}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${bgScale})`,  // Ken Burns 효과
        transformOrigin: "center center",
      }}
    />
    {/* 다크 오버레이 (선택) */}
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0, 0, 0, 0.2)",
      }}
    />
  </AbsoluteFill>

  {/* 기존 콘텐츠 */}
  {/* ... */}
</AbsoluteFill>
```

### 2. Ken Burns 효과 (배경 애니메이션)

```tsx
// 배경 천천히 줌인 (씬 전체 길이)
const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// 또는 animations.ts 사용
import { cameraZoom } from "../lib/animations";
const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);
```

### 3. 렌더링 설정 변경

**기존 (투명):**
```bash
npx remotion render S1 output.webm --codec vp8 --image-format png
```

**변경 (불투명):**
```bash
npx remotion render S1 output.mp4 --codec h264 --image-format jpeg --crf 18
```

| 설정 | 투명 렌더링 | 배경 포함 렌더링 |
|------|------------|-----------------|
| codec | vp8/prores | h264 |
| image-format | png | jpeg |
| 파일 형식 | .webm/.mov | .mp4 |

---

## 배경 이미지 경로 규칙

### 원본 위치
```
output/3_backgrounds/bg_s{n}.png
```

### Remotion 위치 (복사 필요!)
```
remotion/public/assets/backgrounds/bg_s{n}.png
```

### 코드에서 참조
```tsx
staticFile("assets/backgrounds/bg_s1.png")
staticFile("assets/backgrounds/bg_s2.png")
// ...
```

---

## 씬 컴포넌트 템플릿 (배경 포함 버전)

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
          Layer 1: 배경 이미지 (최하단)
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
          Layer 2: 콘텐츠 요소
          ======================================== */}
      {/* 아이콘, 텍스트, 이미지 등 */}
      <Img
        src={staticFile("assets/icons/example.png")}
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: IMAGE_SIZES.icon,
          opacity: iconOpacity,
          zIndex: Z_INDEX.midground,
        }}
      />

      {/* ========================================
          Layer 3: 자막 (최상단)
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

## 레이어 구조 (Z-Index)

```
┌─────────────────────────────────────────┐
│  Layer 3: 자막 (Z_INDEX.caption: 1000)  │  ← 최상단
├─────────────────────────────────────────┤
│  Layer 2: 콘텐츠 (Z_INDEX.foreground~)  │  ← 아이콘, 텍스트 등
├─────────────────────────────────────────┤
│  Layer 1: 배경 (Z_INDEX.background)     │  ← 최하단
└─────────────────────────────────────────┘
```

**Z_INDEX 값 (styles.ts):**
```tsx
export const Z_INDEX = {
  background: -100,  // 배경 이미지
  midground: 0,      // 일반 콘텐츠
  foreground: 100,   // 강조 콘텐츠
  ui: 200,           // UI 요소
  overlay: 300,      // 오버레이
  caption: 1000,     // 자막 (항상 최상단)
};
```

---

## 필수 Import 목록

```tsx
// Remotion
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";

// styles.ts (필수!)
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  TEXT_STROKE,
  COLORS,
  Z_INDEX,
} from "../lib/styles";

// animations.ts (권장!)
import {
  fadeIn,
  fadeOut,
  slideInLeft,
  slideInRight,
  scaleIn,
  cameraZoom,
  cameraPan,
  pulse,
} from "../lib/animations";
```

---

## 배경별 오버레이 가이드

| 배경 밝기 | 오버레이 | 텍스트 색상 |
|----------|---------|------------|
| 밝은 배경 | `rgba(0,0,0,0.3~0.4)` | 흰색 + TEXT_STROKE |
| 어두운 배경 | `rgba(0,0,0,0.1~0.2)` 또는 없음 | 흰색 + TEXT_STROKE |
| 중간 배경 | `rgba(0,0,0,0.2)` | 흰색 + TEXT_STROKE |

**자막은 항상:**
- 색상: `#000000` (검정)
- 테두리: `CAPTION_STROKE` (흰색 테두리)

---

## 작업 순서

### Phase 4 변경 (scene-coder 에이전트)

1. **배경 이미지 복사** (렌더링 전 필수!)
   ```bash
   cp output/3_backgrounds/bg_s*.png remotion/public/assets/backgrounds/
   ```

2. **씬 코드 작성** (배경 포함 템플릿 사용)
   - 기존: `backgroundColor: "transparent"`
   - 변경: 배경 이미지 레이어 추가

3. **Remotion Studio에서 확인**
   ```bash
   cd remotion && npm run dev
   ```
   - 배경이 보이는지 확인
   - 텍스트 가독성 확인
   - 콘솔 에러 확인

### Phase 5 변경 (렌더링)

**기존 워크플로우:**
```
Step 5-1: Remotion 투명 렌더링 → 5_renders/s{n}_raw.mp4
Step 5-2: FFmpeg 배경 합성 → 6_scenes/s{n}.mp4
Step 5-3: 섹션 합성
```

**새 워크플로우:**
```
Step 5-1: Remotion 배경 포함 렌더링 → 6_scenes/s{n}.mp4 (직접!)
Step 5-2: (생략)
Step 5-3: 섹션 합성
```

---

## 렌더링 명령어

### 단일 씬 렌더링
```bash
cd remotion
npx remotion render S5 ../output/6_scenes/s5.mp4 --codec h264 --image-format jpeg --crf 18
```

### 전체 씬 렌더링 (스크립트)
```python
# 예시: 배경 포함 렌더링
for scene_id in ["S1", "S2", ..., "S48"]:
    output_path = f"output/6_scenes/s{n}.mp4"
    cmd = [
        "npx", "remotion", "render",
        scene_id, output_path,
        "--codec", "h264",
        "--image-format", "jpeg",
        "--crf", "18"
    ]
    subprocess.run(cmd, cwd="remotion")
```

---

## 체크리스트

### 코드 작성 시
- [ ] `AbsoluteFill`에서 `backgroundColor: "transparent"` 제거
- [ ] 배경 이미지 레이어 추가 (`Z_INDEX.background`)
- [ ] Ken Burns 효과 적용 (`cameraZoom` 또는 직접 `interpolate`)
- [ ] 다크 오버레이 추가 (필요시)
- [ ] `styles.ts` import 확인 (FONT_SIZES, IMAGE_SIZES 등)
- [ ] `animations.ts` import 확인 (권장)

### 렌더링 전
- [ ] 배경 이미지 복사: `output/3_backgrounds/` → `remotion/public/assets/backgrounds/`
- [ ] Remotion Studio에서 시각적 확인
- [ ] 렌더링 옵션: `--codec h264 --image-format jpeg`

### 렌더링 후
- [ ] 출력 파일 존재 확인
- [ ] 배경이 정상적으로 포함되었는지 확인
- [ ] 자막 가독성 확인

---

## 참고 파일

| 파일 | 용도 |
|------|------|
| `remotion/src/scenes/S5_test.tsx` | 배경 포함 씬 예시 |
| `remotion/src/Root_test.tsx` | 테스트용 Root |
| `test_render.py` | 테스트 렌더링 스크립트 |
| `test/s5_with_bg.mp4` | 테스트 결과물 |
| `remotion/src/lib/styles.ts` | 크기/스타일 상수 |
| `remotion/src/lib/animations.ts` | 애니메이션 유틸리티 |

---

## Composition ID 규칙

⚠️ **Remotion Composition ID에는 언더스코어(`_`) 사용 불가!**

```tsx
// 금지
<Composition id="S5_test" ... />  // Error!

// 허용
<Composition id="S5test" ... />   // OK
<Composition id="S5-test" ... />  // OK (하이픈 가능)
<Composition id="S5" ... />       // OK
```

---

## 문의사항

배경 포함 렌더링 관련 추가 질문이 있으면:
1. `test/s5_with_bg.mp4` 결과물 확인
2. `remotion/src/scenes/S5_test.tsx` 코드 참조
3. 이 가이드 문서 참조
