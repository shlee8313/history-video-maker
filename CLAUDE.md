# History Video Maker - CLAUDE.md

> "세상에 이런 역사" - AI 기반 역사 영상 자동 제작 시스템

## 프로젝트 개요

역사적 사건을 스토리텔링 기반 영상으로 자동 생성하는 파이프라인.
Remotion + FFmpeg + OpenAI TTS를 활용한 풀스택 영상 제작 워크플로우.

## 기술 스택

| 분야 | 기술 | 용도 |
|------|------|------|
| 애니메이션 | Remotion | React 기반 영상 생성 (병렬 렌더링) |
| 음성 | OpenAI TTS API | 나레이션 생성 |
| 영상 처리 | FFmpeg | 합성, 자막, 병합 |
| 데이터 | JSON | 상태 관리, 씬 데이터 |
| 에셋 저장 | Supabase (선택) | 역사 자료 관리 |

## 디렉토리 구조

```
HISTORY_VIDEO_MAKER/
├── CLAUDE.md                 # 이 파일
├── state.json                # 프로젝트 상태 (현재 phase, 설정)
├── history_maker.py          # 메인 유틸리티 (씬 병합, 상태 확인 등)
├── .claude/                  # Claude Code 설정
│   ├── agents/               # Sub-agents (독립 실행 AI 작업자)
│   └── skills/               # Skills (지식/지침 문서)
├── assets/                   # 역사 시각 자료 (공용)
│   ├── maps/                 # 고지도
│   ├── portraits/            # 인물 초상화
│   ├── artifacts/            # 사료 이미지
│   └── backgrounds/          # 배경 텍스처
├── BGM/                      # 배경음악 (랜덤 선택)
├── remotion/                 # Remotion 프로젝트
│   ├── src/
│   │   ├── scenes/           # S1.tsx ~ SN.tsx
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── lib/              # 유틸리티 (animations, styles)
│   │   ├── Root.tsx          # Composition 등록
│   │   └── index.ts
│   ├── public/
│   │   └── assets/           # 에셋 (심볼릭 링크 또는 복사)
│   └── package.json
│
└── output/                   # ⭐ 모든 생성물이 여기에!
    ├── asset_catalog.json    # 에셋 카탈로그 (에이전트용)
    ├── 1_scripts/            # Phase 1-2: 대본
    │   ├── reading_script.json    # Step 2: 전체 대본
    │   ├── scenes.json            # Step 3: 씬 목록
    │   ├── s1.json ~ sN.json      # 개별 씬 상세
    │   └── transitions.json       # Step 4: 전환 텍스트
    │
    ├── 2_audio/              # Phase 3: TTS
    │   ├── hook.mp3               # Step 6: 섹션별 TTS
    │   ├── core.mp3
    │   ├── outro.mp3
    │   ├── hook_timestamps.json   # Step 6.5: Whisper 타임스탬프
    │   ├── core_timestamps.json
    │   ├── outro_timestamps.json
    │   ├── split_points.json      # Step 6.5: AI 매칭 분할 지점
    │   ├── s1.mp3 ~ sN.mp3        # Step 6.5: 씬별 분할 오디오
    │   ├── s1_timing.json ~ sN_timing.json  # Step 6.5: 씬별 타이밍 정보
    │
    ├── 3_images/             # Phase 3: AI 생성 배경
    │   └── bg_s1.png ~ bg_sN.png
    │
    ├── 4_visual/             # Phase 4: 비주얼 설계
    │   └── s1_visual.json ~ sN_visual.json  # Step 7: Layout + Animation 통합
    │
    ├── 5_renders/            # Phase 5: 렌더링 출력
    │   ├── s1.mp4                 # Step 11: 씬별 영상
    │   └── sN.mp4
    │
    ├── 6_scenes/             # Phase 5: 씬별 합성본
    │   ├── s1_final.mp4           # Step 12: TTS+영상+자막
    │   └── sN_final.mp4
    │
    ├── 7_transitions/        # Phase 5: 전환 클립
    │   └── t_after_s1.mp4         # Step 13
    │
    └── final_video.mp4       # Step 14: 최종 결과물
```

## 워크플로우 (14단계)

> **컨텍스트 관리**: 각 Phase 완료 후 `/clear` 명령으로 컨텍스트를 정리하세요.
> 이렇게 하면 메모리를 절약하고 다음 단계를 깨끗한 상태에서 시작할 수 있습니다.

### Phase 1: 기획 (Step 1-2)
```
Step 1: 프로젝트 설정
- 담당: 메인 대화
- 입력: 주제, 길이, 비율(16:9/9:16), 스타일, 서술 관점
- 출력: state.json

Step 2: 역사 대본 작성
- 호출: /history-script-writer (Skill)
- 구조: 5단계 스토리텔링 (도입-전개-위기-반전-결말)
- 출력: output/1_scripts/reading_script.json
```
🔄 **Phase 1 완료 후 → `/clear` 입력** (컨텍스트 정리)

---

### Phase 2: 구조화 (Step 3-4)
```
Step 3: 씬 분할 + 나레이션
- 호출: 3개의 Sub-agent 병렬 실행
  → scene-director-hook (hook + background 섹션)
  → scene-director-core (core 섹션)
  → scene-director-outro (insight + outro 섹션)
- 병합: python history_maker.py merge-scenes
- 출력: output/1_scripts/scenes.json, s1.json ~ sN.json

Step 4: 전환 텍스트 생성
- 담당: 메인 대화
- 호기심 유발 문구 (예: "하지만 그가 숨긴 비밀이 있었다...")
- ⚠️ **필수 전환 3개** (섹션 전환 시점):
  1. `t_before_background`: hook → background 전환 전
  2. `t_before_core`: background → core 전환 전
  3. `t_before_insight`: core → insight 전환 전
- 출력: output/1_scripts/transitions.json
```
🔄 **Phase 2 완료 후 → `/clear` 입력** (컨텍스트 정리)

---

### Phase 3: 에셋 준비 (Step 5-6, 10)
```
Step 5: 역사 에셋 체크
- 담당: Python 스크립트
- 명령: python history_maker.py asset-check
- 동작: scenes.json에서 필요 에셋 추출 → Supabase/로컬 확인
- 출력: output/asset_check_report.json

Step 5.5: 에셋 프롬프트 생성 (누락 에셋이 있을 경우)
- 담당: Python 스크립트 + /image-prompt-writer 스킬
- 과정:
  1. `python history_maker.py asset-prompts` 실행 → 기본 프롬프트 생성
  2. ⚠️ 기본 프롬프트가 너무 일반적이므로 `/image-prompt-writer` 스킬로 구체화 필요!
  3. 스킬이 각 에셋의 role을 보고 구체적인 프롬프트로 재작성
- 출력: output/image_prompts.json (구체화된 버전)
- ⚠️ 사용자에게 이 파일을 제공하여 외부 AI로 이미지 생성 요청

Step 5.6: 에셋 업로드 (이미지 생성 후)
- 담당: Python 스크립트
- 명령: python history_maker.py asset-upload
- 동작: assets/ 폴더의 이미지를 Supabase에 업로드
- 구조: assets/maps/, assets/portraits/, assets/icons/

Step 6: 섹션별 TTS 생성
- 담당: 메인 대화 (OpenAI API 호출)
- API: OpenAI gpt-4o-mini-tts
- 목소리 테스트: python test_voices.py (11개 목소리 샘플 생성)
- 사용 가능 목소리:
  → 여성: coral, nova, shimmer
  → 남성: onyx, echo
  → 중성: alloy, ash, sage, verse
  → 특수: ballad(따뜻함), fable(영국식)
- 톤: 역사 다큐 내레이터 스타일 (instructions 파라미터 활용)
- ⚠️ 씬별이 아닌 **섹션별**로 TTS 생성 (자연스러운 톤 연결)
- 출력: output/2_audio/{hook,core,outro}.mp3

Step 6.5: 타임스탬프 추출 + 씬별 오디오 분할
- 담당: Python 스크립트 + Sub-agent
- 과정:
  1. Whisper API로 섹션별 타임스탬프 추출
     → output/2_audio/{hook,core,outro}_timestamps.json
  2. Sub-agent가 narration_tts와 타임스탬프 매칭하여 분할 지점 결정
     → audio-splitter (Sub-agent) 섹션별 병렬 실행
     → output/2_audio/split_points.json
  3. FFmpeg으로 씬별 오디오 분할
     → output/2_audio/s#.mp3
- 명령: python history_maker.py tts-pipeline
- ⚡ 배치: 섹션별 병렬 처리 (hook, core, outro 동시 매칭)

Step 10: 배경/사료 이미지 준비 (필요시)
- 호출: /image-prompt-writer (Skill)
- 스타일: 양피지, 고전 회화풍
- 출력: output/3_images/
```
🔄 **Phase 3 완료 후 → `/clear` 입력** (컨텍스트 정리)

---

### Phase 4: 영상 코드 생성 (Step 7-9)

> **⚡ 배치 처리**: 씬이 많을 경우 5개씩 묶어서 처리합니다.
> - 5씬 이하: 개별 병렬 실행 (씬당 1 Task)
> - 6~50씬: 5개씩 배치 (예: s1-s5, s6-s10, ...)
> - 50씬 초과: 5개 배치 + 순차 실행

```
Step 7: Visual Prompter - 레이아웃 + 애니메이션 통합 설계
- 호출: visual-prompter (Sub-agent) ← Task tool 사용
- 설계: 좌표/크기/레이어 배치 + Tween/나레이션 동기화
- ⚠️ 반드시 s#_timing.json에서 오디오 길이를 읽어 duration 설정
- ⚡ 배치: 5씬씩 묶어서 1개 Task로 처리
- 출력: output/4_visual/s#_visual.json (Layout + Animation 통합)

Step 8: Remotion 코드 생성
- 호출: remotion-coder (Sub-agent) ← Task tool 사용
- 입력: s#_visual.json + s#_timing.json (2개만!)
- 언어: TypeScript/React (.tsx)
- 핵심: interpolate 애니메이션, 에셋 경로, Sequence 타이밍
- ⚡ 배치: 5씬씩 묶어서 1개 Task로 처리
- 출력: remotion/src/scenes/S#.tsx

Step 9: 코드 검증
- 호출: /code-validator (Skill)
- 체크: TS 문법, React Hooks 규칙, interpolate 설정, 에셋 존재 여부
- 출력: 검증된 S#.tsx
```
🔄 **Phase 4 완료 후 → `/clear` 입력** (컨텍스트 정리)

---

### Phase 5: 렌더링 및 합성 (Step 11-14)
```
Step 11: 렌더링
- 담당: 메인 대화 (Bash 명령)
- 도구: Remotion CLI
- ⚠️ Composition ID는 S1, S2 등 (Root 아님!)
- 명령 (단일): cd remotion && npx remotion render S1 --output=../output/5_renders/s1.mp4 --concurrency=4
- ⚡ 병렬 렌더링 (배치):
  ```bash
  cd remotion && for i in 1 2 3 4 5; do npx remotion render S$i --output="../output/5_renders/s$i.mp4" --concurrency=4 2>&1 | tail -3 & done && wait
  ```
- 출력: output/5_renders/s#.mp4

Step 12: TTS + 영상 합성
- 담당: 메인 대화 (FFmpeg)
- 작업: TTS 오디오 + 렌더링된 영상 합성
- ⚠️ 오디오 길이 + 1초 여유로 -t 옵션 설정
- ⚡ 배치 합성:
  ```bash
  # S1~S5 (duration: 10, 12, 13, 20, 15초)
  cd C:/PROJECT/HISTORY_VIDEO_MAKER && ffmpeg -y -i output/5_renders/s1.mp4 -i output/2_audio/s1.mp3 -t 10 -c:v libx264 -preset fast -c:a aac -map 0:v:0 -map 1:a:0 output/6_scenes/s1_final.mp4 2>&1 | tail -3 &
  ffmpeg -y -i output/5_renders/s2.mp4 -i output/2_audio/s2.mp3 -t 12 -c:v libx264 -preset fast -c:a aac -map 0:v:0 -map 1:a:0 output/6_scenes/s2_final.mp4 2>&1 | tail -3 &
  # ... (각 씬별로 duration 확인 후 +1초로 -t 설정)
  wait
  ```
- 출력: output/6_scenes/s#_final.mp4

Step 13: 전환 클립 생성
- 담당: 메인 대화 (FFmpeg)
- transitions.json 기반 브릿지 영상 (3개 필수, 각 3초)
- 전환 클립 목록:
  1. `t1_before_core.mp4`: background → core 전환 전
  2. `t2_before_insight.mp4`: core → insight 전환 전
  3. `t3_before_outro.mp4`: insight → outro 전환 전
- FFmpeg 명령어 예시:
  ```bash
  cd C:/PROJECT/HISTORY_VIDEO_MAKER/output/7_transitions && \
  ffmpeg -y -f lavfi -i color=c=0x1a1a2e:s=1920x1080:d=3 \
    -vf "drawtext=text='전환 텍스트':fontfile='C\\:/Windows/Fonts/malgun.ttf':fontsize=60:fontcolor=0xD4AF37:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,0.3),0,if(lt(t,1),((t-0.3)/0.7),if(lt(t,2.3),1,(3-t)/0.7)))':shadowcolor=black:shadowx=2:shadowy=2" \
    -c:v libx264 -preset fast -pix_fmt yuv420p t1_before_core.mp4
  ```
- 출력: output/7_transitions/t{1,2,3}_before_{core,insight,outro}.mp4

Step 14: 최종 병합 + BGM 추가
- 담당: 메인 대화 (FFmpeg)
- ⚠️ **반드시 filter_complex concat 사용** (concat demuxer는 타임스탬프 문제 발생)
- 병합 순서: s1~s4 → t1 → s5~s10 → t2 → s11~s13 → t3 → s14
  ```bash
  cd C:/PROJECT/HISTORY_VIDEO_MAKER/output

  # 1. 임시 폴더에 타임스탬프 리셋된 파일 복사
  mkdir -p temp_concat
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14; do
    ffmpeg -y -i "6_scenes/s${i}_final.mp4" -c copy -avoid_negative_ts make_zero "temp_concat/s${i}.mp4"
  done
  # 전환 클립도 복사 (t1, t2, t3)

  # 2. filter_complex concat으로 3단계 병합 (타임스탬프 완전 재생성)
  cd temp_concat
  # Part 1: s1-s4 + t1
  ffmpeg -y -i s1.mp4 -i s2.mp4 -i s3.mp4 -i s4.mp4 -i t1.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a]concat=n=5:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset fast -c:a aac part1.mp4

  # Part 2: s5-s10 + t2
  ffmpeg -y -i s5.mp4 -i s6.mp4 -i s7.mp4 -i s8.mp4 -i s9.mp4 -i s10.mp4 -i t2.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a][5:v][5:a][6:v][6:a]concat=n=7:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset fast -c:a aac part2.mp4

  # Part 3: s11-s13 + t3 + s14
  ffmpeg -y -i s11.mp4 -i s12.mp4 -i s13.mp4 -i t3.mp4 -i s14.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a]concat=n=5:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset fast -c:a aac part3.mp4

  # 최종 병합
  ffmpeg -y -i part1.mp4 -i part2.mp4 -i part3.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset fast -c:a aac ../final_no_bgm.mp4

  # 3. BGM 랜덤 선택 + 믹싱 (8% 볼륨)
  cd C:/PROJECT/HISTORY_VIDEO_MAKER
  BGM=$(ls BGM/*.mp3 | shuf -n 1)
  ffmpeg -y -i output/final_no_bgm.mp4 -i "$BGM" \
    -filter_complex "[1:a]volume=0.08,aloop=loop=-1:size=2e+09[bgm];[0:a][bgm]amix=inputs=2:duration=first[aout]" \
    -map 0:v -map "[aout]" -c:v copy -c:a aac -shortest output/final_video.mp4
  ```
- ⚠️ **주의**: concat demuxer (-f concat)는 타임스탬프 불일치로 오디오 겹침 발생
- BGM 폴더: `BGM/` (Pixabay cinematic 음악)
- BGM 볼륨: 8% (0.08)
- 출력: output/final_video.mp4
```
✅ **완료!**

## state.json 스키마

```json
{
  "project_id": "uuid",
  "topic": "임진왜란",
  "duration_target": 180,
  "aspect_ratio": "16:9",
  "style": "antique",
  "narrator_voice": "nova",
  "phase": "script_saved",
  "current_step": 2,
  "scenes_count": 0,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## Phase 값 (재개 지점)

| Phase | 의미 | 재개 시작점 |
|-------|------|-------------|
| `initialized` | 설정 완료 | Step 2 |
| `script_saved` | 대본 저장 | Step 3 |
| `scenes_completed` | 씬 분할 완료 | Step 5 |
| `tts_completed` | TTS 생성 완료 | Step 7 |
| `code_completed` | 코드 생성 완료 | Step 10 |
| `rendered` | 렌더링 완료 | Step 12 |
| `finished` | 최종 완료 | - |

## 명령어

### 시작
```
"시작" 또는 "start" 입력
```

### 특정 단계 재개
```
"Step 7부터 재개"
"Phase tts_completed부터"
```

### 상태 확인
```
"현재 상태"
"진행률"
```

## Remotion 컴포넌트

### 핵심 컴포넌트
- `HistoryText`: 역사 텍스트 + FadeIn 애니메이션
- `HistoryImage`: 이미지 + FadeIn/Scale 애니메이션
- `CameraContainer`: 줌/팬 카메라 효과
- `Background`: 배경색/이미지 + 오버레이

### 애니메이션 패턴
```typescript
import { interpolate, Easing, useCurrentFrame } from "remotion";

// FadeIn
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});

// 카메라 줌
const zoom = interpolate(frame, [60, 120], [1, 1.3], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.cubic),
});

// 적용
<div style={{ transform: `scale(${zoom})`, opacity }}>
```

## 스타일 가이드

### antique (고풍)
- 배경: 양피지 텍스처, `#2a1a2e`
- 폰트: `Gowun Batang`, `Nanum Myeongjo`
- 색상: `#D4AF37` (금), `#8B4513` (적갈)
- 효과: 그림자, 세피아 톤

### retro (레트로)
- 배경: 그라데이션
- 폰트: `Gmarket Sans`
- 색상: 파스텔 + 포인트 컬러
- 효과: VHS 노이즈

### minimal (미니멀)
- 배경: 단색 `#1a1a1a`
- 폰트: `Pretendard`, `Noto Sans KR`
- 색상: 흑백 + 강조색 1개
- 효과: 클린 트랜지션

## FFmpeg 주요 명령어

### 자막 합성
```bash
ffmpeg -i s1.mp4 -vf "subtitles=s1.srt:force_style='FontSize=24'" s1_sub.mp4
```

### 오디오 합성 (1초 여유 추가)
```bash
# Windows 환경 (PowerShell)
$duration = [math]::Ceiling((ffprobe -v error -show_entries format=duration -of csv=p=0 s1.mp3) + 1)
ffmpeg -i s1.mp4 -i s1.mp3 -t $duration -c:v libx264 -c:a aac -map 0:v:0 -map 1:a:0 s1_final.mp4
```

### 영상 병합
```bash
ffmpeg -f concat -safe 0 -i list.txt -c copy final_video.mp4
```

## 주의사항

1. **에셋 경로**: Remotion에서는 `staticFile("assets/...")` 사용
2. **TTS 길이**: 씬 영상 길이와 TTS 길이 동기화 필수
3. **interpolate**: 반드시 `extrapolateLeft/Right: "clamp"` 설정
4. **해상도**: 16:9 → 1920x1080, 9:16 → 1080x1920

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 투명 배경 | backgroundColor 미설정 | AbsoluteFill에 배경색 추가 |
| 이상한 애니메이션 값 | extrapolate 미설정 | clamp 옵션 추가 |
| 에셋 404 | 경로 불일치 | remotion/public/assets/ 확인 |
| Hook 에러 | 조건문 안에서 Hook 호출 | 컴포넌트 최상위로 이동 |
| 렌더링 느림 | 단일 스레드 | --concurrency=4 옵션 추가 |
| 한글 깨짐 | 폰트 미지정 | fontFamily 추가 |

### Remotion 프로젝트 설정

Remotion 프로젝트는 `remotion/` 폴더에 설정되어 있습니다.

**필수 패키지 (package.json):**
```json
{
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/player": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "remotion": "^4.0.0"
  }
}
```

**에셋 경로 규칙:**
- 에셋 파일 위치: `remotion/public/assets/`
- 프로젝트 루트 `assets/`를 복사하거나 심볼릭 링크
- 코드에서 사용: `staticFile("assets/maps/xxx.png")`

**개발 서버 실행:**
```bash
cd remotion && npm run dev
# http://localhost:3000
```

**렌더링 명령어:**
```bash
# 단일 씬 렌더링 (Composition ID = S1, S2, ... 대문자)
cd remotion && npx remotion render S1 --output=../output/5_renders/s1.mp4 --concurrency=4

# 배치 렌더링 (S1~S5 병렬)
cd remotion && for i in 1 2 3 4 5; do npx remotion render S$i --output="../output/5_renders/s$i.mp4" --concurrency=4 2>&1 | tail -3 & done && wait

# 배치 렌더링 (S6~S10 병렬)
cd remotion && for i in 6 7 8 9 10; do npx remotion render S$i --output="../output/5_renders/s$i.mp4" --concurrency=4 2>&1 | tail -3 & done && wait

# 배치 렌더링 (S11~S14 병렬)
cd remotion && for i in 11 12 13 14; do npx remotion render S$i --output="../output/5_renders/s$i.mp4" --concurrency=4 2>&1 | tail -3 & done && wait
```

### 에셋 설정 (중요!)

**프로젝트 루트의 assets/ 폴더를 Remotion에서 사용하려면:**

```bash
# Windows (관리자 권한 필요)
mklink /D "C:\PROJECT\HISTORY_VIDEO_MAKER\remotion\public\assets" "C:\PROJECT\HISTORY_VIDEO_MAKER\assets"

# 또는 복사
xcopy /E /I "C:\PROJECT\HISTORY_VIDEO_MAKER\assets" "C:\PROJECT\HISTORY_VIDEO_MAKER\remotion\public\assets"
```

## 유틸리티 스크립트 (history_maker.py)

모든 파이프라인 유틸리티가 하나의 파일에 통합되어 있습니다.

### 명령어 목록

```bash
# 씬 병합 및 분할 (Step 3 완료 후 실행)
python history_maker.py merge-scenes

# 프로젝트 상태 확인
python history_maker.py status

# 생성된 파일 정리
python history_maker.py clean           # 전체 정리
python history_maker.py clean --phase 3 # Phase 3 이후만 정리

# 에셋 관리
python history_maker.py asset-check     # 에셋 조회 + 카탈로그 생성
python history_maker.py asset-catalog   # 카탈로그만 생성 (에이전트용)
```

---

## Sub-agents vs Skills

### Sub-agents (`.claude/agents/`)
**독립된 AI 작업자** - 별도 컨텍스트에서 실행되며, 복잡한 작업을 자율적으로 수행

| Agent | 담당 | 특징 |
|-------|------|------|
| `scene-director-hook` | Step 3 (hook+background) | 도입부 씬 분할 |
| `scene-director-core` | Step 3 (core) | 핵심 역사 씬 분할 |
| `scene-director-outro` | Step 3 (insight+outro) | 마무리 씬 분할 |
| `audio-splitter` | Step 6.5 오디오 분할 | Whisper 타임스탬프 ↔ narration_tts 매칭 |
| `visual-prompter` | Step 7 비주얼 설계 | 레이아웃 + 애니메이션 통합 (5씬 배치) |
| `remotion-coder` | Step 8 코드 생성 | React 컴포넌트, interpolate 패턴 |

### Skills (`.claude/skills/`)
**지식/지침 문서** - 메인 대화에 적용되는 가이드라인

| Skill | 담당 | 특징 |
|-------|------|------|
| `history-script-writer` | Step 2 대본 작성 | 5단계 스토리텔링, 역사적 고증 |
| `code-validator` | Step 9 코드 검증 | TS 문법, React Hooks, interpolate 설정 체크 |
| `image-prompt-writer` | Step 10 이미지 프롬프트 | 양피지/고전 스타일 프롬프트 |

---

## 호출 요약표

| Step | 담당 | 호출 방법 | 출력 경로 |
|------|------|-----------|-----------|
| 1 | 메인 대화 | 직접 | `state.json` |
| 2 | Skill | `/history-script-writer` | `output/1_scripts/reading_script.json` |
| 3 | Sub-agent x3 + Python | `scene-director-hook/core/outro` | `output/1_scripts/scenes.json`, `s#.json` |
| 4 | 메인 대화 | 직접 | `output/1_scripts/transitions.json` |
| 5 | 메인 대화 | 직접 | 에셋 체크리스트 |
| 6 | 메인 대화 | OpenAI TTS API | `output/2_audio/{hook,core,outro}.mp3` |
| 6.5 | Sub-agent x3 + FFmpeg | `audio-splitter` | `output/2_audio/s#.mp3` |
| 7 | Sub-agent | `visual-prompter` (Task tool, **5씬 배치**) | `output/4_visual/s#_visual.json` |
| 8 | Sub-agent | `remotion-coder` (Task tool, **5씬 배치**) | `remotion/src/scenes/S#.tsx` |
| 9 | Skill | `/code-validator` | 검증된 `S#.tsx` |
| 10 | Skill | `/image-prompt-writer` | `output/3_images/` |
| 11 | 메인 대화 | Remotion CLI | `output/5_renders/s#.mp4` |
| 12 | 메인 대화 | FFmpeg | `output/6_scenes/s#_final.mp4` |
| 13 | 메인 대화 | FFmpeg | `output/7_transitions/t_before_{background,core,insight}.mp4` |
| 14 | 메인 대화 | FFmpeg | `output/final_video.mp4` |

---

## 파일 의존성 다이어그램

### Phase 4 파이프라인 (Visual → Code)

```
Step 7: visual-prompter (5씬 배치)
┌─────────────────────────────┐
│ 입력:                        │
│  - s#.json (씬 데이터)        │
│  - s#_timing.json (duration)│
│  - asset_catalog.json       │
├─────────────────────────────┤
│ 출력:                        │
│  - s#_visual.json           │
│    (Layout + Animation 통합) │
└─────────────────────────────┘
              ↓
Step 8: remotion-coder (5씬 배치)
┌─────────────────────────────┐
│ 입력 (2개만!):               │
│  - s#_visual.json           │
│  - s#_timing.json           │
├─────────────────────────────┤
│ 출력:                        │
│  - S#.tsx (Remotion 코드)    │
│  - Root.tsx (Composition)   │
└─────────────────────────────┘
```

### s#_visual.json 구조 (통합 형식)

```json
{
  "scene_id": "s1",
  "duration": 9.28,
  "fps": 30,
  "canvas": {"width": 1920, "height": 1080},
  "objects": [
    {"id": "bg_map", "type": "map", "asset": "...", "position": {...}, "zIndex": -100}
  ],
  "sequence": [
    {"step": 1, "time_range": [0, 2.5], "actions": [...]}
  ]
}
```

---

## 배치 처리 가이드라인

### 왜 배치 처리인가?
씬이 많아지면 Task 수가 폭발적으로 증가합니다:
- **개별 처리**: 50씬 × 2단계(비주얼/코드) = **100 Task**
- **배치 처리**: 10배치 × 2단계 = **20 Task** (5배 효율)

### 배치 크기: 5씬
- **이유**: 에이전트 컨텍스트 내에서 안정적으로 처리 가능한 규모
- **분석 근거**: 씬당 입력 ~280줄 + 출력 ~262줄 = ~540줄
  - 5씬 = ~2,700줄 (안전)
  - 20씬 = ~10,800줄 (컨텍스트 한계 초과 위험)
- **병렬 실행**: 배치 단위로 병렬 실행 가능

---

## Remotion vs Motion Canvas 비교

| 항목 | Remotion | Motion Canvas |
|------|----------|---------------|
| 렌더링 속도 | ⚡ 빠름 (병렬) | 느림 (단일) |
| 문법 | React + interpolate | Generator + yield* |
| 배포 | Lambda 지원 | 로컬만 |
| 러닝커브 | React 경험 필요 | 새로운 문법 |

**Remotion 장점:**
- `--concurrency=N` 으로 N배 빠른 렌더링
- React 생태계 (컴포넌트 재사용)
- AWS Lambda로 대규모 병렬 렌더링 가능

---

## /clear 지점 요약

컨텍스트를 깨끗하게 유지하려면 각 Phase 완료 후 `/clear`를 입력하세요.

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1 완료 (Step 1-2)                                    │
│  → output/1_scripts/reading_script.json 생성됨              │
│  → 사용자에게 안내: "/clear 입력 후 Phase 2 진행"            │
├─────────────────────────────────────────────────────────────┤
│  Phase 2 완료 (Step 3-4)                                    │
│  → output/1_scripts/scenes.json, s#.json, transitions.json  │
│  → 사용자에게 안내: "/clear 입력 후 Phase 3 진행"            │
├─────────────────────────────────────────────────────────────┤
│  Phase 3 완료 (Step 5-6, 10)                                │
│  → output/2_audio/s#.mp3, output/3_images/ 준비됨           │
│  → 사용자에게 안내: "/clear 입력 후 Phase 4 진행"            │
├─────────────────────────────────────────────────────────────┤
│  Phase 4 완료 (Step 7-9)                                    │
│  → output/4_visual/, remotion/src/scenes/S#.tsx 완료        │
│  → 사용자에게 안내: "/clear 입력 후 Phase 5 진행"            │
├─────────────────────────────────────────────────────────────┤
│  Phase 5 완료 (Step 11-14)                                  │
│  → output/final_video.mp4 완성!                             │
│  → 프로젝트 완료                                            │
└─────────────────────────────────────────────────────────────┘
```

---

**"시작"을 입력하면 Step 1부터 역사 영상 제작을 시작합니다.**
