# Video Story Maker - CLAUDE.md

> AI 기반 스토리텔링 영상 자동 제작 시스템

## 프로젝트 개요

다양한 주제(역사, 문화, 음식, 과학, 경제 등)의 스토리텔링 영상을 자동 생성하는 파이프라인.
Remotion + FFmpeg + OpenAI TTS를 활용한 풀스택 영상 제작 워크플로우.

## 기술 스택

| 분야 | 기술 | 용도 |
|------|------|------|
| 영상 생성 | Remotion | React 기반 씬 렌더링 (배경 포함) |
| 자막 | Remotion | @remotion/captions 활용 |
| 음성 | OpenAI TTS | 나레이션 생성 |
| 타임스탬프 | Whisper | 자막 타이밍 추출 |
| 영상 합성 | FFmpeg | 오디오 믹싱, 최종 병합 |

> **참고**: 전환 클립은 사용하지 않음 (섹션 직접 연결)

---

## 에이전트 호출 규칙

### 기본 원칙

- **모든 에이전트는 순차 실행** (백그라운드 실행 금지)
- `run_in_background: true` 사용 금지 - 진행 상황을 실시간으로 확인할 수 없음
- Task 도구로 에이전트 호출 시 작업 완료까지 대기

### 세션 관리 원칙 (토큰 절약)

> **문제**: 파일 수정 후 diff가 `<system-reminder>`로 매 메시지마다 누적되어 토큰 낭비
> **해결**: Part/Phase 완료 시 새 세션 시작

| 규칙 | 설명 |
|------|------|
| **한 세션 = 한 Part** | Part 완료 후 새 대화 시작 (컨텍스트 리셋) |
| **Task 호출 최소화** | 한 세션에서 Task 호출 3회 이내 권장 |
| **커밋 후 진행** | 파일 수정 후 git commit → diff 추적 리셋 |

### 동적 섹션 목록 처리

> ⚠️ **섹션 개수는 프로젝트마다 다름!** core1~core3이 아닌 core1~core7일 수도 있음

**섹션 목록 확인 방법:**
```javascript
// scenes.json에서 동적으로 읽기
const sections = Object.keys(scenes.meta.sections);
// → ["hook", "background", "core1", "core2", ..., "core7", "insight", "outro"]
```

**절대 하드코딩 금지:**
```
// ❌ 잘못된 예시
1. "core1 섹션 scene-coder 실행"
2. "core2 섹션 scene-coder 실행"
3. "core3 섹션 scene-coder 실행"  // core7까지 있으면 누락!

// ✅ 올바른 예시
scenes.json의 meta.sections 키 목록을 순회하며 호출
```

### Part 동적 분할 (씬 개수 기준)

> **scene-director가 씬 분할 완료 시 state.json에 parts 정보 자동 생성**

**Part 동적 분할 로직:**
```
규칙: Part당 최대 10개 씬 (섹션 경계 유지)

1. 섹션 순서대로 누적
2. 누적 씬 개수가 10개 초과 시 → 새 Part 시작
3. 단, 섹션은 쪼개지 않음 (섹션 경계 유지)
```

**예시 (core7까지, 총 48개 씬):**
```json
"sections": {
  "all": ["hook", "background", "core1", ..., "core7", "insight", "outro"],
  "core_count": 7,
  "max_scenes_per_part": 10,
  "parts": {
    "part1": ["hook", "background"],      // 9개 씬
    "part2-1": ["core1", "core2"],         // 9개 씬
    "part2-2": ["core3", "core4"],         // 9개 씬
    "part2-3": ["core5", "core6"],         // 8개 씬
    "part2-4": ["core7"],                  // 5개 씬
    "part3": ["insight", "outro"]          // 9개 씬
  }
}
```

### scene-coder 호출 규칙 (필수!)

> ⚠️ **Part당 최대 10개 씬** (섹션별 개별 호출 금지!)

| 규칙 | 설명 |
|------|------|
| **한 Part = 한 Task 호출** | Part 내 모든 씬을 한 번에 처리 (최대 10개) |
| **섹션별 호출 금지** | core1, core2, core3 따로 호출 ❌ |
| **Part 완료 후 커밋** | diff 정리 → 새 세션 |

**올바른 호출 예시:**
```
# Part 2-1 (한 번의 Task 호출로 최대 10개 씬 처리)
"scene-coder 에이전트로 Part 2-1 실행
섹션: core1, core2
씬: S10~S18 (9개)"
```

**잘못된 호출 예시:**
```
# ❌ 섹션별 개별 호출 (Task 3번 = diff 3번 누적)
"core1 섹션 scene-coder 실행"
"core2 섹션 scene-coder 실행"
"core3 섹션 scene-coder 실행"
```

### 에이전트별 세션 분리 시점

| 에이전트 | 세션 분리 시점 |
|----------|---------------|
| **scene-director** | 모든 섹션 완료 후 |
| **scene-splitter** | 전체 완료 후 |
| **audio-splitter** | 전체 완료 후 |
| **scene-coder** | **Part별** 완료 후 (state.json의 parts 참조) |

---

## 카테고리별 아트 스타일

> ⚠️ **모든 에이전트/스킬은 state.json의 `category`를 확인하고 해당 스타일을 적용해야 합니다!**

| Category | 아트 스타일 | 설명 |
|----------|-------------|------|
| `history` | **전통 동양화 (수묵담채)** | 수묵화/민화 느낌, 담채 색감, 붓터치 질감 |
| `food` | 애니메이션 스타일 | 따뜻한 색감, 깔끔한 라인, 부드러운 쉐이딩 |
| `culture` | 애니메이션 스타일 | 모던 한국 애니메이션 느낌 |
| `science` | 애니메이션 스타일 | 클린 인포그래픽, 테크 일러스트 |
| `economy` | 애니메이션 스타일 | 프로페셔널, 비즈니스 일러스트 |

**스타일 적용 위치:**
- `scene-director.md` → bg_prompts.json 생성 시
- `asset-checker/SKILL.md` → element_prompts.json 생성 시

---

## 디렉토리 구조

```
HISTORY_VIDEO_MAKER/
├── CLAUDE.md                    # 이 파일
├── pipeline.py                  # 메인 CLI
│
├── .claude/
│   ├── skills/
│   │   ├── script-writer/       # 대본 작성 스킬
│   │   │   └── SKILL.md
│   │   ├── asset-checker/       # 에셋 확인/프롬프트 생성 스킬
│   │   │   └── SKILL.md
│   │   └── remotion/            # Remotion 코딩 규칙
│   │       ├── SKILL.md
│   │       └── rules/           # 상세 규칙 파일들
│   │
│   └── agents/
│       ├── scene-director.md    # 씬 분할 에이전트
│       ├── audio-splitter.md    # 오디오 분할 시점 결정 에이전트
│       ├── scene-splitter.md    # 자막 타이밍 에이전트
│       └── scene-coder.md       # Remotion 코드 에이전트
│
├── assets/                      # 시각 에셋 (공용)
│   ├── icons/
│   ├── portraits/
│   ├── maps/
│   ├── images/
│   ├── artifacts/
│   └── backgrounds/
│
├── BGM/                         # 배경음악
├── Transition/                  # 전환 효과음
│
├── remotion/
│   ├── src/
│   │   ├── scenes/              # S1.tsx ~ SN.tsx
│   │   ├── transitions/         # T1.tsx ~ T6.tsx
│   │   ├── components/
│   │   └── Root.tsx
│   └── public/assets/           # 에셋 심볼릭 링크
│
└── output/
    ├── state.json               # 프로젝트 상태 (diff 방지용 위치)
    ├── asset_catalog.csv        # 에셋 카탈로그 (CSV 테이블)
    │
    ├── 1_scripts/               # Phase 1-2, 2.5 출력
    │   ├── reading_script.json  # 전체 대본
    │   ├── scenes.json          # 씬 목록
    │   ├── scenes_minimal.json  # 경량 씬 데이터
    │   ├── s1.json ~ sN.json    # 개별 씬 상세
    │   ├── bg_prompts.json      # 배경 프롬프트
    │   └── element_prompts.json # 에셋 생성 프롬프트
    │
    ├── 2_audio/                 # Phase 3 출력
    │   ├── {section}.mp3        # TTS 음성
    │   ├── {section}_whisper.json
    │   ├── {section}_timestamps.json
    │   ├── s{n}_timed.json      # 씬별 타이밍
    │   └── s{n}.srt             # 씬별 자막
    │
    ├── 3_backgrounds/           # 배경 이미지 (수동)
    │   └── bg_s{n}.png
    │
    ├── 5_renders/               # Phase 5 출력
    │   └── s{n}_raw.mp4         # Remotion 렌더링 (투명)
    │
    ├── 6_scenes/                # 배경+자막 합성
    │   └── s{n}.mp4
    │
    ├── 6_sections/              # 섹션 합성본
    │   └── section_*.mp4
    │
    └── final_video.mp4
```

---

## 6단계 워크플로우

### Phase 1: SCRIPT (대본)

```
담당: script-writer 스킬
입력: 주제 + 카테고리 + 분량
출력:
  - output/1_scripts/approved_script.txt (1차 승인 - 텍스트 대본)
  - output/1_scripts/reading_script.json (2차 승인 - 구조화된 대본)
```

**워크플로우 (2단계 승인):**

```
[Step 1] 시작
    ↓
[Step 2] 주제/카테고리/분량 질문 (AskUserQuestion)
    ↓
[Step 3] 주제 제시 및 확인
    ↓
[Step 4] 대본 초안 작성 → 화면에 표시 (파일 저장 X)
    ↓
[Step 5] 사용자 피드백 → 수정 반복
    ↓
[Step 6] 1차 승인 → approved_script.txt 저장
    ↓
[Step 7] 사용자가 파일 확인 → 추가 수정 요청 가능
    ↓
[Step 8] 2차 승인 → reading_script.json 저장
    ↓
[Step 9] state.json 업데이트
    ↓
[Phase 2로 진행]
```

> ⚠️ **1차 승인 없이 approved_script.txt 저장 금지!**
> ⚠️ **2차 승인 없이 reading_script.json 저장 금지!**

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "script_completed"
updated_at: {현재 시간}
```

**Step 2: 질문 예시**
```
- 채널 이름: (예: "세상에 이런 역사", "오늘의 음식 이야기")
- 카테고리: history / food / culture / science / economy
- 주제: 직접 입력 또는 추천
- 분량: 2분 / 3분 / 5분
```

> 채널 이름은 아웃트로 엔딩 멘트에 활용됩니다.
> 예: "{채널명}였습니다!" 또는 고정 엔딩 멘트 설정

**Step 6: approved_script.txt 형식 (1차 승인 후 저장)**
```
================================================================================
VIDEO SCRIPT - DRAFT APPROVED
================================================================================
Topic: 한양의 노른자 땅을 산 '똥지기'
Category: history
Duration: ~2min
================================================================================

[HOOK]
여러분, 오늘날 서울 강남 땅 부러우시죠?...

[BACKGROUND]
15세기 초 10만 명이던 한양의 인구는...

[CORE1]
그런데 여기서 반전!...

[CORE2]
바로 여기서 매분자들의 비즈니스 모델이...

[CORE3]
매분자들의 존재는 도시 위생과...

[INSIGHT]
박지원이 엄행수를 '예덕선생'이라 부른...

[OUTRO]
오늘 우리 주변에도 이런 '황금 똥'...

================================================================================
```

**Step 8: reading_script.json 구조 (2차 승인 후 저장)**
```json
{
  "meta": {
    "category": "food",
    "topic": "라면은 어쩌다 국민음식이 되었나",
    "duration_target": 300
  },
  "sections": [
    { "id": "hook", "content": "...", "narration_tts": "...", "visual_hint": "..." },
    { "id": "background", ... },
    { "id": "core1", ... },
    { "id": "core2", ... },
    { "id": "core3", ... },
    { "id": "insight", ... },
    { "id": "outro", ... }
  ],
  "transitions": [
    { "from": "hook", "to": "background", "text": "그 시작은..." },
    ...
  ]
}
```

**카테고리:**
- `history`: 역사
- `food`: 음식/식문화
- `culture`: 문화/사회
- `science`: 과학/기술
- `economy`: 경제/비즈니스
- `psychology`: 심리/행동
- `lifestyle`: 일상/생활

---

### Phase 2: STRUCTURE (씬 분할)

```
담당: scene-director 에이전트
입력: reading_script.json + asset_catalog.csv
출력:
  - output/1_scripts/scenes.json (전체 씬 목록)
  - output/1_scripts/s1.json ~ sN.json (개별 씬 상세)
  - output/1_scripts/bg_prompts.json (배경 프롬프트)
```

**s{n}.json 구조:**
```json
{
  "scene_id": "s1",
  "section": "hook",
  "narration": "영하 20도. 보일러도 없고...",
  "narration_tts": "영하 이십 도... 보일러도 없고...",
  "subtitle_segments": ["영하 20도.", "보일러도 없고..."],
  "bg_id": "winter_intro",
  "bg_description": "눈 내리는 겨울 풍경",
  "elements": [
    { "id": "thermometer", "type": "icon", "asset": "thermometer_icon" }
  ],
  "animation_hints": ["thermometer: fadeIn", "camera: slow zoom"]
}
```

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "scenes_completed"
scenes_count: {씬 개수}
updated_at: {현재 시간}
```

---

### Phase 2.5: ASSETS (에셋 준비)

```
담당: asset-checker 스킬
입력: s1.json ~ sN.json (elements 필드) + bg_prompts.json
출력:
  - assets/{type}/*.png (다운로드된 에셋)
  - output/3_backgrounds/bg_s{n}.png (배경 이미지)
  - output/1_scripts/element_prompts.json (생성 필요한 에셋 프롬프트)
  - output/asset_catalog.csv (최종 에셋 카탈로그)
```

**워크플로우:**

```
[Step 1] 씬 파일에서 필요한 에셋 목록 추출
    ↓
[Step 2] 에셋 DB 조회 (기존 에셋 있는지 확인)
    ↓
[Step 3-A] 있으면: assets/ 폴더에 다운로드
[Step 3-B] 없으면: 프롬프트 작성 준비
    ↓
[Step 3.5] ★ 배경 색상 분석 → Element 색상 전략 결정
    ↓
[Step 4] element_prompts.json 생성 (배경 대비 색상 포함)
    ↓
[Step 5] 사용자에게 "에셋 준비 필요" 목록 표시
    ↓
[Step 6] 사용자가 외부에서 에셋 생성 (수동)
    ↓
[Step 7] "에셋 준비 완료" 입력 시 검증
    ↓
[Step 8] asset_catalog.csv 생성/업데이트
    ↓
[Phase 3로 진행]
```

> ⚠️ **Step 3.5 필수**: Element 프롬프트는 배경 색상을 분석하여 **대비되는 색상**으로 작성해야 가시성 확보됨. 상세 가이드는 `.claude/skills/asset-checker/SKILL.md` 참조.

**에셋 타입별 요구사항:**

| 타입 | 저장 위치 | 이미지 규칙 |
|------|-----------|-------------|
| icons | assets/icons/ | 투명 배경 PNG, 512x512 권장 |
| portraits | assets/portraits/ | 투명 배경 PNG, 인물 중심 |
| maps | assets/maps/ | 투명 배경 PNG, 지도/다이어그램 |
| backgrounds | output/3_backgrounds/ | **단색 배경**, 1920x1080, 글자 없음 |
| artifacts | assets/artifacts/ | 투명 배경 PNG, 유물/물건 |

**⚠️ 배경 이미지 규칙:**
- ✅ 단색 또는 그라데이션 배경 (오버레이 잘 됨)
- ✅ 텍스처/패턴 가능 (너무 복잡하지 않게)
- ❌ 글자/텍스트 포함 금지
- ❌ 너무 복잡한 디테일 지양

**element_prompts.json 구조:**
```json
{
  "elements": [
    {
      "id": "thermometer_icon",
      "type": "icon",
      "used_in": ["s1"],
      "prompt": "A vintage thermometer showing freezing temperature, flat icon style, transparent background, 512x512",
      "style_hints": ["flat", "vintage", "korean historical"],
      "status": "pending"
    }
  ],
  "backgrounds": [
    {
      "id": "bg_s1",
      "scene": "s1",
      "prompt": "Snowy winter landscape at dawn, soft gradient sky, NO TEXT, minimal details, 1920x1080",
      "style_hints": ["atmospheric", "muted colors"],
      "status": "pending"
    }
  ]
}
```


**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "assets_ready"
updated_at: {현재 시간}
```

---

### Phase 3: AUDIO (음성 + 타이밍)

```
담당: Python CLI + scene-splitter 에이전트 + audio-splitter 에이전트
```

**Step 3-1: TTS 생성 (Python)**
```bash
python pipeline.py audio --voice nova
```
- 섹션별 TTS 생성 → `{section}.mp3`
- Whisper 타임스탬프 추출 → `{section}_whisper.json`

**Step 3-2: 자막 타이밍 매칭 (에이전트)**
```
scene-splitter 에이전트 × 섹션 수만큼 순차 호출
```
- Whisper words ↔ subtitle_segments 의미적 매칭
- 출력: `output/2_audio/s{n}_timed.json`, `output/2_audio/s{n}.srt`

**Step 3-3: 오디오 분할 시점 결정 (에이전트)**
```
audio-splitter 에이전트: 섹션별 오디오를 씬 단위로 분할할 시점 결정
```
- 입력: `scenes_{section}.json`, `{section}_timestamps.json`, `scenes.json`
- 출력: `split_points_{section}.json`

**s{n}_timed.json 구조:**
```json
{
  "scene_id": "s1",
  "section": "hook",
  "duration": 5.13,
  "subtitle_segments": [
    { "index": 1, "text": "영하 20도.", "start": 0.0, "end": 0.9 },
    { "index": 2, "text": "보일러도 없고...", "start": 1.2, "end": 3.1 }
  ]
}
```

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "audio_completed"
updated_at: {현재 시간}
```

---

### Phase 4: CODE (Remotion 코드)

```
담당: scene-coder 에이전트
참조:
  - remotion/src/lib/styles.ts (크기/스타일 상수 - 필수 import!)
  - remotion/src/lib/animations.ts (공통 애니메이션 유틸리티 - 권장 import)
  - .claude/skills/remotion/SKILL.md (Remotion 베스트 프랙티스)
입력: s{n}_timed.json + s{n}.json + asset_catalog.csv
출력:
  - remotion/src/scenes/S1.tsx ~ SN.tsx
  - remotion/src/transitions/T1.tsx ~ T6.tsx (선택)
```

**핵심 규칙:**
- ✅ **styles.ts import 필수** (크기 상수 중앙 관리)
- ✅ **animations.ts import 권장** (공통 애니메이션 유틸리티)
- ✅ **배경 이미지 포함** (Remotion에서 직접 렌더링)
- ✅ 자막 Remotion 내부 처리 (captions 배열)
- ✅ interpolate에 extrapolate 옵션 필수
- ❌ **숫자 하드코딩 금지** (FONT_SIZES, IMAGE_SIZES 상수 사용)
- ❌ CSS 애니메이션 금지

**styles.ts 상수 (크기 변경 시 한 곳만 수정):**
| 상수 | 주요 값 |
|------|---------|
| `FONT_SIZES` | caption(45), title(72), highlight(96), hero(120) |
| `IMAGE_SIZES` | icon(120), portrait(280), map(500) |
| `CAPTION_STROKE` | 자막용 흰 테두리 |
| `TEXT_STROKE` | 일반 텍스트용 검은 테두리 |

**animations.ts 유틸리티 (코드 간결화):**
| 함수 | 용도 |
|------|------|
| `fadeIn(frame, start, duration)` | 페이드인 |
| `fadeOut(frame, start, duration)` | 페이드아웃 |
| `slideInLeft/Right(frame, start, duration)` | 슬라이드 인 |
| `scaleIn(frame, start, duration)` | 크기 확대 (탄성) |
| `cameraZoom(frame, start, duration, from, to)` | 카메라 줌 |
| `cameraPan(frame, start, duration, ...)` | 카메라 팬 |
| `pulse(frame, start, cycle)` | 반복 펄스 |

**Root.tsx 자동 업데이트:**
```bash
python pipeline.py update-root
```

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "code_completed"
updated_at: {현재 시간}
```

---

### Phase 5: RENDER (렌더링 + 합성)

```
담당: Python CLI
```

**Step 5-0a: 에셋 동기화 (필수!)**

> ⚠️ **Remotion Studio 실행 전 반드시 에셋을 동기화해야 합니다!**
> `staticFile()`은 `remotion/public/` 폴더만 참조하므로, 프로젝트 에셋을 복사해야 합니다.

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

# 캐시 삭제 (새 에셋 인식을 위해)
rm -rf remotion/node_modules/.cache
```

> 💡 **참고:** 배경 이미지는 Remotion에서 직접 렌더링됩니다. (FFmpeg 합성 단계 생략)

**에셋 경로 구조:**
| 원본 위치 | Remotion 위치 | staticFile 경로 |
|-----------|---------------|-----------------|
| `assets/icons/` | `remotion/public/assets/icons/` | `staticFile("assets/icons/...")` |
| `assets/portraits/` | `remotion/public/assets/portraits/` | `staticFile("assets/portraits/...")` |
| `assets/maps/` | `remotion/public/assets/maps/` | `staticFile("assets/maps/...")` |
| `assets/artifacts/` | `remotion/public/assets/artifacts/` | `staticFile("assets/artifacts/...")` |
| `assets/images/` | `remotion/public/assets/images/` | `staticFile("assets/images/...")` |
| `output/3_backgrounds/` | `remotion/public/assets/backgrounds/` | `staticFile("assets/backgrounds/bg_s{n}.png")` |

**Step 5-0b: Remotion Studio 시각적 검증 (필수)**

> ⚠️ **렌더링 전 시각적 검증은 필수입니다. 생략 불가!**

```bash
cd remotion && npm run dev
# → http://localhost:3000 에서 실시간 프리뷰
```

**워크플로우 (Claude MCP 브라우저 활용):**
1. 사용자가 Remotion 서버 실행 (`npm run dev`)
2. Claude가 브라우저로 `http://localhost:3000` 접속
3. **모든 씬(S1 ~ SN) 순차 검증:**
   - 프레임 0, 중간, 끝 지점에서 스크린샷 촬영
   - 요소 표시 여부 확인
   - 콘솔 에러 확인
4. 문제 발견 시 TSX 코드 자동 수정
5. Hot Reload로 즉시 반영 → 재확인
6. **모든 씬 검증 완료 후에만 렌더링 진행**

**검증 체크리스트:**
- [ ] 이미지/아이콘이 정상 로딩되는가?
- [ ] 자막이 표시되는가?
- [ ] **배경 이미지가 정상 표시되는가?**
- [ ] 콘솔에 에러가 없는가?
- [ ] 요소가 화면 안에 있는가?

**요구사항:**
- ✅ **Claude_in_Chrome MCP 필수** (브라우저 제어용)
- ✅ **시각적 검증 없이 렌더링 진행 금지**

**Step 5-1: Remotion 렌더링 (배경 포함)**
```bash
python pipeline.py render              # 전체 (배경 포함, 기본)
python pipeline.py render --section hook  # 섹션별
python pipeline.py render --transparent   # 투명 렌더링 (호환용)
```
- 기본 출력: `output/6_scenes/s{n}.mp4` (배경 포함, 직접 출력)
- 투명 출력: `output/5_renders/s{n}_raw.webm` (FFmpeg 합성 필요)

**Step 5-2: FFmpeg 배경 합성 (투명 렌더링 시에만)**
```bash
python pipeline.py composite  # --transparent로 렌더링한 경우만 필요
```
- 배경(3_backgrounds) + 투명렌더링(5_renders)
- 출력: `output/6_scenes/s{n}.mp4`

> 💡 **참고:** 기본 렌더링(배경 포함)을 사용하면 이 단계는 **생략**됩니다.

**Step 5-3: 섹션 합성 (concat + audio)**
```bash
python pipeline.py section-merge
```
- 씬 concat + 오디오 → `output/6_sections/section_*.mp4`

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "render_completed"
updated_at: {현재 시간}
```

---

### Phase 6: FINAL (최종 병합)

```bash
python pipeline.py final --bgm-volume 0.08
```

**처리:**
1. 섹션 직접 연결 (전환 클립 미사용)
2. 섹션 간 gap 추가 (기본 1초, 마지막 프레임 유지)
3. BGM 믹싱 (볼륨 조절)

**출력:** `output/final_video.mp4`

**⚠️ Phase 완료 후 필수:**
```bash
# state.json 업데이트
phase: "finished"
updated_at: {현재 시간}
```

---

## CLI 명령어 요약

```bash
# Phase 1: 대본
# → script-writer 스킬 사용 (메인 대화에서 직접)

# Phase 2: 씬 분할
# → scene-director 에이전트 호출

# Phase 2.5: 에셋 준비
# → asset-checker 스킬 사용 (메인 대화에서 직접)
# → 사용자가 외부에서 이미지 생성 후 "에셋 준비 완료" 입력

# Phase 3: 오디오
python pipeline.py audio --voice nova   # TTS + Whisper
# → audio-splitter 에이전트 (오디오 분할 시점)
# → scene-splitter 에이전트 × 섹션 수만큼 순차 호출

# Phase 4: 코드
# → scene-coder 에이전트 × Part 단위 호출
python pipeline.py update-root          # Root.tsx 업데이트

# Phase 5: 렌더링
# Step 5-0a: 에셋 동기화 (필수!)
cp assets/icons/*.png remotion/public/assets/icons/
cp assets/maps/*.png remotion/public/assets/maps/
cp assets/portraits/*.png remotion/public/assets/portraits/
cp assets/artifacts/*.png remotion/public/assets/artifacts/
mkdir -p remotion/public/assets/images && cp assets/images/*.png remotion/public/assets/images/
# ★ 배경 이미지 동기화 (배경 포함 렌더링)
mkdir -p remotion/public/assets/backgrounds
cp output/3_backgrounds/bg_s*.png remotion/public/assets/backgrounds/
rm -rf remotion/node_modules/.cache

# Step 5-0b: 시각적 검증 (필수!)
cd remotion && npm run dev
# → Claude가 브라우저로 모든 씬 검증 후 진행
python pipeline.py render               # Step 5-1: Remotion 렌더링 (배경 포함)
# python pipeline.py composite          # Step 5-2: 생략 (배경 포함 렌더링 시)
python pipeline.py section-merge        # Step 5-3: 섹션 합성

# Phase 6: 최종
python pipeline.py final                # 섹션 연결 + BGM 병합

# 유틸리티
python pipeline.py validate-parts       # Part 분할 정보 검증
python pipeline.py status               # 프로젝트 상태 확인
```

---

## 에이전트/스킬 호출 가이드

### scene-director (Phase 2)
```
"scene-director 에이전트로 씬 분할 실행"
```

### asset-checker (Phase 2.5)
```
"asset-checker 스킬로 에셋 확인"
→ 필요 에셋 목록 표시
→ 사용자가 외부에서 이미지 생성
→ "에셋 준비 완료" 입력
→ 검증 후 asset_catalog.csv 업데이트
```

### scene-splitter (Phase 3, 순차)
```
섹션 목록을 scenes.json에서 동적으로 읽어서 순차 호출:

1. scenes.json의 meta.sections 키 목록 확인
2. 각 섹션별로 순차 호출:
   "{섹션명} 섹션 scene-splitter 실행"

예시 (core7까지 있는 경우):
→ hook, background, core1, core2, core3, core4, core5, core6, core7, insight, outro
→ 총 11개 섹션 순차 호출
```

### scene-coder (Phase 4, Part 단위 호출)

> ⚠️ **Part당 최대 10개 씬!** 섹션별 개별 호출 금지!

**호출 방법:**
```
# state.json의 sections.parts와 part_scenes를 확인하여 호출
# Part당 씬 개수가 10개 이하인지 확인!

예시: Part 2-2 호출
"scene-coder 에이전트로 Part 2-2 실행
섹션: core3, core4
씬: S19~S27 (9개)"
```

**워크플로우:**
```
1. state.json의 code_progress.current_part 확인
2. sections.parts[current_part]에서 섹션 목록 확인
3. sections.part_scenes[current_part]에서 씬 목록 확인 (10개 이하)
4. 한 번의 Task 호출로 Part 전체 처리
5. 완료 후 커밋 → 새 세션
```

**절대 금지:**
```
❌ "core1 섹션 scene-coder 실행"
❌ "core2 섹션 scene-coder 실행"
❌ "core3 섹션 scene-coder 실행"
(Task 3번 호출 = diff 3번 누적 = 토큰 낭비)
```

### youtube-uploader (Phase 6 완료 후)

> 영상 완성 후 유튜브 업로드 메타데이터 생성

**트리거:**
```
"유튜브 업로드" 또는 "youtube-uploader"
```

**출력:**
- 제목 3가지 (메인/클릭유도형/교육형)
- 설명 (타임라인 포함)
- 태그 20~30개
- 썸네일 프롬프트 3개 + 한글 텍스트 오버레이 제안
- 업로드 설정 체크리스트
- `output/script_text.txt` (대본 전문)

**필수 조건:**
- `output/1_scripts/reading_script.json` 필요 (Phase 1 완료)
- `output/2_audio/s*_timed.json` 필요 (타임라인 계산용, Phase 3 완료)

---

## 처리 위치 요약

| 요소 | Remotion | FFmpeg |
|------|----------|--------|
| 씬 애니메이션 | ✅ | |
| 자막 | ✅ | |
| **배경 이미지** | ✅ | |
| 오디오 합성 | | ✅ |
| 섹션 연결 | | ✅ |
| BGM 믹싱 | | ✅ |

> **참고**: 전환 클립은 사용하지 않음 - 섹션 간 직접 연결 (gap으로 자연스러운 전환)
> **참고**: 배경 이미지는 Remotion에서 직접 포함하여 렌더링 (FFmpeg 합성 단계 생략)

---

## state.json

> **위치: `output/state.json`** (diff 추적 방지를 위해 output 폴더에 배치)

### 기본 구조

```json
{
  "project_id": "uuid",
  "category": "food",
  "topic": "라면의 역사",
  "duration_target": 300,
  "aspect_ratio": "16:9",
  "voice": "nova",
  "phase": "script_completed",
  "current_step": 1,
  "scenes_count": 0,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### sections 구조 (scene-director 완료 시 자동 생성)

> ⚠️ **scene-director가 씬 분할 완료 시 반드시 이 구조를 state.json에 추가!**

```json
{
  "sections": {
    "all": ["hook", "background", "core1", "core2", "core3", "core4", "core5", "core6", "core7", "insight", "outro"],
    "core_count": 7,
    "max_scenes_per_part": 10,
    "parts": {
      "part1": ["hook", "background"],
      "part2-1": ["core1", "core2"],
      "part2-2": ["core3", "core4"],
      "part2-3": ["core5", "core6"],
      "part2-4": ["core7"],
      "part3": ["insight", "outro"]
    },
    "part_scenes": {
      "part1": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"],
      "part2-1": ["s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18"],
      "part2-2": ["s19", "s20", "s21", "s22", "s23", "s24", "s25", "s26", "s27"],
      "part2-3": ["s28", "s29", "s30", "s31", "s32", "s33", "s34", "s35"],
      "part2-4": ["s36", "s37", "s38", "s39"],
      "part3": ["s40", "s41", "s42", "s43", "s44", "s45", "s46", "s47", "s48"]
    }
  },
  "code_progress": {
    "completed_parts": ["part1", "part2-1"],
    "completed_sections": ["hook", "background", "core1", "core2"],
    "current_part": "part2-2",
    "remaining_parts": ["part2-2", "part2-3", "part2-4", "part3"]
  }
}
```

**Part 동적 분할 규칙:**
```
규칙: Part당 최대 10개 씬 (섹션 경계 유지)

1. 섹션 순서대로 누적
2. 누적 씬 개수가 10개 초과 시 → 새 Part 시작
3. 단, 섹션은 쪼개지 않음 (섹션 경계 유지)
```

**Phase 값:**
| Phase | 설명 | 다음 단계 |
|-------|------|-----------|
| `initialized` | 프로젝트 생성 | Phase 1 |
| `script_completed` | 대본 완료 | Phase 2 |
| `scenes_completed` | 씬 분할 완료 | Phase 2.5 |
| `assets_ready` | 에셋 준비 완료 | Phase 3 |
| `audio_completed` | 오디오 완료 | Phase 4 |
| `code_in_progress` | 코드 진행 중 | Phase 4 계속 |
| `code_completed` | 코드 완료 | Phase 5 |
| `render_completed` | 렌더링 완료 | Phase 6 |
| `finished` | 최종 완료 | - |

> ⚠️ **모든 Phase 완료 시 state.json 업데이트 필수!**

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 배경 안보임 | 경로/동기화 문제 | 에셋 동기화 확인, staticFile 경로 확인 |
| 이상한 애니메이션 값 | extrapolate 미설정 | clamp 옵션 추가 |
| 에셋 404 | 경로 불일치 | asset_catalog.csv 확인 |
| Hook 에러 | 조건문 안에서 Hook | 최상위로 이동 |
| 자막 안보임 | zIndex 문제 | zIndex: 1000 설정 |
| Whisper 매칭 실패 | 숫자/기호 변환 | scene-splitter 재실행 |

---

## 프로젝트 초기화

```bash
# output만 정리 (에셋 유지)
python pipeline.py clean

# 완전 초기화 (에셋 포함, 새 프로젝트 시작 시)
python pipeline.py init
```

`init` 명령은 다음을 정리합니다:
- `output/` 전체 폴더
- `remotion/src/scenes/*.tsx`
- `remotion/src/Root.tsx` (빈 템플릿으로)
- `state.json` (초기 상태로)

⚠️ `assets/` 폴더는 유지됩니다 (재사용 가능한 에셋)

---

## 시작하기

```
"시작" 입력 시 워크플로우:

Phase 1: 대본
1. 카테고리 선택 (history/food/culture/science/economy)
2. 주제 입력 또는 추천 요청
3. 분량 선택 (2분/3분/5분)
4. 대본 초안 작성 및 표시
5. 수정 피드백 → 수정 반복
6. ★ 1차 승인 → approved_script.txt 저장
7. 파일 확인 → 추가 수정 가능
8. ★ 2차 승인 → reading_script.json 저장
9. state.json 업데이트 → script_completed

Phase 2: 씬 분할
10. scene-director 에이전트 실행
11. s1.json ~ sN.json 생성
12. state.json 업데이트 → scenes_completed

Phase 2.5: 에셋 준비
13. asset-checker 스킬 실행
14. 필요 에셋 목록 표시 (element_prompts.json)
15. 사용자가 외부에서 이미지 생성 (수동)
16. "에셋 준비 완료" 입력 → 검증
17. asset_catalog.csv 업데이트
18. state.json 업데이트 → assets_ready

Phase 3~6: 오디오/코드/렌더링/최종 진행
```

**빠른 시작 (주제 직접 입력):**
```
"조선시대 배달음식의 역사" → Phase 1 Step 3부터 시작
```
