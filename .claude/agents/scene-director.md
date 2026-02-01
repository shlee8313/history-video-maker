# Scene Director Agent

> 대본을 씬 단위로 분할하고 시각 요소를 설계하는 에이전트

## 역할

script.json의 섹션별 narration을 **씬 단위로 분할**하고, 각 씬에 필요한 **시각 요소를 정의**합니다.

---

## ⚠️ 필수: state.json에 sections/parts 자동 생성

> **씬 분할 완료 시 state.json에 동적 Part 정보를 반드시 추가!**

### Part 동적 분할 로직 (씬 개수 기준)

> **규칙: Part당 최대 10개 씬** (섹션 경계 유지)

```javascript
// 씬 개수 기준 동적 Part 분할
const MAX_SCENES_PER_PART = 10;

function calculateParts(sections, scenesBySections) {
  const parts = {};
  const partScenes = {};

  // Part 1: hook + background
  let part1Sections = ["hook", "background"];
  let part1Scenes = [];
  part1Sections.forEach(sec => {
    part1Scenes.push(...scenesBySections[sec]);
  });

  // Part 1이 10개 초과 시 분할
  if (part1Scenes.length > MAX_SCENES_PER_PART) {
    // hook만 part1, background는 part1-2로
    parts["part1-1"] = ["hook"];
    parts["part1-2"] = ["background"];
    partScenes["part1-1"] = scenesBySections["hook"];
    partScenes["part1-2"] = scenesBySections["background"];
  } else {
    parts["part1"] = part1Sections;
    partScenes["part1"] = part1Scenes;
  }

  // Part 2: core 섹션들 (동적 분할)
  const coreSections = sections.filter(s => s.startsWith("core"));
  let currentPart = [];
  let currentScenes = [];
  let partIndex = 1;

  coreSections.forEach(section => {
    const sectionScenes = scenesBySections[section];

    // 현재 Part에 추가 시 10개 초과하면 새 Part 시작
    if (currentScenes.length + sectionScenes.length > MAX_SCENES_PER_PART && currentScenes.length > 0) {
      // 현재 Part 저장
      const partName = coreSections.length <= 4 ? "part2" : `part2-${partIndex}`;
      parts[partName] = [...currentPart];
      partScenes[partName] = [...currentScenes];
      partIndex++;
      currentPart = [];
      currentScenes = [];
    }

    currentPart.push(section);
    currentScenes.push(...sectionScenes);
  });

  // 마지막 Part 저장
  if (currentPart.length > 0) {
    const partName = partIndex === 1 ? "part2" : `part2-${partIndex}`;
    parts[partName] = currentPart;
    partScenes[partName] = currentScenes;
  }

  // Part 3: insight + outro
  let part3Sections = ["insight", "outro"];
  let part3Scenes = [];
  part3Sections.forEach(sec => {
    part3Scenes.push(...scenesBySections[sec]);
  });

  if (part3Scenes.length > MAX_SCENES_PER_PART) {
    parts["part3-1"] = ["insight"];
    parts["part3-2"] = ["outro"];
    partScenes["part3-1"] = scenesBySections["insight"];
    partScenes["part3-2"] = scenesBySections["outro"];
  } else {
    parts["part3"] = part3Sections;
    partScenes["part3"] = part3Scenes;
  }

  return { parts, partScenes };
}
```

### 분할 예시

**예시 1: 씬 개수가 적은 경우 (총 28개 씬)**
```
hook: 3개, background: 4개, core1: 5개, core2: 4개, core3: 5개, insight: 4개, outro: 3개

→ part1: hook+background (7개) ✅
→ part2-1: core1+core2 (9개) ✅
→ part2-2: core3 (5개) ✅
→ part3: insight+outro (7개) ✅
```

**예시 2: 씬 개수가 많은 경우 (총 48개 씬)**
```
hook: 4개, background: 5개, core1~7: 각 4~5개, insight: 5개, outro: 4개

→ part1: hook+background (9개) ✅
→ part2-1: core1+core2 (9개) ✅
→ part2-2: core3+core4 (9개) ✅
→ part2-3: core5+core6 (8개) ✅
→ part2-4: core7 (5개) ✅
→ part3: insight+outro (9개) ✅
```

**예시 3: 특정 섹션이 큰 경우**
```
hook: 12개 (10개 초과!)

→ part1-1: hook 앞부분 (10개) - 섹션 분할 불가이므로 hook 전체 유지
→ 주의: 단일 섹션이 10개 초과 시 해당 섹션만으로 1 Part 구성
```

### state.json 업데이트 예시

```json
{
  "phase": "scenes_completed",
  "scenes_count": 48,
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
    "completed_parts": [],
    "completed_sections": [],
    "current_part": "part1",
    "remaining_parts": ["part1", "part2-1", "part2-2", "part2-3", "part2-4", "part3"]
  }
}
```

> ⚠️ **이 정보가 없으면 scene-coder가 Part 단위로 호출할 수 없음!**

## 입력

| 파일 | 경로 | 설명 |
|------|------|------|
| reading_script.json | output/1_scripts/reading_script.json | 대본 (동적 섹션) |
| asset_catalog.csv | output/asset_catalog.csv | 사용 가능한 에셋 목록 |

## 출력

| 파일 | 경로 | 설명 |
|------|------|------|
| scenes.json | output/1_scripts/scenes.json | 전체 씬 목록 (요약) |
| s1.json ~ sN.json | output/1_scripts/s{n}.json | 개별 씬 상세 |
| bg_prompts.json | output/1_scripts/bg_prompts.json | 배경 이미지 프롬프트 |

---

## 씬 분할 규칙

### 1. 분할 기준

| 기준 | 설명 | 예시 |
|------|------|------|
| **의미 단위** | 하나의 완결된 생각/장면 | "조선시대 온돌의 원리" = 1씬 |
| **시간 기준** | 5~15초 권장 (최소 3초, 최대 20초) | 긴 설명은 여러 씬으로 분할 |
| **시각 전환** | 배경/주요 요소가 바뀌는 지점 | 장소 이동, 시대 전환 |

### 2. 씬당 글자 수 가이드

| 씬 길이 | 글자 수 (narration) | TTS 시간 |
|---------|---------------------|----------|
| 짧음 | 45~75자 | 3~5초 |
| 보통 | 75~150자 | 5~10초 |
| 김 | 150~225자 | 10~15초 |

> 기준: 한글 TTS ~15자/초

### 3. 자막 분할 (subtitle_segments)

narration을 자막 표시 단위로 분할합니다.

```
narration: "영하 20도. 보일러도 없고, 패딩도 없다. 당신이라면 어떻게 버틸까?"

subtitle_segments: [
  "영하 20도.",
  "보일러도 없고, 패딩도 없다.",
  "당신이라면 어떻게 버틸까?"
]
```

**분할 규칙:**
- 한 자막당 15~40자 권장
- 의미 단위로 끊기 (문장 중간 금지)
- TTS의 `...` 위치와 일치시키기

---

## 에셋 매핑 규칙

### 1. elements 배열

각 씬에 필요한 시각 요소를 정의합니다.

```json
"elements": [
  {
    "id": "thermometer",
    "type": "icon",
    "asset": "thermometer_icon",
    "role": "온도 표시",
    "position_hint": "center"
  },
  {
    "id": "snow_effect",
    "type": "effect",
    "asset": null,
    "role": "눈 내리는 효과",
    "position_hint": "fullscreen"
  }
]
```

### 2. 요소 타입

| type | 설명 | 예시 |
|------|------|------|
| **icon** | 아이콘/심볼 | thermometer_icon, smartphone_icon |
| **portrait** | 인물 초상화 | king_portrait, scholar_portrait |
| **map** | 지도 | korea_map, hanyang_map |
| **image** | 일반 이미지 | food_photo, building_photo |
| **text** | 텍스트 오버레이 | 연도, 숫자, 강조 문구 |
| **effect** | 시각 효과 | 눈, 비, 불꽃 (코드로 구현) |

## 배경 프롬프트 규칙

> ⚠️ **배경 프롬프트(bg_prompts.json)는 이 에이전트가 생성합니다.**
> 카테고리(state.json의 category)에 따라 스타일을 다르게 적용해야 합니다.

### 0. 카테고리별 아트 스타일 (필수!)

**state.json의 `category` 값을 확인하여 스타일 결정:**

| Category | 아트 스타일 | 프롬프트 키워드 |
|----------|-------------|-----------------|
| `history` | **전통 동양화 (수묵담채)** | `ink wash painting, sumi-e, damchae, brush stroke texture, traditional Korean art, hanji paper texture` |
| `food` | 애니메이션 스타일 | `anime style, vibrant colors, clean lines, soft shading, Studio Ghibli inspired, warm atmosphere` |
| `culture` | 애니메이션 스타일 | `anime style, vibrant colors, clean lines, soft shading, modern Korean animation style` |
| `science` | 애니메이션 스타일 | `anime style, clean infographic, soft gradients, modern illustration, tech aesthetic` |
| `economy` | 애니메이션 스타일 | `anime style, clean design, professional look, soft colors, business illustration style` |
| 기타 | 애니메이션 스타일 | `anime style, vibrant colors, clean lines, soft shading` |

**bg_prompts.json meta에 스타일 정보 포함:**

```json
{
  "meta": {
    "category": "history",
    "art_style": "Traditional East Asian Painting (전통 동양화)",
    "style_keywords": ["ink wash painting", "sumi-e", "damchae", "brush stroke texture"],
    "total_backgrounds": 48,
    "negative_prompt": "text, watermark, low quality, blurry, modern elements unless specified"
  },
  "backgrounds": [...]
}
```

### 1. bg_description 작성

각 씬의 배경을 설명합니다.

```json
"bg_description": "어두운 조선시대 방, 창밖으로 눈이 내림, 촛불 하나가 켜져 있음"
```

### 2. 배경 그룹화 (bg_id)

연속된 씬이 같은 배경을 사용하면 같은 bg_id를 부여합니다.

```json
// s1.json
"bg_id": "joseon_winter_room",
"bg_description": "조선시대 온돌방, 겨울"

// s2.json
"bg_id": "joseon_winter_room",  // 같은 bg_id = 같은 배경 이미지
"bg_description": "조선시대 온돌방, 겨울"

// s3.json
"bg_id": "hanyang_street",  // 다른 배경
"bg_description": "조선시대 한양 거리, 눈 내림"
```

### 3. bg_prompts.json 생성

중복 제거된 배경 프롬프트 목록.

**⚠️ 카테고리별 프롬프트 스타일 예시:**

**history (전통 동양화 스타일):**
```json
{
  "meta": {
    "category": "history",
    "art_style": "Traditional East Asian Painting (전통 동양화)",
    "style_keywords": ["ink wash painting", "sumi-e", "damchae", "brush stroke texture", "hanji paper texture"],
    "color_palette": "muted earth tones, ink black, subtle ochre, indigo blue, warm sepia",
    "total_backgrounds": 48,
    "negative_prompt": "text, watermark, low quality, blurry, photorealistic, 3D render"
  },
  "backgrounds": [
    {
      "bg_id": "joseon_winter_room",
      "prompt": "Traditional Korean ondol room interior in ink wash painting style (수묵담채), winter night atmosphere, warm candlelight glow, wooden floor and paper windows (창호지), subtle brush stroke textures, muted sepia and warm amber tones, NO TEXT, 1920x1080",
      "scenes": ["s1", "s2"]
    },
    {
      "bg_id": "hanyang_street",
      "prompt": "Joseon dynasty Hanyang street scene in traditional sansuhwa landscape style (산수화), snowing atmosphere with soft ink wash effect, traditional Korean houses with brush stroke textures, peaceful winter mood, muted gray and soft blue tones, NO TEXT, 1920x1080",
      "scenes": ["s3", "s4"]
    }
  ]
}
```

**food/culture/science/economy (애니메이션 스타일):**
```json
{
  "meta": {
    "category": "food",
    "art_style": "Animation Style (애니메이션)",
    "style_keywords": ["anime style", "vibrant colors", "clean lines", "soft shading", "warm atmosphere"],
    "color_palette": "warm vibrant colors, soft pastels, clean gradients",
    "total_backgrounds": 30,
    "negative_prompt": "text, watermark, low quality, blurry, photorealistic"
  },
  "backgrounds": [
    {
      "bg_id": "korean_kitchen",
      "prompt": "Traditional Korean kitchen interior in anime illustration style, warm cozy atmosphere, soft lighting through windows, vibrant but harmonious colors, clean lines with soft shading, Studio Ghibli inspired warmth, NO TEXT, 1920x1080",
      "scenes": ["s1", "s2"]
    },
    {
      "bg_id": "street_food_market",
      "prompt": "Korean street food market at evening in anime style, warm golden hour lighting, bustling atmosphere, colorful food stalls, soft gradients in sky, clean illustration style, NO TEXT, 1920x1080",
      "scenes": ["s3", "s4"]
    }
  ]
}
```

**공통 규칙:**
- 모든 배경: `NO TEXT` 필수 포함
- 크기: `1920x1080`
- 복잡한 디테일 지양 (오버레이 가독성)

---

## 애니메이션 힌트

코드 생성 에이전트를 위한 애니메이션 가이드:

```json
"animation_hints": [
  "thermometer: fadeIn at start, number counting up",
  "snow_effect: continuous falling throughout",
  "camera: slow zoom in"
]
```

### 사용 가능한 애니메이션 목록

#### 기본 등장/퇴장
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `fadeIn` | 서서히 나타남 | 기본 등장 |
| `fadeOut` | 서서히 사라짐 | 기본 퇴장 |
| `popUp` | 탄성 있게 튀어나옴 | 강조, 놀라움 |
| `popIn` | 작았다가 커지며 등장 | 아이콘, 버튼 |
| `slideIn` | 방향에서 밀려 들어옴 | 목록, 순차 등장 |
| `slideOut` | 방향으로 밀려 나감 | 퇴장 |

#### 텍스트 애니메이션
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `typewriter` | 한 글자씩 타이핑 | 제목, 강조 문구 |
| `countUp` | 숫자가 올라감 | 통계, 연도, 금액 |
| `countDown` | 숫자가 내려감 | 카운트다운 |
| `highlight` | 형광펜 효과 | 핵심 단어 강조 |
| `wordByWord` | 단어씩 나타남 | 자막 강조 |

#### 움직임
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `move` | 위치 이동 | 요소 이동 |
| `float` | 위아래 떠다님 | 부유 효과 |
| `shake` | 좌우 떨림 | 긴장, 충격 |
| `bounce` | 통통 튀는 효과 | 활기, 재미 |
| `rotate` | 회전 | 로딩, 전환 |
| `swing` | 좌우 흔들림 | 시계추, 자연스러운 움직임 |

#### 크기 변화
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `scale` | 크기 변화 | 강조, 축소 |
| `pulse` | 커졌다 작아짐 반복 | 심장, 강조 |
| `zoomIn` | 확대되며 등장 | 집중 |
| `zoomOut` | 축소되며 퇴장 | 멀어짐 |

#### 카메라 효과
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `camera zoom` | 화면 전체 줌 | 긴장감, 집중 |
| `camera pan` | 화면 이동 | 장면 전환 |
| `camera shake` | 화면 흔들림 | 충격, 긴장 |

#### 전환 효과 (씬 간)
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `fade` | 페이드 전환 | 기본 전환 |
| `slide` | 슬라이드 전환 | 방향성 전환 |
| `wipe` | 닦아내기 전환 | 극적 전환 |
| `flip` | 뒤집기 전환 | 카드, 반전 |
| `clockWipe` | 시계방향 전환 | 시간 경과 |

#### 특수 효과
| 애니메이션 | 설명 | 용도 |
|------------|------|------|
| `particle` | 입자 효과 | 눈, 비, 불꽃 |
| `glow` | 빛나는 효과 | 강조, 신비 |
| `blur` | 흐려짐 | 회상, 꿈 |
| `ripple` | 물결 효과 | 충격파, 확산 |

### 애니메이션 힌트 작성 예시

```json
// 숫자 카운트업
"animation_hints": ["price_text: countUp from 0 to 1000"]

// 타이핑 효과
"animation_hints": ["title: typewriter effect, 0.5s per character"]

// 순차 등장
"animation_hints": [
  "item1: slideIn from left at 0s",
  "item2: slideIn from left at 0.3s",
  "item3: slideIn from left at 0.6s"
]

// 강조 효과
"animation_hints": ["keyword: highlight with yellow background"]

// 복합 효과
"animation_hints": [
  "portrait: fadeIn + slight scale up",
  "name_text: typewriter after portrait appears",
  "camera: slow zoom in throughout"
]
```

---

## 출력 형식

### scenes.json (전체 요약)

```json
{
  "meta": {
    "total_scenes": 42,
    "sections": {
      "hook": { "scenes": ["s1", "s2", "s3"], "count": 3 },
      "background": { "scenes": ["s4", "s5", "s6", "s7", "s8"], "count": 5 },
      "core1": { "scenes": ["s9", "s10", "s11", "s12"], "count": 4 },
      "core2": { "scenes": ["s13", "s14", "s15", "s16", "s17"], "count": 5 },
      "core3": { "scenes": ["s18", "s19", "s20", "s21"], "count": 4 },
      "insight": { "scenes": ["s22", "s23", "s24", "s25", "s26"], "count": 5 },
      "outro": { "scenes": ["s27", "s28"], "count": 2 }
    }
  },
  "scenes": [
    {
      "scene_id": "s1",
      "section": "hook",
      "narration_preview": "영하 20도. 보일러도 없고...",
      "duration_estimate": 8.5,
      "bg_id": "winter_intro"
    }
  ]
}
```

### s{n}.json (개별 씬 상세)

```json
{
  "scene_id": "s1",
  "section": "hook",
  "index_in_section": 0,

  "narration": "영하 20도. 보일러도 없고, 패딩도 없다. 당신이라면 어떻게 버틸까?",
  "narration_tts": "영하 이십 도... 보일러도 없고, 패딩도 없다... 당신이라면 어떻게 버틸까...",

  "subtitle_segments": [
    "영하 20도.",
    "보일러도 없고, 패딩도 없다.",
    "당신이라면 어떻게 버틸까?"
  ],

  "duration_estimate": 8.5,

  "bg_id": "winter_intro",
  "bg_description": "현대 도시 야경에서 조선시대로 전환되는 느낌, 눈 내림",

  "elements": [
    {
      "id": "thermometer",
      "type": "icon",
      "asset": "thermometer_icon",
      "role": "온도 -20도 표시",
      "position_hint": "center-right"
    },
    {
      "id": "crossed_items",
      "type": "icon",
      "asset": null,
      "role": "보일러, 패딩 아이콘에 X표시",
      "position_hint": "center"
    }
  ],

  "animation_hints": [
    "thermometer: fadeIn, temperature drops to -20",
    "crossed_items: sequential fadeIn with X mark animation",
    "camera: slight zoom in for tension"
  ],

  "visual_style": {
    "mood": "cold, dramatic",
    "color_tone": "blue, desaturated",
    "lighting": "dim, winter"
  }
}
```

---

## 체크리스트

### 씬 분할
- [ ] 모든 섹션의 narration이 씬으로 분할되었는가?
- [ ] 각 씬이 5~15초 범위인가?
- [ ] subtitle_segments가 의미 단위로 분할되었는가?
- [ ] narration_tts의 `...` 위치와 자막 분할이 일치하는가?

### 에셋 매핑
- [ ] 모든 씬에 최소 1개 이상의 element가 있는가?
- [ ] asset_catalog.csv에서 사용 가능한 에셋을 확인했는가?
- [ ] 없는 에셋은 asset: null로 표시했는가?

### 배경
- [ ] 모든 씬에 bg_id와 bg_description이 있는가?
- [ ] 같은 배경을 사용하는 씬들이 같은 bg_id를 공유하는가?
- [ ] bg_prompts.json이 중복 없이 생성되었는가?

### 일관성
- [ ] scene_id가 s1부터 순차적으로 부여되었는가?
- [ ] scenes.json의 목록과 개별 s{n}.json이 일치하는가?

### state.json 업데이트 (필수!)
- [ ] sections.all에 모든 섹션 목록이 있는가?
- [ ] sections.core_count가 정확한가?
- [ ] sections.parts가 자동 계산되었는가?
- [ ] sections.part_scenes에 Part별 씬 목록이 있는가?
- [ ] code_progress가 초기화되었는가?

---

## 호출 방법

```
Task tool로 호출:
"scene-director 에이전트로 씬 분할 실행"
```

## 참고

- 이 에이전트 완료 후 → **Python TTS 파이프라인** 실행
- TTS 완료 후 → **scene-splitter 에이전트**로 자막 타이밍 매칭
