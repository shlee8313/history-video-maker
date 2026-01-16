---
name: code-validator
description: Remotion 코드 검증. React/TypeScript 문법, 로직, 타이밍, 스타일 일관성 검사 및 자동 수정.
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Code Validator Skill

## Remotion React 코드 검증 전문가

Visual Prompter와 Remotion Coder 파이프라인의 일관성을 검증하고, 코드 품질을 보장합니다.

---

## 검증 페이즈 개요

| Phase | 검증 대상 | 설명 |
|-------|-----------|------|
| **Phase 0** | 파이프라인 일관성 | visual.json → React 컴포넌트 변환 정합성 |
| **Phase 1** | 문법 검증 | TypeScript/React/Remotion 문법 오류 |
| **Phase 2** | 로직 검증 | 애니메이션 로직 및 참조 오류 |
| **Phase 3** | 타이밍 검증 | 나레이션 동기화 및 시간 설계 |
| **Phase 4** | 스타일 검증 | 역사 콘텐츠 스타일 일관성 |

---

## Phase 0: 파이프라인 일관성 검증

### 검증 체인

```
Scene Director (s{n}.json)
    ↓
Visual Layout (s{n}_layout.json)
    ↓
Visual Animation (s{n}_visual.json)
    ↓
Remotion Coder (S{n}.tsx)
```

### 검증 항목

| 검증 | 설명 | 오류 시 |
|------|------|---------|
| **객체 ID 일치** | layout.json의 모든 id가 코드에 존재 | MISSING_OBJECT |
| **애니메이션 매핑** | visual.json의 모든 action이 코드에 구현 | MISSING_ANIMATION |
| **에셋 참조** | staticFile() 경로의 파일이 실제 존재 | ASSET_NOT_FOUND |
| **타이밍 일치** | visual.json의 time_range가 interpolate에 반영 | TIMING_MISMATCH |

---

## Phase 1: 문법 검증 (Syntax Validation)

### 1.1 필수 Import 검증

```typescript
// 필수 import 목록
const REQUIRED_IMPORTS = [
  'remotion',
  'react',
];

// 자주 사용되는 Remotion import
const REMOTION_IMPORTS = {
  'useCurrentFrame': 'remotion',
  'useVideoConfig': 'remotion',
  'AbsoluteFill': 'remotion',
  'Sequence': 'remotion',
  'Img': 'remotion',
  'staticFile': 'remotion',
  'interpolate': 'remotion',
  'Easing': 'remotion',
  'Composition': 'remotion',
};
```

### 1.2 React Hooks 규칙 검증

```typescript
// ✅ 올바른 패턴: 컴포넌트 최상위에서 호출
export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ...
};

// ❌ 오류 패턴: 조건문 안에서 Hook 호출
if (condition) {
  const frame = useCurrentFrame();  // ERROR: Hook 규칙 위반
}

// ❌ 오류 패턴: 콜백 안에서 Hook 호출
items.map(() => {
  const frame = useCurrentFrame();  // ERROR: Hook 규칙 위반
});
```

### 1.3 interpolate 검증

```typescript
// ✅ 올바른 패턴
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});

// ❌ 오류 패턴: extrapolate 미설정
const opacity = interpolate(frame, [0, 30], [0, 1]);  // WARNING: extrapolate 미설정

// ❌ 오류 패턴: 잘못된 범위
const opacity = interpolate(frame, [30, 0], [0, 1]);  // ERROR: 범위 역전
```

### 1.4 staticFile 검증

```typescript
// ✅ 올바른 패턴
staticFile("assets/maps/joseon.png")

// ❌ 오류 패턴: 동적 경로
staticFile(`assets/${variable}.png`)  // ERROR: 동적 경로 불가

// ❌ 오류 패턴: 절대 경로
staticFile("/C:/assets/image.png")  // ERROR: 절대 경로 불가
```

### 1.5 컴포넌트 구조 검증

```typescript
// ✅ 올바른 패턴: 함수형 컴포넌트
export const S1: React.FC = () => {
  return <AbsoluteFill>...</AbsoluteFill>;
};

// ❌ 오류 패턴: 클래스 컴포넌트 (Remotion 미지원)
export class S1 extends React.Component {  // ERROR
}

// ❌ 오류 패턴: 반환값 없음
export const S1: React.FC = () => {
  // return 누락  // ERROR
};
```

---

## Phase 2: 로직 검증 (Logic Validation)

### 2.1 AbsoluteFill 루트 검증

```typescript
// ✅ 올바른 패턴: AbsoluteFill로 감싸기
return (
  <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
    ...
  </AbsoluteFill>
);

// ❌ 오류 패턴: div로 시작
return (
  <div>...</div>  // WARNING: AbsoluteFill 권장
);
```

### 2.2 배경색 검증

```typescript
// ✅ 올바른 패턴: 배경색 설정
<AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>

// ❌ 오류 패턴: 배경색 없음
<AbsoluteFill>  // WARNING: 투명 배경 발생 가능
```

### 2.3 zIndex 검증

```typescript
// 레이어 규칙
const LAYER_RULES = {
  background: { min: -200, max: -50 },
  midground: { min: -49, max: 49 },
  foreground: { min: 50, max: 150 },
  ui: { min: 151, max: 300 },
};

// ⚠️ 경고: 텍스트가 배경 레이어에 있음
<div style={{ zIndex: -100 }}>텍스트</div>
```

### 2.4 에셋 존재 검증

```typescript
// staticFile 경로 추출 후 실제 파일 존재 확인
// 경로: remotion/public/ 기준

// ERROR: 파일 없음
staticFile("assets/maps/nonexistent.png")
```

---

## Phase 3: 타이밍 검증 (Timing Validation)

### 3.1 durationInFrames 일치 검증

```typescript
// Root.tsx의 Composition과 timing.json 비교
// timing.json: duration: 10.5초
// durationInFrames: 10.5 * 30 = 315

<Composition
  id="S1"
  component={S1}
  durationInFrames={315}  // 정확히 일치해야 함
  fps={30}
/>
```

### 3.2 interpolate 범위 검증

```typescript
// visual.json의 time_range와 코드의 interpolate 범위 비교
// time_range: [0, 3.5] → frames: [0, 105]

const opacity = interpolate(frame, [0, 105], [0, 1]);  // ✅ 일치

const opacity = interpolate(frame, [0, 90], [0, 1]);   // ⚠️ 불일치
```

### 3.3 Sequence 범위 검증

```typescript
// Sequence가 durationInFrames를 초과하면 안 됨
<Composition durationInFrames={300}>

<Sequence from={280} durationInFrames={50}>  // ❌ 330까지 → 초과
  ...
</Sequence>
```

### 3.4 애니메이션 시간 범위 권장

```typescript
const DURATION_LIMITS: Record<string, {min: number, max: number}> = {
  fadeIn: { min: 10, max: 45 },     // 0.3~1.5초
  fadeOut: { min: 10, max: 45 },
  scale: { min: 6, max: 30 },       // 0.2~1.0초
  position: { min: 15, max: 90 },   // 0.5~3.0초
  camera: { min: 30, max: 120 },    // 1.0~4.0초
};
```

---

## Phase 4: 스타일 검증 (Style Validation)

### 4.1 색상 검증

```typescript
// 역사 콘텐츠 권장 색상
const HISTORY_COLORS = {
  GOLD: '#D4AF37',
  SEPIA: '#704214',
  PARCHMENT: '#F4E4BC',
  ANTIQUE_WHITE: '#FAEBD7',
  TEXT_DARK: '#2C1810',
  TEXT_LIGHT: '#F5F5DC',
};

// ⚠️ 경고: 역사 콘텐츠에 부적절한 색상
const INAPPROPRIATE_COLORS = [
  '#00FF00',  // 순수 녹색
  '#FF00FF',  // 마젠타
  '#00FFFF',  // 시안
];
```

### 4.2 폰트 검증

```typescript
// 권장 폰트
const RECOMMENDED_FONTS = {
  korean: ["'Gowun Batang'", "'Nanum Myeongjo'", "'Noto Serif KR'"],
  english: ["'Playfair Display'", "'EB Garamond'"],
};

// ⚠️ 경고: 한글 폰트 미지정
<div style={{ fontSize: 72 }}>  // WARNING: fontFamily 누락
  안녕하세요
</div>
```

### 4.3 Easing 검증

```typescript
// 역사 콘텐츠 권장 easing
const RECOMMENDED_EASINGS = {
  camera: ['Easing.inOut(Easing.cubic)', 'Easing.inOut(Easing.quad)'],
  fadeIn: ['Easing.out(Easing.cubic)', 'Easing.out(Easing.quad)'],
  fadeOut: ['Easing.in(Easing.cubic)', 'Easing.in(Easing.quad)'],
  scale: ['Easing.out(Easing.back)'],
};

// ⚠️ 비권장 easing
const DISCOURAGED_EASINGS = [
  'Easing.bounce',      // 역사적 분위기에 부적합
  'Easing.elastic',     // 만화적 느낌
];
```

---

## 자동 수정 패턴 (Auto-Fix)

### 5.1 extrapolate 자동 추가

```typescript
// Before
interpolate(frame, [0, 30], [0, 1])

// After
interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
})
```

### 5.2 Import 자동 추가

```typescript
// Before
import { AbsoluteFill } from "remotion";

// After (interpolate, Easing 사용 감지)
import { AbsoluteFill, interpolate, Easing } from "remotion";
```

### 5.3 배경색 자동 추가

```typescript
// Before
<AbsoluteFill>

// After
<AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
```

### 5.4 폰트 자동 추가

```typescript
// Before (한글 텍스트 감지)
<div style={{ fontSize: 72 }}>
  임진왜란
</div>

// After
<div style={{ fontSize: 72, fontFamily: "'Gowun Batang', serif" }}>
  임진왜란
</div>
```

---

## 검증 리포트 형식

```markdown
# Remotion Code Validation Report

## 파일: S1.tsx
## 검증 시간: 2024-01-15 14:30:00

---

## Phase 0: 파이프라인 일관성 ✅

| 항목 | 상태 | 비고 |
|------|------|------|
| 객체 매핑 | ✅ Pass | 12/12 객체 일치 |
| 애니메이션 매핑 | ✅ Pass | 8/8 액션 구현 |
| 에셋 참조 | ✅ Pass | 모든 에셋 존재 |

---

## Phase 1: 문법 검증 ⚠️

| 라인 | 심각도 | 코드 | 메시지 |
|------|--------|------|--------|
| 23 | WARNING | interpolate(frame, [0, 30], [0, 1]) | extrapolate 미설정 |
| 45 | ERROR | staticFile(\`assets/${var}.png\`) | 동적 경로 불가 |

### 자동 수정 제안:
```diff
- interpolate(frame, [0, 30], [0, 1])
+ interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
```

---

## Phase 2: 로직 검증 ✅

- AbsoluteFill 루트 사용
- 배경색 설정됨
- zIndex 레이어 규칙 준수

---

## Phase 3: 타이밍 검증 ⚠️

| 항목 | 예상 | 실제 | 상태 |
|------|------|------|------|
| durationInFrames | 315 | 300 | ⚠️ 불일치 |
| Sequence 범위 | 0-300 | 0-330 | ❌ 초과 |

---

## Phase 4: 스타일 검증 ✅

- 색상: 모두 역사 팔레트 내
- 폰트: Gowun Batang 사용
- Easing: 권장 함수 사용

---

## 요약

| Phase | 상태 | 오류 | 경고 |
|-------|------|------|------|
| Phase 0 | ✅ | 0 | 0 |
| Phase 1 | ⚠️ | 1 | 1 |
| Phase 2 | ✅ | 0 | 0 |
| Phase 3 | ⚠️ | 1 | 1 |
| Phase 4 | ✅ | 0 | 0 |

**총합: 2 ERROR, 2 WARNING**

---

## 권장 조치

1. **라인 23**: extrapolate 옵션 추가 (자동 수정 가능)
2. **라인 45**: 정적 경로로 변경 필요
3. **Root.tsx**: durationInFrames 315로 수정
4. **Sequence**: from+duration이 durationInFrames 초과하지 않도록 조정
```

---

## 검증 명령어

```bash
# TypeScript 컴파일 검증
cd remotion && npx tsc --noEmit

# Remotion 스튜디오에서 미리보기
cd remotion && npm run dev

# 전체 렌더링 테스트
cd remotion && npx remotion render Root S1 --frames=0-30
```

---

## 검증 우선순위

| 우선순위 | 검증 항목 | 이유 |
|----------|-----------|------|
| 1 | Hook 규칙 위반 | React 런타임 에러 |
| 2 | staticFile 경로 오류 | 렌더링 실패 |
| 3 | Import 누락 | 컴파일 오류 |
| 4 | extrapolate 미설정 | 이상한 애니메이션 값 |
| 5 | 타이밍 불일치 | 나레이션 동기화 실패 |
| 6 | 스타일 불일치 | 시각적 일관성 저하 |

---

## 체크리스트

### 코드 작성 후

- [ ] Phase 1 문법 오류 0개
- [ ] Phase 2 로직 오류 0개
- [ ] Phase 3 타이밍 오차 ±1초 이내
- [ ] Phase 4 스타일 경고 확인

### 렌더링 전

- [ ] 모든 에셋 파일이 remotion/public/assets/에 존재
- [ ] visual.json과 코드 동기화
- [ ] timing.json의 duration으로 durationInFrames 계산
- [ ] Root.tsx에 Composition 등록
- [ ] TypeScript 컴파일 에러 없음
