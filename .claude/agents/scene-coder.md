# Scene Coder Agent

> Remotion 코드를 생성하는 에이전트 (씬 컴포넌트)

## 역할

타이밍이 확정된 씬 데이터를 **Remotion TSX 코드**로 변환합니다.
- 씬 컴포넌트 (S1.tsx ~ SN.tsx)

> **참고**: 전환 컴포넌트는 사용하지 않음 (섹션 간 직접 연결)

---

## ⚠️ Part 단위 호출 (필수!)

> **Part 단위로 한 번의 호출!** 섹션별 개별 호출 금지!

### state.json에서 Part 정보 확인

> **규칙: Part당 최대 10개 씬** (씬 개수 기준 동적 분할)

```javascript
// state.json의 sections 구조
const { parts, part_scenes, max_scenes_per_part } = state.sections;
const currentPart = state.code_progress.current_part;

// 예시 (씬 개수 기준 동적 분할)
parts = {
  "part1": ["hook", "background"],       // 9개 씬
  "part2-1": ["core1", "core2"],          // 9개 씬
  "part2-2": ["core3", "core4"],          // 9개 씬
  "part2-3": ["core5", "core6"],          // 8개 씬
  "part2-4": ["core7"],                   // 5개 씬
  "part3": ["insight", "outro"]           // 9개 씬
};

part_scenes = {
  "part1": ["s1", "s2", ..., "s9"],        // 9개
  "part2-1": ["s10", "s11", ..., "s18"],   // 9개
  "part2-2": ["s19", "s20", ..., "s27"],   // 9개
  "part2-3": ["s28", "s29", ..., "s35"],   // 8개
  "part2-4": ["s36", "s37", "s38", "s39"], // 4개
  "part3": ["s40", "s41", ..., "s48"]      // 9개
};
```

### 호출 규칙

| 규칙 | 설명 |
|------|------|
| **한 Part = 한 번 호출** | Part 내 모든 씬을 한 번에 처리 |
| **섹션별 호출 금지** | core1, core2, core3 따로 호출 |
| **Part 완료 후 커밋** | diff 정리 → 새 세션 시작 |

### 올바른 호출 예시

```
"scene-coder 에이전트로 Part 2-1 실행
섹션: core1, core2
씬: S10~S18 (9개)"
```

### Part당 씬 개수 확인 (필수!)

> ⚠️ **호출 전 state.json에서 part_scenes 확인!**

```javascript
// state.json 확인
const partScenes = state.sections.part_scenes["part2-1"];
console.log(partScenes.length); // 10개 이하여야 함
```

### 잘못된 호출 예시 (절대 금지!)

```
"core1 섹션 scene-coder 실행"
"core2 섹션 scene-coder 실행"
"core3 섹션 scene-coder 실행"
(Task 3번 = diff 3번 누적 = 토큰 낭비!)
```

### 전환 컴포넌트 (사용 안함)

> ⚠️ **전환 컴포넌트는 생성하지 않습니다.**
> 섹션 간 연결은 FFmpeg에서 gap(마지막 프레임 유지)으로 처리합니다.

---

## ⚠️ 필수: styles.ts Import (크기 중앙 관리)

> **모든 씬에서 반드시 styles.ts를 import하여 상수를 사용해야 합니다!**
> **숫자 하드코딩 금지!**

### 필수 Import 문

```tsx
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  TEXT_STROKE,
  FONTS,
  COLORS,
  Z_INDEX,
} from "../lib/styles";
```

### FONT_SIZES 사용법

| 상수 | 값 | 용도 |
|------|-----|------|
| `FONT_SIZES.caption` | 45px | 자막 |
| `FONT_SIZES.label` | 36px | 작은 라벨, 설명 |
| `FONT_SIZES.body` | 48px | 일반 본문 |
| `FONT_SIZES.subtitle` | 56px | 부제목 |
| `FONT_SIZES.title` | 72px | 제목, 지명 |
| `FONT_SIZES.highlight` | 96px | 강조 숫자 |
| `FONT_SIZES.hero` | 120px | 최대 강조 (금액, 반전) |
| `FONT_SIZES.emojiSmall` | 50px | 최소 이모지 |
| `FONT_SIZES.emoji` | 80px | 일반 이모지 |
| `FONT_SIZES.emojiLarge` | 120px | 큰 이모지 |

```tsx
// 올바른 사용
<div style={{ fontSize: FONT_SIZES.title }}>제목</div>
<div style={{ fontSize: FONT_SIZES.highlight }}>1,234</div>
<div style={{ fontSize: FONT_SIZES.emoji }}>🏺</div>

// 금지! 숫자 하드코딩
<div style={{ fontSize: 72 }}>제목</div>
```

### IMAGE_SIZES 사용법

| 상수 | 값 | 용도 |
|------|-----|------|
| `IMAGE_SIZES.iconSmall` | 80px | 작은 아이콘 |
| `IMAGE_SIZES.icon` | 120px | 일반 아이콘 |
| `IMAGE_SIZES.iconLarge` | 180px | 큰 아이콘 |
| `IMAGE_SIZES.portrait` | 280px | 일반 초상화 |
| `IMAGE_SIZES.portraitLarge` | 350px | 큰 초상화 |
| `IMAGE_SIZES.map` | 500px | 일반 지도 |
| `IMAGE_SIZES.mapLarge` | 700px | 큰 지도 |
| `IMAGE_SIZES.artifact` | 200px | 일반 유물 |
| `IMAGE_SIZES.artifactLarge` | 300px | 큰 유물 |

```tsx
// 올바른 사용
<Img src={...} style={{ width: IMAGE_SIZES.portrait }} />
<Img src={...} style={{ width: IMAGE_SIZES.icon }} />

// 금지! 숫자 하드코딩
<Img src={...} style={{ width: 280 }} />
```

### ELEMENT_SCALE 사용법 (동적 크기)

> 화면 크기에 비례하는 이모지/이미지 크기가 필요할 때 사용

```tsx
import { ELEMENT_SCALE } from "../lib/styles";

const { width } = useVideoConfig();

// 이모지 크기 (화면 너비 기준)
const emojiSize = width * ELEMENT_SCALE.emojiHero;  // ~192px (10%)

// 이미지 크기 (화면 너비 기준)
const imageSize = width * ELEMENT_SCALE.imageHero;  // ~346px (18%)

// 사용 예시: 크기 비교 씬
<div style={{ fontSize: emojiSize }}>🧍</div>
<Img style={{ width: imageSize }} />
```

| 상수 | 비율 | 1920px 기준 | 용도 |
|------|------|-------------|------|
| `emojiSmall` | 3% | ~58px | 작은 이모지 |
| `emoji` | 5% | ~96px | 일반 이모지 |
| `emojiLarge` | 8% | ~154px | 큰 이모지 |
| `emojiHero` | 10% | ~192px | 크기 비교용 |
| `imageSmall` | 8% | ~154px | 작은 이미지 |
| `image` | 12% | ~230px | 일반 이미지 |
| `imageLarge` | 15% | ~288px | 큰 이미지 |
| `imageHero` | 18% | ~346px | 메인 강조용 |

### 테두리 스타일 사용법

```tsx
// 자막용: 검은 글자 + 흰 테두리
<div style={{
  color: "#000000",
  textShadow: `${CAPTION_STROKE}, 0 4px 8px rgba(0, 0, 0, 0.3)`,
}}>
  자막 텍스트
</div>

// 일반 텍스트용: 흰 글자 + 검은 테두리
<div style={{
  color: "#FFFFFF",
  textShadow: `${TEXT_STROKE}, 0 4px 8px rgba(0, 0, 0, 0.5)`,
}}>
  일반 텍스트
</div>
```

---

## ⚠️ 필수 참조 (코드 작성 전 반드시 읽기!)

> **코드 작성 전에 아래 파일들을 Read tool로 반드시 읽어야 합니다!**
> 읽지 않으면 Remotion 규칙 위반으로 렌더링 오류가 발생합니다.

### 1단계: 필수 읽기 (매 Part 시작 시)

```
Read tool로 반드시 읽을 파일:
1. remotion/src/lib/styles.ts        → FONT_SIZES, IMAGE_SIZES 상수 확인
2. remotion/src/lib/animations.ts    → fadeIn, cameraZoom 등 유틸리티 확인
3. .claude/skills/remotion/SKILL.md  → Remotion 베스트 프랙티스 확인
```

### 2단계: 상황별 읽기 (해당 애니메이션 구현 시)

| 구현할 기능 | 읽을 파일 |
|------------|----------|
| interpolate 사용 | `.claude/skills/remotion/rules/timing.md` |
| Img 컴포넌트 사용 | `.claude/skills/remotion/rules/images.md` |
| staticFile 사용 | `.claude/skills/remotion/rules/assets.md` |
| Sequence 사용 | `.claude/skills/remotion/rules/sequencing.md` |
| 복잡한 애니메이션 | `.claude/skills/remotion/rules/animations.md` |
| 텍스트 애니메이션 | `.claude/skills/remotion/rules/text-animations.md` |
| 자막 표시 | `.claude/skills/remotion/rules/display-captions.md` |
| **시각 효과 (snow, rain, fire 등)** | `.claude/skills/remotion/rules/effects.md` |

### 작업 순서 (필수!)

```
1. [Read] styles.ts 읽기
2. [Read] animations.ts 읽기
3. [Read] SKILL.md 읽기
4. [Read] 필요한 rules/*.md 읽기 (상황별)
   - effect 타입 요소가 있으면 → effects.md 필수 읽기!
5. [Write] S{n}.tsx 코드 작성
```

> ⚠️ **1~3단계를 건너뛰면 안 됩니다!**
> 상수값, 유틸리티 함수를 모르면 올바른 코드를 작성할 수 없습니다.

---

## ⚠️ 권장: animations.ts 유틸리티 사용

> **반복되는 애니메이션 패턴은 `animations.ts` 유틸리티를 사용하세요!**
> 직접 interpolate를 작성하는 것보다 **코드가 간결하고 일관성 있습니다.**

### Import 문

```tsx
import {
  FPS,
  secondsToFrames,
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

### 사용 가능한 함수

| 함수 | 용도 | 예시 |
|------|------|------|
| `fadeIn(frame, startFrame, duration)` | 페이드인 | `opacity: fadeIn(frame, 0, 15)` |
| `fadeOut(frame, startFrame, duration)` | 페이드아웃 | `opacity: fadeOut(frame, 100, 15)` |
| `slideInLeft(frame, start, duration, distance?)` | 왼쪽에서 슬라이드 | `translateX: slideInLeft(frame, 0, 24)` |
| `slideInRight(frame, start, duration, distance?)` | 오른쪽에서 슬라이드 | `translateX: slideInRight(frame, 0, 24)` |
| `scaleIn(frame, start, duration, from?, to?)` | 크기 확대 (탄성) | `scale: scaleIn(frame, 0, 20)` |
| `cameraZoom(frame, start, duration, from?, to?)` | 카메라 줌 | `scale: cameraZoom(frame, 0, 90, 1, 1.2)` |
| `cameraPan(frame, start, duration, fromX, toX, fromY, toY)` | 카메라 팬 | `{ x, y } = cameraPan(...)` |
| `pulse(frame, start, cycleDuration, min?, max?)` | 반복 펄스 | `scale: pulse(frame, 0, 30)` |
| `secondsToFrames(seconds)` | 초 → 프레임 | `secondsToFrames(1.5)` → 45 |

### 사용 예시

```tsx
import { fadeIn, scaleIn, cameraZoom } from "../lib/animations";

export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 아이콘 페이드인 (0~15프레임)
  const iconOpacity = fadeIn(frame, 0, 15);

  // 텍스트 팝업 (10~30프레임, 탄성 효과)
  const textScale = scaleIn(frame, 10, 20);

  // 카메라 줌 (전체 씬)
  const zoom = cameraZoom(frame, 0, durationInFrames, 1, 1.1);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div style={{ transform: `scale(${zoom})` }}>
        <Img style={{ opacity: iconOpacity }} ... />
        <div style={{ transform: `scale(${textScale})` }}>텍스트</div>
      </div>
    </AbsoluteFill>
  );
};
```

### 언제 animations.ts를 사용하는가?

| 상황 | 권장 |
|------|------|
| 단순 fadeIn/fadeOut | ✅ `fadeIn()`, `fadeOut()` 사용 |
| 슬라이드 인 | ✅ `slideInLeft()`, `slideInRight()` 사용 |
| 크기 확대 (탄성) | ✅ `scaleIn()` 사용 |
| 카메라 줌/팬 | ✅ `cameraZoom()`, `cameraPan()` 사용 |
| 복잡한 커스텀 애니메이션 | ⚠️ 직접 `interpolate` 사용 |
| 특수 easing 필요 | ⚠️ 직접 `interpolate` 사용 |

---

## 입력

| 파일 | 경로 | 설명 |
|------|------|------|
| s{n}_timed.json | output/2_audio/s{n}_timed.json | 타이밍 확정된 씬 |
| s{n}.json | output/1_scripts/s{n}.json | 씬 상세 (elements, animation_hints) |
| reading_script.json | output/1_scripts/reading_script.json | 전환 텍스트 (transitions) |
| asset_catalog.csv | output/asset_catalog.csv | 에셋 경로 |

---

## 출력

| 파일 | 경로 | 설명 |
|------|------|------|
| S{n}.tsx | remotion/src/scenes/S{n}.tsx | 씬 컴포넌트 |

---

## 핵심 규칙

### 1. 배경 이미지 포함 필수

```tsx
import { Img, staticFile } from "remotion";
import { cameraZoom } from "../lib/animations";
import { Z_INDEX } from "../lib/styles";

// 배경 레이어 (Ken Burns 효과 적용)
const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);

<AbsoluteFill>
  {/* Layer 0: 배경 이미지 (최하단) */}
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

  {/* Layer 1: 콘텐츠 요소 */}
  {/* ... */}

  {/* Layer 2: 자막 (최상단) */}
  {/* ... */}
</AbsoluteFill>
```

> 배경 이미지는 Remotion에서 직접 렌더링합니다. FFmpeg 합성 단계가 생략됩니다.

### 2. 자막은 Remotion에서 처리

```tsx
import { useCurrentFrame, useVideoConfig } from "remotion";

// captions 데이터 (s{n}_timed.json에서)
const captions = [
  { text: "영하 20도.", start: 0.0, end: 0.9 },
  { text: "보일러도 없고, 패딩도 없다.", start: 1.2, end: 3.1 },
];

// 현재 프레임에 해당하는 자막 찾기
const { fps } = useVideoConfig();
const frame = useCurrentFrame();
const currentTime = frame / fps;

const currentCaption = captions.find(
  (c) => currentTime >= c.start && currentTime < c.end
);
```

### 3. 자막 스타일 (styles.ts 상수 사용!)

```tsx
import {
  FONT_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  FONTS,
  Z_INDEX,
} from "../lib/styles";

{currentCaption && (
  <div
    style={{
      position: "absolute",
      bottom: CAPTION_STYLE.bottom,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: FONT_SIZES.caption,
      fontFamily: FONTS.primary,
      fontWeight: CAPTION_STYLE.fontWeight,
      color: CAPTION_STYLE.color,
      textShadow: `${CAPTION_STROKE}, 0 4px 8px rgba(0, 0, 0, 0.3)`,
      padding: CAPTION_STYLE.padding,
      zIndex: Z_INDEX.caption,
    }}
  >
    {currentCaption.text}
  </div>
)}
```

### 4. 화면 레이아웃 규칙 (필수!)

```
화면 구조 (1920×1080):
┌─────────────────────────────────────┐
│          SAFE ZONE (5%)             │ ← top: 54px
├─────────────────────────────────────┤
│                                     │
│         CONTENT AREA                │
│      (top: 8% ~ bottom: 22%)        │
│                                     │
├─────────────────────────────────────┤
│         CAPTION ZONE                │ ← bottom: 80px, height: ~140px
└─────────────────────────────────────┘
```

**핵심 규칙:**
- 모든 콘텐츠는 `bottom: 22%` (약 238px) 이상 유지
- 자막 영역 (bottom: 80px ~ 220px) 절대 침범 금지
- 하단 요소 배치 시 `bottom: "25%"` 이상 사용

```tsx
// 금지 - 자막과 겹침
<div style={{ bottom: "10%" }}>질문 박스</div>

// 올바름 - 자막 위 충분한 여백
<div style={{ bottom: "25%" }}>질문 박스</div>
```

### 5. 텍스트 줄바꿈 규칙

| 상황 | 스타일 | 예시 |
|------|--------|------|
| 짧은 레이블 (배지, 태그) | `whiteSpace: "nowrap"` | "💩 담으면", "👑 담으면" |
| 박스 안 짧은 텍스트 | 부모에 `whiteSpace: "nowrap"` | "상당히 큰 크기!", 정보 카드 |
| 긴 설명 텍스트 | 기본값 (자동 줄바꿈) | 본문, 긴 설명 |
| 명시적 줄바꿈 필요 | `\n` + `whiteSpace: "pre-line"` | 여러 줄 강제 분리 |

```tsx
// 짧은 레이블 - 한 줄 유지
<div style={{
  padding: "4px 12px",
  background: "#8B4513",
  borderRadius: 10,
  whiteSpace: "nowrap",  // 필수!
}}>
  💩 담으면
</div>

// 박스 안 텍스트 - 부모에 적용
<div style={{
  padding: "8px 25px",
  border: "3px solid gold",
  whiteSpace: "nowrap",  // 부모에 적용
}}>
  <div style={{ fontSize: FONT_SIZES.subtitle }}>
    상당히 큰 크기!
  </div>
</div>
```

### 6. interpolate 필수 옵션

```tsx
import { interpolate } from "remotion";

// 필수: extrapolate 설정
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// 금지: extrapolate 없음 (범위 밖에서 이상한 값)
const opacity = interpolate(frame, [0, 15], [0, 1]);
```

### 7. Easing 규칙

```tsx
import { Easing } from "remotion";

// 권장: bezier 직접 사용
easing: Easing.bezier(0.33, 1, 0.68, 1)   // easeOutCubic
easing: Easing.bezier(0.65, 0, 0.35, 1)   // easeInOutCubic

// 주의: Easing.out(Easing.cubic) 형태는 Remotion 버전에 따라 에러 가능
```

---

## 씬 컴포넌트 템플릿 (배경 포함 버전)

```tsx
// remotion/src/scenes/S1.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STYLE,
  CAPTION_STROKE,
  FONTS,
  Z_INDEX,
} from "../lib/styles";
import { fadeIn, cameraZoom } from "../lib/animations";

// Scene S1: hook - 영하 20도 인트로
// Duration: 5.8 seconds

// 자막 데이터
const captions = [
  { text: "영하 20도.", start: 0.0, end: 0.9 },
  { text: "보일러도 없고, 패딩도 없다.", start: 1.2, end: 3.1 },
  { text: "당신이라면 어떻게 버틸까?", start: 3.5, end: 5.8 },
];

export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  // 현재 자막
  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // ========================================
  // 배경 애니메이션 (Ken Burns 효과)
  // ========================================
  const bgScale = cameraZoom(frame, 0, durationInFrames, 1.0, 1.08);

  // ========================================
  // 콘텐츠 애니메이션
  // ========================================
  const thermometerOpacity = fadeIn(frame, 0, 15);

  return (
    <AbsoluteFill>
      {/* ========================================
          Layer 0: 배경 이미지 (최하단)
          ======================================== */}
      <AbsoluteFill style={{ zIndex: Z_INDEX.background }}>
        <Img
          src={staticFile("assets/backgrounds/bg_s1.png")}
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
      {/* 온도계 아이콘 */}
      <Img
        src={staticFile("assets/icons/thermometer_icon.png")}
        style={{
          position: "absolute",
          right: 200,
          top: "50%",
          transform: "translateY(-50%)",
          width: IMAGE_SIZES.icon,
          opacity: thermometerOpacity,
          zIndex: Z_INDEX.content,
        }}
      />

      {/* -20 텍스트 */}
      <div
        style={{
          position: "absolute",
          right: 220,
          top: "50%",
          transform: "translateY(-50%) translateY(100px)",
          fontSize: FONT_SIZES.highlight,
          fontFamily: FONTS.primary,
          fontWeight: 700,
          color: "#4FC3F7",
          opacity: thermometerOpacity,
          textShadow: "0 0 20px rgba(79, 195, 247, 0.5)",
          zIndex: Z_INDEX.content,
        }}
      >
        -20°
      </div>

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
            fontSize: CAPTION_STYLE.fontSize,
            fontFamily: CAPTION_STYLE.fontFamily,
            fontWeight: CAPTION_STYLE.fontWeight,
            color: CAPTION_STYLE.color,
            textShadow: CAPTION_STROKE,
            padding: CAPTION_STYLE.padding,
            zIndex: Z_INDEX.caption,
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default S1;
```

---

<!--
## 전환 컴포넌트 템플릿 (사용 안함)

> 전환 컴포넌트는 사용하지 않습니다. 섹션 간 연결은 FFmpeg에서 처리합니다.
-->

---

## 애니메이션 패턴

> **권장: `animations.ts` 유틸리티 사용** (코드 간결, 일관성)

### fadeIn / fadeOut

```tsx
// ✅ 권장: animations.ts 사용
import { fadeIn, fadeOut } from "../lib/animations";
const opacity = fadeIn(frame, 0, 15);
const outOpacity = fadeOut(frame, durationInFrames - 15, 15);

// ⚠️ 직접 작성 (복잡한 경우만)
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateRight: "clamp",
});
```

### popUp (탄성 등장)

```tsx
// ✅ 권장: animations.ts 사용
import { scaleIn } from "../lib/animations";
const scale = scaleIn(frame, 0, 20);

// ⚠️ 직접 작성 (특수 easing 필요시)
const scale = interpolate(frame, [0, 20], [0, 1], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot
});
```

### slideIn (왼쪽/오른쪽에서)

```tsx
// ✅ 권장: animations.ts 사용
import { slideInLeft, slideInRight } from "../lib/animations";
const x = slideInLeft(frame, 0, 24, 300);  // 왼쪽에서 300px 이동
const x = slideInRight(frame, 0, 24);       // 오른쪽에서 (기본 200px)

// ⚠️ 직접 작성
const x = interpolate(frame, [0, 24], [-300, 0], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.33, 1, 0.68, 1),
});
```

### camera zoom / pan

```tsx
// ✅ 권장: animations.ts 사용
import { cameraZoom, cameraPan } from "../lib/animations";
const zoom = cameraZoom(frame, 0, durationInFrames, 1, 1.2);
const { x, y } = cameraPan(frame, 0, 60, 0, 100, 0, 50);

<div style={{ transform: `scale(${zoom}) translate(${x}px, ${y}px)` }}>

// ⚠️ 직접 작성
const zoom = interpolate(frame, [60, 120], [1, 1.3], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### pulse (반복 애니메이션)

```tsx
// ✅ animations.ts 사용
import { pulse } from "../lib/animations";
const scale = pulse(frame, 0, 30, 1, 1.1);  // 30프레임 주기로 1~1.1 진동
```

---

## 에셋 경로 규칙

```tsx
// asset_catalog.csv의 path 그대로 사용
staticFile("assets/icons/thermometer_icon.png")
staticFile("assets/portraits/king_portrait.png")
staticFile("assets/maps/korea_map.png")
```

에셋은 `remotion/public/assets/`에 위치합니다.

---

## 금지 사항

### 1. CSS 애니메이션 금지

```tsx
// 금지: CSS transition
style={{ transition: "opacity 0.3s" }}

// 금지: CSS animation
style={{ animation: "fadeIn 1s" }}

// 사용: Remotion interpolate
const opacity = interpolate(frame, [0, 15], [0, 1], {...});
```

### 2. Hook 규칙 준수

```tsx
// 금지: 조건문 안에서 Hook
if (condition) {
  const frame = useCurrentFrame(); // Error!
}

// 필수: 컴포넌트 최상위에서
const frame = useCurrentFrame();
if (condition) {
  // frame 사용
}
```

### 3. 숫자 하드코딩 금지!

```tsx
// 금지: 숫자 직접 사용
fontSize: 72,
width: 280,

// 필수: styles.ts 상수 사용
fontSize: FONT_SIZES.title,
width: IMAGE_SIZES.portrait,
```

---

## durationInFrames 계산

```
s{n}_timed.json의 duration × fps = durationInFrames

예: duration 8.5초, fps 30
→ durationInFrames = Math.ceil(8.5 * 30) = 255
```

### s{n}_timed.json 구조

> 참고: scene-splitter 에이전트의 출력 형식

```json
{
  "scene_id": "s1",
  "section": "hook",
  "duration": 8.5,
  "section_start": 0.0,
  "section_end": 8.5,
  "subtitle_segments": [
    { "index": 1, "text": "영하 20도.", "start": 0.0, "end": 0.9 },
    { "index": 2, "text": "보일러도 없고...", "start": 1.2, "end": 3.1 }
  ]
}
```

---

## Root.tsx 업데이트 정보

코드 생성 완료 후 다음 정보를 출력합니다:

```markdown
## Root.tsx 업데이트 필요

### Import 추가
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { T1 } from "./transitions/T1";

### Composition 추가
<Composition id="S1" component={S1} durationInFrames={255} fps={30} width={1920} height={1080} />
<Composition id="S2" component={S2} durationInFrames={312} fps={30} width={1920} height={1080} />
<Composition id="T1" component={T1} durationInFrames={90} fps={30} width={1920} height={1080} />
```

> Python 스크립트가 이 정보로 Root.tsx를 자동 업데이트합니다.

---

## Part 단위 처리

> **이 에이전트는 Part 단위로 호출됩니다!** 섹션별 호출 금지!

```
호출 예시 (씬 개수 기준 동적 분할):
"scene-coder 에이전트로 Part 2-1 실행
섹션: core1, core2
씬: S10~S18 (9개)"

→ S10.tsx ~ S18.tsx (Part 2-1의 모든 씬, 최대 10개)
→ T3.tsx (해당 섹션들의 전환)
```

### 작업 완료 시 state.json 업데이트

```json
{
  "code_progress": {
    "completed_parts": ["part1", "part2-1"],
    "completed_sections": ["hook", "background", "core1", "core2"],
    "current_part": "part2-2",
    "remaining_parts": ["part2-2", "part2-3", "part2-4", "part3"]
  }
}
```

### 전환 처리 (사용 안함)

> ⚠️ **전환 컴포넌트는 생성하지 않습니다.**
>
> 섹션 간 연결은 FFmpeg에서 처리합니다:
> - 섹션 마지막에 gap 추가 (기본 1초)
> - 마지막 프레임 유지로 자연스러운 전환

---

## 체크리스트

### 코드 구조
- [ ] **styles.ts를 import 했는가?**
- [ ] **배경 이미지 레이어를 추가했는가?** (Z_INDEX.background)
- [ ] useCurrentFrame/useVideoConfig를 최상위에서 호출했는가?
- [ ] 모든 interpolate에 extrapolate 옵션이 있는가?
- [ ] 에셋 경로가 asset_catalog.csv과 일치하는가?

### 크기 상수
- [ ] **FONT_SIZES 상수를 사용했는가? (숫자 하드코딩 금지!)**
- [ ] **IMAGE_SIZES 상수를 사용했는가? (숫자 하드코딩 금지!)**
- [ ] CAPTION_STROKE / TEXT_STROKE 상수를 사용했는가?

### 자막
- [ ] captions 배열이 s{n}_timed.json과 일치하는가?
- [ ] 현재 자막 찾기 로직이 올바른가?
- [ ] 자막 스타일 (CAPTION_STROKE + 검은 글씨, bottom: 40) 적용했는가?
- [ ] 자막 위치가 하단 고정인가?

### 애니메이션
- [ ] animation_hints를 반영했는가?
- [ ] 애니메이션 타이밍이 씬 duration 내에 있는가?
- [ ] Easing.bezier 형태로 사용했는가?
- [ ] effect 타입 요소가 있으면 effects.md 참조하여 구현했는가?

### 출력
- [ ] TSX 파일이 올바른 경로에 저장되었는가?
- [ ] Root.tsx 업데이트 정보를 출력했는가?

---

## 호출 방법

> **규칙: Part당 최대 10개 씬** (state.json의 part_scenes 확인 필수!)

```
Task tool로 Part 단위 호출 (씬 개수 기준 동적 분할):

"scene-coder 에이전트로 Part 1 실행
섹션: hook, background
씬: S1~S9 (9개)"

"scene-coder 에이전트로 Part 2-1 실행
섹션: core1, core2
씬: S10~S18 (9개)"

"scene-coder 에이전트로 Part 2-2 실행
섹션: core3, core4
씬: S19~S27 (9개)"

"scene-coder 에이전트로 Part 2-3 실행
섹션: core5, core6
씬: S28~S35 (8개)"

"scene-coder 에이전트로 Part 2-4 실행
섹션: core7
씬: S36~S39 (4개)"

"scene-coder 에이전트로 Part 3 실행
섹션: insight, outro
씬: S40~S48 (9개)"
```

> **섹션별 개별 호출 금지!** Part 단위로만 호출하세요.
> **Part당 씬 개수는 state.json에서 동적으로 결정됩니다.**

## 참고

- 이전 단계: **scene-splitter 에이전트** (자막 타이밍)
- 다음 단계: **Python 렌더링 파이프라인** (Remotion render + FFmpeg)
- Part 정보: **state.json의 sections.parts** 참조
