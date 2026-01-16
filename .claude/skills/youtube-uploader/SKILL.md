---
name: youtube-uploader
description: 완성된 역사 영상의 유튜브 업로드 메타데이터 생성. 제목, 설명, 태그, 썸네일 프롬프트 작성.
allowed-tools: Read, Write, Glob
---

# YouTube Uploader Skill

## "세상에 이런 역사" 유튜브 업로드 메타데이터 생성

완성된 역사 영상의 유튜브 업로드에 필요한 메타데이터를 생성합니다.

---

## 입력/출력

| 항목 | 경로 |
|------|------|
| **입력** | `1_script/approved_script.json`, `state.json` |
| **출력** | `10_upload/youtube_metadata.json`, `10_upload/youtube_metadata.md` |

---

## 1. 제목 작성 규칙

### 3가지 스타일로 제안

| 스타일 | 특징 | 예시 |
|--------|------|------|
| **메인 (권장)** | 질문형 + 부제목 | "왜 조선은 명량에서 이겼을까? \| 이순신의 전략" |
| **클릭 유도형** | 감정 자극, 호기심 | "13척 vs 133척, 그 결과가 충격적입니다" |
| **교육형** | 키워드 중심, 검색 최적화 | "명량해전의 비밀: 이순신이 승리한 진짜 이유" |

### 제목 규칙

- 길이: 40~60자 (한글 기준)
- 핵심 키워드를 앞에 배치
- `|` 또는 `:` 로 부제목 구분
- 숫자가 있으면 포함 (클릭률 상승)
- 이모지 사용 금지 (검색 최적화에 불리)

### 역사 콘텐츠 제목 패턴

```
[인물/사건] + [의문/충격] + [부제목]

예시:
- "이순신은 왜 명량을 선택했나 | 세상에 이런 역사"
- "임진왜란 7년, 조선이 살아남은 진짜 이유"
- "13척으로 133척을 이긴 비밀 | 명량해전의 수학"
```

---

## 2. 설명 (Description) 작성 규칙

### 구조

```
[Hook 문장 - 대본의 첫 문장 활용]

이 영상에서는 [역사적 사건/인물]의 [핵심 내용]을 파헤칩니다.

📜 이 영상에서 알 수 있는 것
• [핵심 포인트 1]
• [핵심 포인트 2]
• [핵심 포인트 3]
• [핵심 포인트 4]
• [핵심 포인트 5]

⏱️ 타임라인
0:00 - 인트로
X:XX - [배경 분석]
X:XX - [핵심 역사]
X:XX - [통찰]
X:XX - 아웃트로

📚 참고 자료
• [사료/문헌 출처]

🔔 구독과 알림 설정으로 역사의 숨겨진 이야기를 받아보세요!

#세상에이런역사 #역사 #한국사 ...
```

### 규칙

- 첫 2줄이 검색 결과에 노출됨 → 핵심 내용 배치
- 타임라인은 씬 구분(Hook/배경/핵심/통찰/아웃트로) 활용
- 해시태그는 설명 끝에 10~15개 배치
- 참고 자료 출처 명시 (역사 콘텐츠 신뢰도)

---

## 3. 태그 (Tags) 작성 규칙

### 태그 구성 (20~30개)

| 카테고리 | 개수 | 예시 |
|----------|------|------|
| **채널 브랜딩** | 2~3개 | 세상에이런역사, 역사다큐 |
| **핵심 키워드** | 5~7개 | 인물명, 사건명, 연도 |
| **영문 키워드** | 3~5개 | Korean history, Joseon |
| **관련 시대** | 3~5개 | 조선시대, 임진왜란, 16세기 |
| **롱테일 키워드** | 5~7개 | 이순신 전략, 명량해전 이유 |

### 역사 콘텐츠 필수 태그

```
세상에이런역사, 역사, 한국사, 다큐멘터리, 역사다큐,
[시대명], [인물명], [사건명], [연도],
Korean history, [영문 인물명], [영문 사건명]
```

---

## 4. 썸네일 프롬프트 작성 규칙

### 역사 콘텐츠 썸네일 스타일

| 스타일 | 특징 | 프롬프트 키워드 |
|--------|------|-----------------|
| **고풍 (antique)** | 양피지, 세피아 | ancient parchment, sepia tones, weathered |
| **드라마틱** | 명암 대비, 극적 조명 | dramatic lighting, chiaroscuro, cinematic |
| **미니멀** | 깔끔한 배경, 인물 중심 | clean background, centered portrait, minimal |

### Midjourney/DALL-E 프롬프트 구조

```
[역사적 장면/인물 설명], [분위기], [배경 요소],
historical documentary style, dramatic lighting,
[색상 톤], 16:9 aspect ratio, YouTube thumbnail,
no text, no letters, cinematic composition --ar 16:9 --v 6
```

### 역사 인물 썸네일 예시

```
ancient Korean general in traditional armor,
dramatic side lighting, contemplative expression,
sepia toned background with ancient map hints,
historical portrait style, cinematic composition,
no text, no letters, 16:9 aspect ratio --ar 16:9 --v 6
```

### 전쟁/사건 썸네일 예시

```
naval battle scene with traditional Korean warships,
dramatic stormy sky, turbulent seas,
warm sepia and golden tones, epic scale,
historical painting style, cinematic wide shot,
no text, no figures in focus, 16:9 --ar 16:9 --v 6
```

### 한글 텍스트 오버레이 제안

썸네일 이미지와 별도로, 포토샵/캔바에서 추가할 텍스트:

| 요소 | 규격 | 예시 |
|------|------|------|
| **메인 텍스트** | 2~4글자, 굵은 폰트 | "13척", "명량", "반전" |
| **서브 텍스트** | 설명 문구 | "vs 133척", "이순신의 선택" |
| **숫자 강조** | 대비 색상 | "1597" |

---

## 5. 업로드 설정

### 기본 설정

| 항목 | 권장값 |
|------|--------|
| 카테고리 | 교육 (Education) |
| 공개 범위 | 공개 |
| 아동용 콘텐츠 | 아니요 |
| 연령 제한 | 없음 |
| 유료 프로모션 | 아니요 |
| 댓글 | 허용 |
| 라이선스 | 표준 YouTube 라이선스 |
| 언어 | 한국어 |

### 자막 설정

- 자동 생성 자막 활성화
- 한국어 기본 설정
- 영어 자막 추가 권장 (글로벌 역사 관심층)

### 최종 화면/카드

- 최종 화면: 구독 버튼 + 관련 영상 2개
- 카드: 관련 역사 영상 링크 (2~3개)

---

## 출력 형식

### youtube_metadata.json

```json
{
  "project_id": "imjin_war_ep01",
  "generated_at": "2024-01-15T14:30:00",

  "titles": {
    "main": "왜 조선은 명량에서 이겼을까? | 세상에 이런 역사",
    "clickbait": "13척 vs 133척, 그 결과가 충격적입니다",
    "educational": "명량해전의 비밀: 이순신이 승리한 진짜 이유"
  },

  "description": "...",

  "tags": [
    "세상에이런역사", "역사", "한국사", "이순신", "명량해전",
    "임진왜란", "조선", "해전", "역사다큐", "다큐멘터리",
    "Korean history", "Yi Sun-sin", "Battle of Myeongnyang",
    "Imjin War", "Joseon Dynasty"
  ],

  "thumbnail_prompts": [
    {
      "style": "dramatic",
      "prompt": "...",
      "text_overlay": {
        "main": "13척",
        "sub": "vs 133척"
      }
    }
  ],

  "upload_settings": {
    "category": "Education",
    "visibility": "public",
    "made_for_kids": false,
    "language": "ko",
    "allow_comments": true
  },

  "timeline": [
    {"time": "0:00", "label": "인트로"},
    {"time": "0:45", "label": "배경: 임진왜란 7년"},
    {"time": "3:20", "label": "명량해협의 비밀"},
    {"time": "7:15", "label": "13척의 전략"},
    {"time": "11:00", "label": "역사적 교훈"},
    {"time": "12:30", "label": "아웃트로"}
  ]
}
```

### youtube_metadata.md (복사용)

```markdown
## 제목 (선택)

**메인 (권장):** 왜 조선은 명량에서 이겼을까? | 세상에 이런 역사

**대안 1:** 13척 vs 133척, 그 결과가 충격적입니다

**대안 2:** 명량해전의 비밀: 이순신이 승리한 진짜 이유

---

## 설명

[전체 설명문 - 복사 가능]

---

## 태그

세상에이런역사, 역사, 한국사, 이순신, 명량해전, ...

---

## 썸네일

**프롬프트 1:**
[Midjourney 프롬프트]

**텍스트 오버레이:**
- 메인: 13척
- 서브: vs 133척

---

## 업로드 체크리스트

- [ ] 카테고리: 교육
- [ ] 공개 설정: 공개
- [ ] 아동용: 아니요
- [ ] 자막: 자동 생성 활성화
- [ ] 최종 화면: 설정 완료
- [ ] 카드: 관련 영상 연결
```

---

## 실행 방법

```
"유튜브 업로드 정보 만들어줘"
또는
"/youtube-uploader"
```

---

## 체크리스트

- [ ] 제목 40~60자 이내
- [ ] 설명 첫 2줄에 핵심 내용
- [ ] 타임라인 씬 구분과 일치
- [ ] 태그 20~30개 포함
- [ ] 썸네일 프롬프트 "no text" 포함
- [ ] 역사적 정확성 확인 (연도, 인물명)
- [ ] 채널 브랜딩 태그 포함

---

## 금지 사항

- 과장된 허위 제목 (역사적 사실 왜곡)
- 선정적인 썸네일 (역사 다큐 품위 유지)
- 저작권 있는 이미지 직접 사용
- 검증되지 않은 역사적 주장
- 특정 국가/민족 비하 표현
