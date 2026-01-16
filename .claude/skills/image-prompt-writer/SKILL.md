---
name: image-prompt-writer
description: 역사 영상 배경 이미지를 위한 AI 프롬프트 작성. 양피지, 고지도, 고전 회화풍 배경 생성.
allowed-tools: Read, Write, Glob
---

# Image Prompt Writer Skill

## 역사 영상 배경 이미지 AI 프롬프트 작성 전문가

"세상에 이런 역사" 콘텐츠를 위한 배경 이미지 프롬프트를 작성합니다.

---

## 핵심 원칙

### 1. 텍스트 금지

```
이미지에 텍스트/문자/숫자 포함 금지
→ "no text, no letters, no numbers, no Korean, no Chinese characters"
→ 연도, 제목 등은 Motion Canvas가 렌더링
```

### 2. 스타일 일관성

```
각 스타일(antique, retro, minimal)의 특성 준수
→ state.json의 style 값 참조
→ 역사적 분위기와 현대적 가독성의 균형
```

### 3. 콘텐츠 영역 확보

```
⚠️ 핵심 원칙: 중앙부는 텍스트/인물 배치를 위해 비워두기

모든 스타일에서:
→ 중앙 40% 영역은 단순하게 유지
→ 장식 요소는 가장자리에 배치
→ 자막 영역(하단 20%)은 어둡게 처리
```

---

## 스타일별 프롬프트

### A. Antique (고풍) - 기본 스타일

**바탕**: 양피지 텍스처, 세피아 톤
**장식**: 가장자리 번짐, 고전적 테두리

#### 기본 양피지 배경

```
ancient parchment background, warm sepia tones,
aged paper texture with subtle creases and stains,
faded edges with dark vignette,
vintage manuscript aesthetic,
center area clean for text overlay,
no text, no letters, no numbers, no Korean, no Chinese characters,
16:9 ratio, 4K quality, historical documentary style
```

#### 고지도 스타일 배경

```
antique map background, old cartography style,
faded sepia world map with compass rose in corner,
aged parchment texture underneath,
subtle coastlines and terrain hints,
center area relatively clean for overlay,
no text, no letters, no numbers, no labels,
16:9 ratio, 4K quality, historical atlas aesthetic
```

#### 고전 회화풍 배경

```
classical painting background, Renaissance style,
dark moody atmosphere with warm undertones,
subtle oil painting texture,
dramatic chiaroscuro lighting,
blurred background suitable for text overlay,
no figures, no faces, no text,
16:9 ratio, 4K quality, museum artwork aesthetic
```

#### 동양 사료풍 배경 (한국/중국/일본 역사용)

```
traditional East Asian paper background,
hanji texture with subtle fiber patterns,
warm cream to light brown gradient,
faded ink wash hints at edges,
minimal brush stroke decorations in corners,
clean center for text and portraits,
no text, no characters, no calligraphy,
16:9 ratio, 4K quality, historical document aesthetic
```

### B. Retro (레트로)

**바탕**: 그라데이션, 파스텔 톤
**장식**: VHS 노이즈, 스캔라인 힌트

```
retro documentary background, vintage film aesthetic,
warm gradient from dark brown to amber,
subtle film grain and VHS noise texture,
faded vignette edges,
slightly desaturated colors,
clean center area for graphics,
no text, no letters, no numbers,
16:9 ratio, 4K quality, 1980s documentary style
```

### C. Minimal (미니멀)

**바탕**: 단색 또는 미세 그라데이션
**장식**: 거의 없음, 깔끔한 배경

```
minimal dark background, clean and modern,
subtle gradient from charcoal to black,
very faint texture barely visible,
professional documentary aesthetic,
maximum contrast for white text,
no patterns, no decorations, no text,
16:9 ratio, 4K quality, Netflix documentary style
```

---

## 역사 시대별 특화 프롬프트

### 고대 (Ancient) - 이집트, 그리스, 로마

```
ancient civilization background, weathered stone texture,
hieroglyphic-style wall hints at edges (no readable text),
warm sand and terracotta tones,
torchlight atmosphere,
archaeological site aesthetic,
no text, no letters, no symbols,
16:9 ratio, 4K quality
```

### 중세 (Medieval) - 유럽 중세

```
medieval manuscript background, illuminated style,
aged vellum texture with gold leaf hints at borders,
deep burgundy and forest green accents at edges,
candlelit warm atmosphere,
monastery scriptorium aesthetic,
no text, no letters, no heraldry with text,
16:9 ratio, 4K quality
```

### 동아시아 고대/중세 - 삼국시대, 고려, 조선 초기

```
traditional Korean historical background,
hanji paper texture with natural fiber patterns,
subtle ink wash landscape hints,
warm earthy tones with muted greens,
Joseon dynasty aesthetic,
no text, no hangul, no hanja,
16:9 ratio, 4K quality
```

### 근세 (Early Modern) - 르네상스, 대항해시대

```
Renaissance era background, old master painting style,
dark atmospheric background with warm highlights,
subtle velvet or canvas texture,
dramatic lighting from one side,
European court aesthetic,
no text, no letters, no coat of arms,
16:9 ratio, 4K quality
```

### 근대 (Modern) - 산업혁명, 제국주의

```
Victorian era background, industrial age aesthetic,
sepia photograph style with vignette,
subtle mechanical gear hints at edges,
smoky atmospheric fog,
19th century documentary feel,
no text, no letters, no signage,
16:9 ratio, 4K quality
```

### 현대 (Contemporary) - 20세기

```
mid-20th century background, archival film style,
black and white with slight sepia tint,
film grain and dust particles,
dramatic newsreel lighting,
historical footage aesthetic,
no text, no subtitles, no watermarks,
16:9 ratio, 4K quality
```

---

## 섹션별 분위기 변화 (긴 영상용)

5분 이상 영상에서 시청자 몰입을 위한 섹션별 분위기 조절:

| 섹션 | 분위기 | 프롬프트 추가 요소 |
|------|--------|-------------------|
| **Hook** | 미스터리, 긴장감 | `mysterious atmosphere, dramatic shadows, foggy edges` |
| **배경 분석** | 차분함, 객관적 | `neutral tones, balanced lighting, scholarly aesthetic` |
| **핵심 역사** | 긴장감, 역동적 | `dramatic lighting, warm conflict tones, intense atmosphere` |
| **통찰** | 성찰, 차분함 | `contemplative mood, soft lighting, thoughtful atmosphere` |
| **아웃트로** | 여운, 마무리 | `fading to black edges, sunset warmth, concluding mood` |

---

## 종횡비

### 16:9 (YouTube)
```
16:9 widescreen ratio, horizontal composition,
safe zones for text at center and bottom
```

### 9:16 (Shorts/Reels)
```
9:16 vertical ratio, portrait orientation,
safe zones for text at center, top and bottom areas clean
```

---

## 네거티브 프롬프트 (공통)

```
text, letters, numbers, words, Korean, Chinese, Japanese,
hangul, hanja, kanji, hiragana,
watermark, logo, signature, copyright,
blurry, low quality, pixelated,
modern elements, anachronistic objects,
cartoon style, anime style,
bright neon colors, oversaturated,
faces in focus, identifiable people
```

---

## 체크리스트

- [ ] "no text, no letters, no numbers" 포함
- [ ] 종횡비 명시 (16:9 or 9:16)
- [ ] 중앙 영역 확보 언급 ("center area clean for overlay")
- [ ] 시대에 맞는 분위기/색조 선택
- [ ] 네거티브에 문자 관련 항목 모두 포함
- [ ] state.json 스타일과 일치

---

## 결과 출력 형식

프롬프트 생성 완료 후 반드시 아래 형식으로 요약 제공:

```markdown
**저장 위치:** `9_backgrounds/`

**생성된 파일:**
- `prompts_batch.txt` - 복사용 (각 프롬프트 구분)
- `prompts_batch.json` - 프로그램용

**섹션별 설정:**

| 섹션 | 씬 범위 | 배경 스타일 | 분위기 |
|------|---------|------------|--------|
| Hook | s1~s2 | 양피지 + 미스터리 | 긴장감 |
| 배경 분석 | s3~s5 | 고지도 스타일 | 객관적 |
| 핵심 역사 | s6~s10 | 동양 사료풍 | 역동적 |
| 통찰 | s11~s12 | 고전 회화풍 | 성찰 |
| 아웃트로 | s13 | 양피지 + 페이드 | 여운 |

**사용 모델 권장:** Midjourney v6, DALL-E 3, Stable Diffusion XL
```

---

## 사용 판단 기준

### 배경 이미지가 필요한 경우

- 지도가 없는 씬 (인물 중심, 개념 설명)
- 전환 씬 (섹션 사이 브릿지)
- 아웃트로 (여운 있는 마무리)
- 추상적 개념 설명 (경제, 정치 구조 등)

### 배경 이미지가 불필요한 경우

- 고지도가 전체 화면을 차지하는 씬
- 실제 사료 이미지를 배경으로 사용하는 씬
- 인물 초상화가 중심인 씬 (단색 배경으로 충분)
- Motion Canvas 컴포넌트만으로 구성된 씬

---

## 금지 사항

- 텍스트/문자 허용하는 프롬프트
- 종횡비 누락
- 현대적 요소 (자동차, 전자기기 등) 포함
- 특정 인물의 얼굴이 선명하게 보이는 이미지
- 저작권 있는 예술 작품 직접 언급
- 너무 밝거나 화려한 색상 (가독성 저해)
