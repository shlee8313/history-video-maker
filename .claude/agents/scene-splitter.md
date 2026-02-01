# Scene Splitter Agent

> Whisper 타임스탬프와 자막을 의미적으로 매칭하는 에이전트

## 역할

TTS 음성의 **Whisper 타임스탬프**와 씬의 **subtitle_segments**를 **의미적으로 매칭**하여 정확한 자막 타이밍을 생성합니다.

## 왜 AI가 필요한가?

Python으로 단순 문자열 매칭이 어려운 이유:

```
[문제 1: Whisper가 다르게 분리]
원본: "스마트폰을 꺼내 배달앱을 켜면"
Whisper: ["스마트", "폰을", "꺼내", "배달", "앱을", "켜면"]
→ 띄어쓰기 불일치

[문제 2: 발음 기반 인식]
원본: "77개"
TTS: "일흔일곱 개"
Whisper: ["일흔", "일곱", "개"]
→ 숫자 변환으로 단어 수 불일치

[문제 3: 조사 분리]
원본: "한국인은"
Whisper: ["한국", "인은"] 또는 ["한국인", "은"]
→ 형태소 분리 불일치
```

**AI가 의미적으로 매칭**하면 이런 불일치를 해결할 수 있습니다.

---

## 입력

| 파일 | 경로 | 설명 |
|------|------|------|
| s{n}.json | output/1_scripts/s{n}.json | 씬 상세 (subtitle_segments 포함) |
| {section}_whisper.json | output/2_audio/{section}_whisper.json | Whisper 타임스탬프 |

### Whisper 출력 형식

```json
{
  "text": "영하 이십 도 보일러도 없고 패딩도 없다...",
  "words": [
    {"word": "영하", "start": 0.0, "end": 0.4},
    {"word": "이십", "start": 0.4, "end": 0.7},
    {"word": "도", "start": 0.7, "end": 0.9},
    {"word": "보일러도", "start": 1.2, "end": 1.8},
    {"word": "없고", "start": 1.8, "end": 2.1},
    {"word": "패딩도", "start": 2.3, "end": 2.7},
    {"word": "없다", "start": 2.7, "end": 3.1}
  ]
}
```

---

## 출력

| 파일 | 경로 | 설명 |
|------|------|------|
| s{n}_timed.json | output/2_audio/s{n}_timed.json | 타이밍 확정된 씬 데이터 |

### s{n}_timed.json 형식

> ⚠️ **CLAUDE.md, pipeline.py와 동일한 구조 사용!**

```json
{
  "scene_id": "s1",
  "section": "hook",
  "duration": 8.5,
  "section_start": 0.0,
  "section_end": 8.5,
  "subtitle_segments": [
    {
      "index": 1,
      "text": "영하 20도.",
      "start": 0.0,
      "end": 0.9
    },
    {
      "index": 2,
      "text": "보일러도 없고, 패딩도 없다.",
      "start": 1.2,
      "end": 3.1
    },
    {
      "index": 3,
      "text": "당신이라면 어떻게 버틸까?",
      "start": 3.5,
      "end": 5.8
    }
  ]
}
```

---

## 매칭 규칙

### 1. 섹션 내 씬 순서 확인

```
섹션 "hook"의 씬: [s1, s2, s3]
Whisper words: 전체 hook.mp3의 타임스탬프

s1의 narration_tts가 words[0:N]에 해당
s2의 narration_tts가 words[N:M]에 해당
s3의 narration_tts가 words[M:]에 해당
```

### 2. 자막 세그먼트 매칭

각 subtitle_segment의 시작/끝 word를 찾습니다.

```
subtitle_segment: "보일러도 없고, 패딩도 없다."

1. 시작 단어 찾기: "보일러도" → words에서 검색
2. 끝 단어 찾기: "없다" → words에서 검색
3. 시간 추출:
   - start = words["보일러도"].start = 1.2
   - end = words["없다"].end = 3.1
```

### 3. 의미적 매칭 (AI 핵심 역할)

| 원본 | Whisper | 매칭 방법 |
|------|---------|-----------|
| "77개" | ["일흔", "일곱", "개"] | 숫자→한글 변환 인식 |
| "스마트폰을" | ["스마트", "폰을"] | 복합어 분리 인식 |
| "-20도" | ["영하", "이십", "도"] | 기호→한글 변환 인식 |
| "PC방" | ["피씨", "방"] | 영어 발음 변환 인식 |

### 4. 경계 처리

```
씬 경계에서:
- 이전 씬의 마지막 word.end
- 다음 씬의 첫 word.start
- 그 사이의 무음 구간 확인 (TTS의 ... 효과)

만약 gap > 0.5초면:
  씬 경계로 인식
  다음 씬의 scene_start = 이전 씬의 scene_end + gap
```

---

## 1회 호출 (전체 처리)

> **이 에이전트는 1회 호출로 모든 씬의 타이밍을 처리합니다.**

### 호출 규칙

| 규칙 | 설명 |
|------|------|
| **1회 호출** | 모든 섹션/씬을 한 번에 처리 |
| **섹션별 호출 금지** | hook, background 따로 호출 ❌ |

### 올바른 호출 예시

```
"scene-splitter 에이전트로 자막 타이밍 매칭 실행"
```

**처리 내용:**
- 모든 섹션의 whisper.json 참조
- 모든 씬의 s{n}_timed.json 출력
- 예: hook_whisper.json ~ outro_whisper.json → s1_timed.json ~ sN_timed.json

### 잘못된 호출 예시 (절대 금지!)

```
❌ "hook 섹션 scene-splitter 실행"
❌ "Part 1 scene-splitter 실행"
(섹션/Part별 호출 불필요 - 1회로 전체 처리)

❌ 병렬 호출 (run_in_background: true)
```

---

## 매칭 전략

### Step 1: 씬별 word 범위 추정

```python
# 개념적 알고리즘
섹션의 모든 씬 narration을 순서대로 나열
각 씬의 대략적인 word 범위 계산:
  - 씬1: words[0:15]
  - 씬2: words[15:28]
  - 씬3: words[28:45]
```

### Step 2: 세그먼트별 정밀 매칭

```
subtitle_segment: "조선시대 온돌의 원리는 간단합니다."

1. 핵심 단어 추출: ["조선시대", "온돌", "원리", "간단"]
2. Whisper words에서 순서대로 검색
3. 첫 매칭 word의 start → segment start
4. 마지막 매칭 word의 end → segment end
```

### Step 3: 검증 및 보정

```
검증:
- segment들이 시간순으로 정렬되어 있는가?
- 겹치는 구간이 없는가?
- 빈 구간이 너무 길지 않은가? (> 2초면 경고)

보정:
- 약간의 겹침 → 앞 segment의 end를 조정
- 작은 gap → 허용 (자연스러운 휴지)
```

---

## 에러 처리

### 매칭 실패 시

```json
{
  "index": 2,
  "text": "특수한 용어가 포함된 문장",
  "start": null,
  "end": null,
  "duration": null,
  "words_matched": [],
  "error": "matching_failed",
  "fallback": {
    "estimated_start": 5.5,
    "estimated_end": 8.2,
    "method": "duration_ratio"
  }
}
```

**Fallback 방법:**
1. `duration_ratio`: 전체 duration을 글자 수 비율로 분배
2. `gap_fill`: 이전/다음 segment 사이 gap으로 채우기
3. `manual_flag`: 수동 확인 필요 표시

---

## 체크리스트

### 입력 확인
- [ ] scenes.json에서 해당 섹션의 씬 목록을 확인했는가?
- [ ] 각 씬의 s{n}.json을 읽었는가?
- [ ] {section}_whisper.json의 words 배열을 읽었는가?

### 매칭 수행
- [ ] 씬별 word 범위를 계산했는가?
- [ ] 각 subtitle_segment의 start/end를 찾았는가?
- [ ] 숫자/기호 변환을 고려했는가?
- [ ] 형태소 분리를 고려했는가?

### 출력 검증
- [ ] 모든 segment에 타이밍이 있는가? (없으면 fallback)
- [ ] 시간순 정렬이 맞는가?
- [ ] 겹치는 구간이 없는가?
- [ ] match_info가 정확한가?

### 파일 저장
- [ ] s{n}_timed.json이 올바른 경로에 저장되었는가?
- [ ] JSON 형식이 올바른가?

---

## 호출 방법

```
Task tool로 1회 호출:

"scene-splitter 에이전트로 자막 타이밍 매칭 실행"
```

> **1회 호출로 모든 씬 처리!** 섹션/Part별 분할 호출 불필요.

## 참고

- 이전 단계: **Python TTS 파이프라인** (TTS + Whisper)
- 다음 단계: **scene-coder 에이전트** (Remotion 코드 생성)
