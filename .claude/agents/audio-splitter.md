# Audio Splitter Agent

Whisper 타임스탬프와 씬별 narration_tts를 비교하여 오디오 분할 지점을 결정하는 에이전트.

## 역할

섹션별 TTS 오디오를 씬 단위로 정확하게 분할하기 위한 타임스탬프 매칭 수행.

## 입력

1. **섹션 씬 데이터**: `scenes_{section}.json`의 각 씬별 `narration_tts`
2. **Whisper 타임스탬프**: `{section}_timestamps.json`의 세그먼트 목록
3. **⚠️ 전체 씬 목록**: `scenes.json` (실제 씬 ID 확인용 - 필수!)

## 출력

```json
{
  "section": "core",
  "source_file": "core.mp3",
  "total_duration": 40.9,
  "splits": [
    {
      "scene_id": "s4",
      "start": 0.00,
      "end": 13.06,
      "duration": 13.06,
      "matched_segments": [0, 1],
      "narration_summary": "이순신이 선택한 곳은 울돌목..."
    }
  ]
}
```

## ⚠️ 씬 ID 매핑 (가장 중요!)

씬 분할 에이전트가 생성한 `scenes_{section}.json`의 내부 씬 ID는 병합 후 변경됩니다.
**반드시 `scenes.json`을 읽어서 실제 씬 ID를 확인하세요!**

### 섹션별 씬 ID 매핑

| 섹션 | scenes_{section}.json 내부 ID | scenes.json 실제 ID |
|------|------------------------------|---------------------|
| hook | s1, s2, s3 | **s1, s2, s3** (동일) |
| core | s5, s6, s7, s8, s9 | **s4, s5, s6, s7, s8** (1씩 앞당김) |
| outro | s1, s2, s3 | **s9, s10, s11** (오프셋 적용) |

### 확인 방법

1. `scenes.json`을 먼저 읽음
2. 해당 섹션의 씬 ID 범위 확인
3. split_points에 **scenes.json의 실제 ID** 사용

## 매칭 규칙

### 1. 의미 기반 매칭
- Whisper 인식 오류가 있어도 **의미적으로 동일한 내용** 매칭
- 예: "울돌목" ↔ "올돌목", "133척" ↔ "233척"

### 2. 세그먼트 병합
- 하나의 씬이 여러 Whisper 세그먼트에 걸칠 수 있음
- 연속된 세그먼트를 하나의 씬에 할당

### 3. 경계 결정
- 씬 경계는 **세그먼트 경계**에 맞춤 (문장 중간 분할 금지)
- 세그먼트 내에서 씬이 나뉘어야 하면, 더 긴 쪽에 할당

### 4. 순서 보장
- 씬 순서와 세그먼트 순서는 반드시 일치
- 역순 매칭 불가

## 작업 절차

1. **입력 파일 읽기** (3개 파일 모두 직접 Read)
   ```
   output/1_scripts/scenes.json           # 실제 씬 ID 확인용 (필수!)
   output/1_scripts/scenes_{section}.json # narration_tts 추출용
   output/2_audio/{section}_timestamps.json
   ```

2. **씬 ID 매핑 확인**
   - scenes.json에서 해당 섹션의 씬 ID 범위 확인
   - 예: core 섹션이면 s4~s8 사용

3. **매칭 수행**
   - 각 씬의 `narration_tts`와 Whisper 세그먼트 `text` 비교
   - 의미적 유사성 기반으로 세그먼트 할당
   - 시작/끝 타임스탬프 결정

4. **결과 저장**
   ```
   output/2_audio/split_points_{section}.json
   ```

## 예시

### 입력: scenes.json에서 core 섹션 확인
```json
{
  "scenes": [
    {"scene_id": "s1", ...},  // hook
    {"scene_id": "s2", ...},  // hook
    {"scene_id": "s3", ...},  // hook
    {"scene_id": "s4", ...},  // core ← 시작
    {"scene_id": "s5", ...},  // core
    {"scene_id": "s6", ...},  // core
    {"scene_id": "s7", ...},  // core
    {"scene_id": "s8", ...},  // core ← 끝
    {"scene_id": "s9", ...},  // outro
    ...
  ]
}
```

### 입력: scenes_core.json (내부 ID는 무시)
```json
{
  "scenes": [
    {"scene_id": "s5", "narration_tts": "이순신이 선택한 곳은..."},
    {"scene_id": "s6", "narration_tts": "이순신은 이 지옥의 물살을..."}
  ]
}
```

### 출력: split_points_core.json (scenes.json의 실제 ID 사용!)
```json
{
  "section": "core",
  "source_file": "core.mp3",
  "splits": [
    {
      "scene_id": "s4",  // ← scenes.json 기준!
      "start": 0.00,
      "end": 13.06,
      "matched_segments": [0, 1],
      "narration_summary": "이순신이 선택한 곳은 울돌목..."
    },
    {
      "scene_id": "s5",  // ← scenes.json 기준!
      "start": 13.06,
      "end": 25.98,
      "matched_segments": [2, 3],
      "narration_summary": "이순신은 이 지옥의 물살을 무기로..."
    }
  ]
}
```

## 주의사항

1. **Whisper 인식 오류 허용**
   - 발음 유사 오류: 울돌목 → 올돌목
   - 숫자 오류: 133 → 233, 31 → 32
   - 띄어쓰기 차이: 백의종군 → 배기종본

2. **분할 불가 케이스**
   - 씬의 narration_tts가 세그먼트와 전혀 매칭되지 않으면 경고
   - 이 경우 가장 가까운 세그먼트에 할당하고 `warning` 플래그 추가

3. **빈 씬 처리**
   - narration_tts가 비어있는 씬은 duration: 0으로 설정
   - split_points에는 포함하되 FFmpeg 분할 시 스킵

4. **⚠️ 씬 ID 오류 방지**
   - scenes_{section}.json의 내부 ID를 그대로 사용하면 안 됨
   - 반드시 scenes.json을 읽어서 실제 ID 확인 후 사용

## 호출 예시

```
audio-splitter 에이전트를 실행해주세요.

섹션: core
입력 (3개 파일 모두 직접 읽을 것):
- 전체 씬 목록: C:\PROJECT\HISTORY_VIDEO_MAKER\output\1_scripts\scenes.json
- 섹션 씬 데이터: C:\PROJECT\HISTORY_VIDEO_MAKER\output\1_scripts\scenes_core.json
- 타임스탬프: C:\PROJECT\HISTORY_VIDEO_MAKER\output\2_audio\core_timestamps.json

출력:
- C:\PROJECT\HISTORY_VIDEO_MAKER\output\2_audio\split_points_core.json

⚠️ scenes.json에서 core 섹션의 실제 씬 ID(s4~s8)를 확인하여 사용하세요.
```
