# Asset Checker Skill

> Phase 2.5: 씬에서 사용되는 에셋 확인, 다운로드, 프롬프트 생성

## 개요

씬 분할(Phase 2) 완료 후, 각 씬에서 필요한 에셋(icons, portraits, maps, backgrounds, artifacts, **images**)을 확인하고:
1. **state.json의 category 확인 → 아트 스타일 결정**
2. 필요한 에셋 폴더 자동 생성 (없으면)
3. 기존 에셋 DB에서 검색 → 있으면 다운로드
4. 없으면 생성용 프롬프트 작성 **(카테고리 스타일 적용)**
5. 사용자가 에셋 준비 완료하면 catalog 업데이트

> ⚠️ **`type: "image"`도 에셋으로 준비해야 합니다!** text, effect 타입만 Remotion 코드로 생성.

---

## 카테고리별 아트 스타일 (필수!)

> ⚠️ **프롬프트 작성 전 state.json의 category를 반드시 확인하세요!**

| Category | 아트 스타일 | 프롬프트 키워드 |
|----------|-------------|-----------------|
| `history` | **전통 동양화 (수묵담채)** | `ink wash painting style, sumi-e, damchae, brush stroke texture, traditional Korean art` |
| `food` | 애니메이션 스타일 | `anime illustration style, vibrant colors, clean lines, soft shading, warm atmosphere` |
| `culture` | 애니메이션 스타일 | `anime style, clean lines, soft colors, modern Korean animation` |
| `science` | 애니메이션 스타일 | `anime style, clean infographic, soft gradients, tech illustration` |
| `economy` | 애니메이션 스타일 | `anime style, professional illustration, clean design, business aesthetic` |
| 기타 | 애니메이션 스타일 | `anime style, vibrant colors, clean lines, soft shading` |

### 스타일별 프롬프트 예시

**history (전통 동양화):**
```
Portrait of King Taejo in traditional Korean royal portrait style (어진),
ink brush technique for facial features, damchae color palette with
rich vermillion red and deep indigo blue, transparent background, 600x800
```

**food/culture/etc (애니메이션):**
```
Portrait of a friendly Korean chef in anime illustration style,
warm friendly expression, vibrant colors with soft shading,
clean lines, transparent background, 600x800
```

## 입력 파일

```
output/1_scripts/s1.json ~ sN.json   # 씬별 elements 필드
output/1_scripts/bg_prompts.json     # 배경 프롬프트 (Phase 2에서 생성)
output/1_scripts/scenes.json         # 전체 씬 목록
```

---

## ⚠️ 토큰 절약: elements 필드만 추출

> **s{n}.json 전체를 읽지 마세요!** elements 필드만 필요합니다.

### 권장 방법: jq로 elements만 추출

```bash
# 모든 씬의 elements를 한 번에 추출
for f in output/1_scripts/s*.json; do
  echo "=== $(basename $f) ==="
  cat "$f" | python -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('elements',[]),indent=2))"
done
```

### 또는 Python으로 일괄 추출

```python
import json
from pathlib import Path

elements_by_scene = {}
for f in sorted(Path("output/1_scripts").glob("s*.json")):
    if f.name.startswith("scenes"):  # scenes.json 제외
        continue
    with open(f) as fp:
        data = json.load(fp)
        elements_by_scene[f.stem] = data.get("elements", [])

# 결과: {"s1": [...], "s2": [...], ...}
```

### 읽어야 할 것 vs 읽지 말 것

| 파일/필드 | 읽기 | 이유 |
|-----------|------|------|
| `scenes.json` | ✅ 전체 | 씬 목록, 섹션 정보 |
| `bg_prompts.json` | ✅ 전체 | 배경 프롬프트 |
| `s{n}.json` → `elements` | ✅ 필드만 | 에셋 목록 |
| `s{n}.json` → `narration` | ❌ | 불필요 |
| `s{n}.json` → `subtitle_segments` | ❌ | 불필요 |
| `s{n}.json` → `animation_hints` | ❌ | 불필요 |

## 출력 파일

```
output/1_scripts/element_prompts.json  # 생성 필요한 에셋 프롬프트
output/asset_catalog.csv               # 최종 에셋 카탈로그 (CSV 테이블)
assets/{type}/*.png                    # 다운로드된 에셋
output/3_backgrounds/bg_s{n}.png       # 배경 이미지 (수동 생성)
```

---

## 파일명 규칙 (DB 재사용 고려)

> ⚠️ **중요**: 파일명에 타입 접미사(`_icon`, `_portrait` 등)를 붙이지 않습니다!

### ID 네이밍 규칙

| 규칙 | 좋은 예 | 나쁜 예 |
|------|---------|---------|
| 타입 접미사 제외 | `question_mark` | `question_mark_icon` |
| 의미 중심 | `taejo` | `taejo_portrait` |
| 검색 용이 | `hanyang` | `hanyang_map` |

**이유:**
- 폴더(`icons/`, `portraits/`)가 이미 타입을 구분
- DB 검색 시 `question_mark`만으로 찾기 가능
- 다른 프로젝트에서 재사용 용이

### file_path 필드 (필수)

element_prompts.json에 `file_path` 필드를 포함하여 정확한 저장 위치 명시:

```json
{
  "id": "question_mark",
  "type": "icon",
  "file_path": "icons/question_mark.png",
  "prompt": "..."
}
```

### 실제 저장 경로

| 타입 | file_path 값 | 실제 전체 경로 |
|------|--------------|----------------|
| icon | `icons/question_mark.png` | `assets/icons/question_mark.png` |
| portrait | `portraits/taejo.png` | `assets/portraits/taejo.png` |
| map | `maps/hanyang.png` | `assets/maps/hanyang.png` |
| artifact | `artifacts/janggun.png` | `assets/artifacts/janggun.png` |
| image | `images/maebunza_silhouette.png` | `assets/images/maebunza_silhouette.png` |

---

## 워크플로우

### Step 1: 필요 에셋 목록 추출

모든 s{n}.json에서 elements 필드 수집:

```json
// s1.json
{
  "elements": [
    { "id": "thermometer", "type": "icon", "asset": "thermometer_icon" },
    { "id": "snow_flake", "type": "icon", "asset": "snow_icon" }
  ]
}
```

결과:
```
필요 에셋 목록:
- thermometer_icon (icon) - s1
- snow_icon (icon) - s1
- old_man_portrait (portrait) - s2
- joseon_map (map) - s3
...
```

### Step 1.5: 에셋 폴더 자동 생성

> ⚠️ 에셋 확인 전 필수! 없는 폴더는 자동 생성

```python
python pipeline.py assets init-folders
```

또는 직접 실행:
```python
import os

ASSET_FOLDERS = [
    "assets/icons",
    "assets/portraits",
    "assets/maps",
    "assets/artifacts",
    "assets/images",      # image 타입용 폴더
    "output/3_backgrounds"
]

for folder in ASSET_FOLDERS:
    os.makedirs(folder, exist_ok=True)
    print(f"✓ {folder}")
```

### Step 2: 에셋 DB 조회

> 현재는 로컬 assets/ 폴더만 확인. 향후 외부 DB 연동 가능.

```bash
# 로컬 에셋 확인
ls assets/icons/
ls assets/portraits/
ls assets/maps/
ls assets/artifacts/
ls assets/images/
```

### Step 3: 에셋 분류

```
[있음] → assets/ 폴더에서 확인 완료
[없음] → element_prompts.json에 프롬프트 추가
```

### Step 3.5: 배경 색상 분석

> ⚠️ Element 프롬프트 작성 전 필수 단계

각 씬의 배경 프롬프트(bg_prompts.json)를 분석하여:
1. **주요 색상(dominant colors)** 추출
2. **밝기(brightness)** 판단: dark / medium / light
3. **톤(tone)** 판단: warm / cool / neutral

```
bg_s1 분석:
- prompt: "Snowy winter dawn, deep blue to pale orange gradient..."
- dominant_colors: ["deep blue", "pale orange"]
- brightness: "dark" (어두운 남색이 주)
- tone: "cool"
→ Element 권장: 밝은 색, 흰색, 골드
```

**Element 색상 전략 결정:**

| 배경 분석 | 색상 전략 | 프롬프트 힌트 |
|-----------|-----------|---------------|
| dark + cool | contrast-bright | "white, gold, warm orange tones" |
| dark + warm | contrast-bright | "white, silver, cool blue accents" |
| light + cool | contrast-dark | "deep navy, dark brown, rich colors" |
| light + warm | contrast-dark | "deep green, burgundy, dark tones" |
| medium | balanced | "medium saturation, clear outlines" |

### Step 4: element_prompts.json 생성

> ⚠️ **반드시 state.json의 category를 확인하고 해당 스타일로 프롬프트 작성!**

**history 카테고리 (전통 동양화 스타일):**
```json
{
  "meta": {
    "project": "maebun_history",
    "category": "history",
    "art_style": {
      "name": "Traditional East Asian Painting (전통 동양화)",
      "description": "수묵화/민화 느낌, 담채 색감, 붓터치 질감",
      "keywords": ["ink wash painting", "sumi-e", "minhwa folk art", "brush stroke texture", "damchae soft colors"]
    },
    "created_at": "2025-01-29T22:00:00Z",
    "total_elements": 5,
    "total_backgrounds": 7
  },
  "elements": [
    {
      "id": "thermometer",
      "type": "icon",
      "file_path": "icons/thermometer.png",
      "used_in": ["s1"],
      "prompt": "Traditional thermometer in ink wash painting style, bold black ink strokes with gray wash gradient, golden ochre accents, brush stroke texture, solid white background, 512x512, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja",
      "style_hints": ["ink brush", "sumi-e", "traditional Korean aesthetic"],
      "status": "pending"
    },
    {
      "id": "old_scholar",
      "type": "portrait",
      "file_path": "portraits/old_scholar.png",
      "used_in": ["s2", "s5"],
      "prompt": "Portrait of Joseon dynasty scholar in traditional Korean portrait style, wearing gat hat and dopo robe, ink brush facial details, damchae color technique, muted earth tones, solid white background, 600x800, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja",
      "style_hints": ["traditional portrait", "damchae colors", "ink brush technique"],
      "status": "pending"
    }
  ],
  "backgrounds": [
    {
      "id": "bg_s1",
      "scene": "s1",
      "prompt": "Snowy winter dawn in traditional sansuhwa landscape style, soft ink wash gradient from deep blue to pale orange, subtle brush stroke textures, NO TEXT, NO Korean, NO Chinese characters, NO letters, NO words, minimal details, 1920x1080",
      "style_hints": ["ink wash gradient", "sansuhwa landscape", "brush texture"],
      "status": "pending"
    }
  ]
}
```

**food/culture/science/economy 카테고리 (애니메이션 스타일):**
```json
{
  "meta": {
    "project": "korean_food_story",
    "category": "food",
    "art_style": {
      "name": "Animation Style (애니메이션)",
      "description": "깔끔한 라인, 부드러운 쉐이딩, 따뜻한 색감",
      "keywords": ["anime style", "vibrant colors", "clean lines", "soft shading", "warm atmosphere"]
    },
    "created_at": "2025-01-29T22:00:00Z",
    "total_elements": 5,
    "total_backgrounds": 7
  },
  "elements": [
    {
      "id": "ramen_bowl",
      "type": "icon",
      "file_path": "icons/ramen_bowl.png",
      "used_in": ["s1"],
      "prompt": "Steaming ramen bowl in anime illustration style, vibrant warm colors, clean lines with soft shading, appetizing steam effect, solid white background, 512x512, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja",
      "style_hints": ["anime style", "food illustration", "warm colors"],
      "status": "pending"
    },
    {
      "id": "chef",
      "type": "portrait",
      "file_path": "portraits/chef.png",
      "used_in": ["s2", "s5"],
      "prompt": "Friendly Korean chef in anime style, warm smile, wearing white chef uniform, clean lines with soft cel shading, vibrant but harmonious colors, solid white background, 600x800, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja",
      "style_hints": ["anime portrait", "friendly expression", "clean lines"],
      "status": "pending"
    }
  ],
  "backgrounds": [
    {
      "id": "bg_s1",
      "scene": "s1",
      "prompt": "Cozy Korean kitchen interior in anime style, warm golden lighting, soft color gradients, clean illustration with subtle details, NO TEXT, NO Korean, NO Chinese characters, NO letters, NO words, 1920x1080",
      "style_hints": ["anime background", "warm atmosphere", "soft gradients"],
      "status": "pending"
    }
  ]
}
```

### Step 5: 사용자에게 목록 표시

```
===== 에셋 준비 필요 =====

[ELEMENTS - 생성 필요]
1. thermometer_icon (icon) - 512x512
   → "A vintage Korean-style thermometer..."

2. old_scholar_portrait (portrait) - 800x1000
   → "Portrait of a Joseon dynasty scholar..."

[BACKGROUNDS - 생성 필요]
1. bg_s1 - 1920x1080
   → "Snowy winter dawn landscape..."

2. bg_s2 - 1920x1080
   → "Traditional Korean village at night..."

===== 저장 위치 (file_path 참조) =====
- Icons: assets/{file_path} (예: assets/icons/thermometer.png)
- Portraits: assets/{file_path} (예: assets/portraits/taejo.png)
- Maps: assets/{file_path} (예: assets/maps/hanyang.png)
- Artifacts: assets/{file_path} (예: assets/artifacts/janggun.png)
- Images: assets/{file_path} (예: assets/images/maebunza_silhouette.png)
- Backgrounds: output/3_backgrounds/{bg_id}.png

"에셋 준비 완료" 입력 시 검증을 시작합니다.
```

### Step 6: 사용자 수동 작업

사용자가 외부 도구(Midjourney, DALL-E, Stable Diffusion 등)로 이미지 생성 후 지정된 폴더에 저장.

### Step 7: 검증

"에셋 준비 완료" 입력 시:

```python
# 검증 로직 (file_path 필드 활용)
for element in required_elements:
    # file_path 예: "icons/question_mark.png"
    path = f"assets/{element.file_path}"
    if not exists(path):
        missing.append(element)
    else:
        # 파일 크기, 이미지 사이즈 확인
        validate_image(path)

for bg in backgrounds:
    path = f"output/3_backgrounds/{bg.id}.png"
    if not exists(path):
        missing.append(bg)
```

누락된 에셋이 있으면 목록 다시 표시.

### Step 8: asset_catalog.csv 생성

> CSV 테이블 형식으로 저장 (Remotion에서 width/height 바로 사용 가능)

**컬럼 구조:**
```
id,type,file_path,width,height,used_in
```

**예시:**
```csv
id,type,file_path,width,height,used_in
question_mark,icon,icons/question_mark.png,578,824,"s2,s8,s22"
taejo,portrait,portraits/taejo.png,923,971,s5
hanyang,map,maps/hanyang.png,965,952,"s2,s5,s15"
janggun,artifact,artifacts/janggun.png,798,848,"s16,s17"
maebunza_silhouette,image,images/maebunza_silhouette.png,608,849,s3
bg_s1,background,output/3_backgrounds/bg_s1.png,1344,768,s1
```

**장점:**
- `width`, `height` 숫자로 바로 사용 가능
- 엑셀/구글시트에서 편집 가능
- DB 임포트 용이
- 파일 크기 최소화

**생성 스크립트:**
```python
from PIL import Image
import csv

# 이미지 사이즈 자동 추출
with open('output/asset_catalog.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'type', 'file_path', 'width', 'height', 'used_in'])

    for element in elements:
        img = Image.open(f"assets/{element['file_path']}")
        w, h = img.size
        writer.writerow([element['id'], element['type'], element['file_path'], w, h, ','.join(element['used_in'])])
```

---

## 이미지 규칙

### Elements (투명 배경 + 단색 흰색 배경)

| 타입 | 권장 크기 | 배경 | 용도 | 저장 위치 |
|------|-----------|------|------|-----------|
| icon | 512x512 | **단색 흰색** | 아이콘, 심볼 | `assets/icons/` |
| portrait | 600x800 ~ 800x1000 | **단색 흰색** | 인물 초상화 | `assets/portraits/` |
| map | 800x600 ~ 1200x900 | **단색 흰색** | 지도, 다이어그램 | `assets/maps/` |
| artifact | 600x600 | **단색 흰색** | 유물, 물건 | `assets/artifacts/` |
| **image** | 다양함 | **단색 흰색** | 실루엣, 캐릭터, 물건 등 | `assets/images/` |

> ⚠️ **type별 에셋 필요 여부:**
> - `icon`, `portrait`, `map`, `artifact`, `image` → **에셋 파일 필요**
> - `text`, `effect` → Remotion 코드로 생성 (에셋 불필요)

> 🚨 **Elements 프롬프트 필수 규칙:**
> - **배경: 단색 흰색 (solid white background)**
> - **한글/한자 절대 금지 (NO Korean text, NO Chinese characters, NO Hangul, NO Hanja)**
> - 프롬프트에 반드시 포함: `solid white background, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja`

### Backgrounds (단색/그라데이션 권장)

| 규칙 | 설명 |
|------|------|
| 크기 | 1920x1080 (16:9) |
| 배경 | 단색 또는 부드러운 그라데이션 |
| 텍스트 | **절대 금지 (한글/한자/영어 모두)** |
| 디테일 | 최소화 (오버레이 가독성) |
| 스타일 | 분위기 전달에 집중 |

> 🚨 **Backgrounds 프롬프트 필수 규칙:**
> - **한글/한자 절대 금지 (NO Korean text, NO Chinese characters, NO Hangul, NO Hanja)**
> - 프롬프트에 반드시 포함: `NO TEXT, NO Korean, NO Chinese characters, NO letters, NO words`

**좋은 배경 예시:**
- 단색 그라데이션 (하늘색 → 흰색)
- 부드러운 텍스처 (종이, 천, 나무결)
- 흐릿한 풍경 (bokeh 효과)

**나쁜 배경 예시:**
- 복잡한 패턴
- 텍스트/글자 포함 (한글, 한자, 영어 모두)
- 너무 밝거나 대비가 강한 색상

---

## 프롬프트 작성 가이드

### 색상 조화 원칙 (배경 → Element 매칭)

> ⚠️ **중요**: Element 프롬프트는 해당 씬의 배경 색상을 고려하여 작성해야 합니다.

**프롬프트 작성 순서:**
1. 배경 프롬프트 먼저 확정 (bg_prompts.json)
2. 배경의 주요 색상/톤 파악
3. Element 프롬프트에 **대비되거나 조화로운 색상** 명시

**배경-Element 색상 매칭 가이드:**

| 배경 톤 | Element 권장 색상 | 피해야 할 색상 |
|---------|-------------------|----------------|
| 어두운 배경 (남색, 검정, 진갈색) | 밝은 색, 골드, 흰색 테두리 | 어두운 색 (안 보임) |
| 밝은 배경 (하늘색, 베이지, 흰색) | 진한 색, 채도 높은 색 | 연한 파스텔 (안 보임) |
| 따뜻한 배경 (주황, 노랑, 갈색) | 보색(청록), 진한 갈색, 흰색 | 비슷한 난색 (묻힘) |
| 차가운 배경 (파랑, 청록, 보라) | 보색(주황), 따뜻한 갈색, 골드 | 비슷한 한색 (묻힘) |
| 그라데이션 배경 | 외곽선/테두리 있는 스타일 | 단색 플랫 (경계 불분명) |

**Element 프롬프트에 색상 힌트 추가:**

```json
{
  "id": "thermometer_icon",
  "used_in": ["s1"],
  "bg_color_hint": "dark blue gradient (from bg_s1)",
  "prompt": "... white and gold color scheme to contrast with dark background ...",
  "color_reasoning": "배경이 어두운 남색이므로 밝은 흰색/골드로 가시성 확보"
}
```

### Icon 프롬프트

```
[물체 설명], flat icon style, [시대/스타일], solid white background, 512x512, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja, centered composition
```

예시:
```
A traditional Korean brass brazier with glowing embers, flat icon style, Joseon dynasty aesthetic, golden yellow and warm orange tones, solid white background, 512x512, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja, centered composition
```

### Portrait 프롬프트

```
Portrait of [인물 설명], [복장 with 색상], [표정/포즈], solid white background, [구도], [스타일 힌트], NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja
```

예시:
```
Portrait of a Joseon dynasty nightsoil collector, wearing light beige cotton hanbok with white accents, determined expression, solid white background, upper body, historical illustration style, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja
```

### Background 프롬프트

```
[장면 설명], [색상/분위기], NO TEXT, NO Korean, NO Chinese characters, NO letters, NO words, minimal details, [시간대], 1920x1080, [스타일]
```

예시:
```
Traditional Korean village alley at dawn, warm orange and soft blue gradient sky, NO TEXT, NO Korean, NO Chinese characters, NO letters, NO words, minimal details, early morning atmosphere, 1920x1080, painterly style, peaceful mood
```

### element_prompts.json 확장 구조

```json
{
  "elements": [
    {
      "id": "thermometer",
      "type": "icon",
      "file_path": "icons/thermometer.png",
      "used_in": ["s1"],
      "prompt": "A vintage thermometer showing freezing temperature, flat icon style, white and gold color scheme, solid white background, 512x512, NO text, NO Korean, NO Chinese characters, NO Hangul, NO Hanja",
      "style_hints": ["flat design", "vintage", "high visibility"],
      "status": "pending"
    }
  ]
}
```

---

## 상태 관리

### element_prompts.json status 값

| 상태 | 설명 |
|------|------|
| `pending` | 생성 대기 |
| `ready` | 파일 준비됨 (검증 전) |
| `verified` | 검증 완료 |
| `error` | 파일 누락/오류 |

### 완료 조건

- 모든 elements status = `verified`
- 모든 backgrounds status = `verified`
- asset_catalog.csv 업데이트됨
- state.json phase = `assets_ready`

---

## CLI 통합 (향후)

```bash
# 에셋 목록 추출
python pipeline.py assets extract

# 에셋 검증
python pipeline.py assets verify

# 카탈로그 업데이트
python pipeline.py assets catalog
```

---

## 체크리스트

- [ ] 모든 씬에서 elements 추출 완료
- [ ] 로컬 에셋 확인 완료
- [ ] element_prompts.json 생성
- [ ] 사용자에게 목록 전달
- [ ] 에셋 생성 완료 (수동)
- [ ] 검증 통과
- [ ] asset_catalog.csv 업데이트
- [ ] state.json → `assets_ready`
