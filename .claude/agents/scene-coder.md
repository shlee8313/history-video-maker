# Scene Coder Agent

> Remotion 코드를 생성하는 에이전트 (씬 + 전환)

## 역할

타이밍이 확정된 씬 데이터를 **Remotion TSX 코드**로 변환합니다.
- 씬 컴포넌트 (S1.tsx ~ SN.tsx)
- 전환 컴포넌트 (T1.tsx ~ TN.tsx) - 전환 개수는 섹션 수에 따라 가변

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

### 전환 컴포넌트 개수

- 전환은 **섹션 수 - 1**개 생성
- 예: 11개 섹션 → T1.tsx ~ T10.tsx

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

## 필수 참조

- **`remotion/src/lib/styles.ts` - 크기/스타일 상수 (필수 import!)**
- `.claude/skills/remotion/SKILL.md` - Remotion 공식 베스트 프랙티스
- `.claude/skills/remotion/rules/` - 상세 규칙 파일들
  - `animations.md` - 애니메이션 패턴
  - `timing.md` - interpolate 사용법
  - `fonts.md` - 폰트 로딩
  - `images.md` - 이미지 컴포넌트
  - `sequencing.md` - Sequence 사용법

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
| T{n}.tsx | remotion/src/transitions/T{n}.tsx | 전환 컴포넌트 |

---

## 핵심 규칙

### 1. 투명 배경 필수

```tsx
// 필수
<AbsoluteFill style={{ backgroundColor: "transparent" }}>

// 금지
<AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
```

배경은 FFmpeg에서 합성합니다. Remotion은 **오버레이 요소만** 렌더링!

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

### 5. interpolate 필수 옵션

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

### 6. Easing 규칙

```tsx
import { Easing } from "remotion";

// 권장: bezier 직접 사용
easing: Easing.bezier(0.33, 1, 0.68, 1)   // easeOutCubic
easing: Easing.bezier(0.65, 0, 0.35, 1)   // easeInOutCubic

// 주의: Easing.out(Easing.cubic) 형태는 Remotion 버전에 따라 에러 가능
```

---

## 씬 컴포넌트 템플릿

```tsx
// remotion/src/scenes/S1.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  Easing,
} from "remotion";
import {
  FONT_SIZES,
  IMAGE_SIZES,
  CAPTION_STROKE,
  TEXT_STROKE,
  FONTS,
  COLORS,
  Z_INDEX,
} from "../lib/styles";

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

  // 애니메이션: thermometer fadeIn
  const thermometerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 애니메이션: camera zoom
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 카메라 줌 컨테이너 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
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
          }}
        >
          -20°
        </div>
      </div>

      {/* 자막 (항상 최상단, 흰테두리 + 검정글자) */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: FONT_SIZES.caption,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            color: "#000000",
            textShadow: `${CAPTION_STROKE}, 0 4px 8px rgba(0, 0, 0, 0.3)`,
            padding: "0 40px",
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

## 전환 컴포넌트 템플릿

```tsx
// remotion/src/transitions/T1.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { FONT_SIZES, TEXT_STROKE, FONTS } from "../lib/styles";

// 전환 텍스트 (script.json에서)
const transitionText = "그 시작은...";

export const T1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 페이드인 (0 ~ 0.5초)
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 페이드아웃 (마지막 0.5초)
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // 살짝 위로 이동
  const translateY = interpolate(frame, [0, durationInFrames], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${translateY}px)`,
          fontSize: FONT_SIZES.title,
          fontFamily: FONTS.primary,
          fontWeight: 700,
          color: "#FFFFFF",
          opacity,
          textShadow: `${TEXT_STROKE}, 0 0 30px rgba(0,0,0,0.9)`,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {transitionText}
      </div>
    </AbsoluteFill>
  );
};

export default T1;
```

---

## 애니메이션 패턴

### fadeIn

```tsx
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateRight: "clamp",
});
```

### fadeOut (마지막 15프레임)

```tsx
const opacity = interpolate(
  frame,
  [durationInFrames - 15, durationInFrames],
  [1, 0],
  { extrapolateLeft: "clamp" }
);
```

### popUp (탄성 등장)

```tsx
const scale = interpolate(frame, [0, 20], [0, 1], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot
});
```

### slideIn (왼쪽에서)

```tsx
const x = interpolate(frame, [0, 24], [-300, 0], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.33, 1, 0.68, 1),
});
```

### camera zoom

```tsx
const zoom = interpolate(frame, [60, 120], [1, 1.3], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

<div style={{ transform: `scale(${zoom})` }}>
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

### 1. 배경 포함 금지

```tsx
// 금지: 배경색
style={{ backgroundColor: "#1a1a2e" }}

// 금지: 배경 이미지
<Img src={staticFile("assets/backgrounds/...")} style={{ ... }} />
```

### 2. CSS 애니메이션 금지

```tsx
// 금지: CSS transition
style={{ transition: "opacity 0.3s" }}

// 금지: CSS animation
style={{ animation: "fadeIn 1s" }}

// 사용: Remotion interpolate
const opacity = interpolate(frame, [0, 15], [0, 1], {...});
```

### 3. Hook 규칙 준수

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

### 4. 숫자 하드코딩 금지!

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
s{n}_timed.json의 timing.duration × fps = durationInFrames

예: duration 8.5초, fps 30
→ durationInFrames = Math.ceil(8.5 * 30) = 255
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

### 전환 컴포넌트 매핑 (동적)

> **전환 개수는 섹션 수에 따라 달라짐!**

**동적 매핑 규칙:**
```
섹션 목록: [s1, s2, s3, ..., sN]
전환 목록: T1 = s1→s2, T2 = s2→s3, ..., T(N-1) = s(N-1)→sN
```

**예시 (11개 섹션인 경우):**

| 전환 | 컴포넌트 | 담당 섹션 |
|------|----------|-----------|
| hook → background | T1.tsx | hook |
| background → core1 | T2.tsx | background |
| core1 → core2 | T3.tsx | core1 |
| core2 → core3 | T4.tsx | core2 |
| core3 → core4 | T5.tsx | core3 |
| core4 → core5 | T6.tsx | core4 |
| core5 → core6 | T7.tsx | core5 |
| core6 → core7 | T8.tsx | core6 |
| core7 → insight | T9.tsx | core7 |
| insight → outro | T10.tsx | insight |

**전환 텍스트 위치:**
- `reading_script.json`의 `transitions` 배열에서 확인
- 전환이 없으면 기본 텍스트 사용 또는 생략

---

## 체크리스트

### 코드 구조
- [ ] **styles.ts를 import 했는가?**
- [ ] 투명 배경 설정했는가?
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
