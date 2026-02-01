# 파이프라인 리팩토링 계획

> 작성일: 2026-02-01
> 수정일: 2026-02-01 (audio-splitter 유지, visual-prompter/review 제외)
> 목적: 에이전트/스킬 정리 및 파이프라인 일관성 확보

---

## 1. 삭제 대상 파일

### 1.1 스킬 삭제

| 파일 | 이유 |
|------|------|
| `.claude/skills/history-script-writer/SKILL.md` | `script-writer`가 모든 카테고리 처리. history 전용 불필요 |

### 1.2 에이전트 삭제

| 파일 | 이유 |
|------|------|
| `.claude/agents/scene-director-core.md` | `scene-director`가 모두 처리 |
| `.claude/agents/scene-director-hook.md` | `scene-director`가 모두 처리 |
| `.claude/agents/scene-director-outro.md` | `scene-director`가 모두 처리 |
| `.claude/agents/remotion-coder.md` | `scene-coder`가 모두 처리 |
| `.claude/agents/visual-prompter.md` | `scene-coder`가 `s{n}.json`에서 직접 코드 생성 |
| `.claude/agents/visual-review.md` | `visual-prompter` 미사용으로 불필요 |

### 1.3 유지 대상 (삭제 안함!)

| 파일 | 이유 |
|------|------|
| `.claude/agents/audio-splitter.md` | **오디오 분할 시점 결정 담당 (scene-splitter와 다른 역할!)** |

> ⚠️ **audio-splitter vs scene-splitter 차이:**
> - **audio-splitter**: 섹션 오디오를 씬별로 분할하는 **시점(split points)** 결정 → `split_points_{section}.json`
> - **scene-splitter**: Whisper 단어와 자막 **타이밍 매칭** → `s{n}_timed.json`

---

## 2. 수정 대상 파일

### 2.1 CLAUDE.md 수정

#### 2.1.1 디렉토리 구조에 `assets/images/` 추가

**위치:** 디렉토리 구조 섹션

```markdown
├── assets/                      # 시각 에셋 (공용)
│   ├── icons/
│   ├── portraits/
│   ├── maps/
│   ├── images/                  # ← 추가
│   └── backgrounds/
```

#### 2.1.2 Phase 3에 audio-splitter 에이전트 추가

**위치:** Phase 3: AUDIO 섹션

**현재:**
```markdown
### Phase 3: AUDIO (음성 + 타이밍)

담당: Python CLI + scene-splitter 에이전트
```

**수정 후:**
```markdown
### Phase 3: AUDIO (음성 + 타이밍)

담당: Python CLI + audio-splitter 에이전트 + scene-splitter 에이전트

**Step 3-1: TTS 생성 (Python)**
python pipeline.py audio --voice nova

**Step 3-2: 오디오 분할 시점 결정 (에이전트)**
audio-splitter 에이전트: 섹션별 오디오를 씬 단위로 분할할 시점 결정
- 입력: scenes_{section}.json, {section}_timestamps.json, scenes.json
- 출력: split_points_{section}.json

**Step 3-3: 자막 타이밍 매칭 (에이전트)**
scene-splitter 에이전트: Whisper 단어와 subtitle_segments 의미적 매칭
- 입력: s{n}.json, {section}_whisper.json
- 출력: s{n}_timed.json, s{n}.srt
```

#### 2.1.3 Phase 4에 code-validator 스킬 추가 (선택)

**위치:** Phase 4: CODE 섹션

**추가할 내용:**
```markdown
**Step 4-2: 코드 검증 (선택)**
code-validator 스킬로 생성된 TSX 코드 검증
- 문법 검증 (React/TypeScript)
- 로직 검증 (Hook 규칙, interpolate 옵션)
- 타이밍 검증 (duration 일치)
```

> ⚠️ **visual-prompter, visual-review는 추가하지 않음!**
> scene-coder가 `s{n}.json`에서 직접 TSX 코드를 생성하므로 별도의 visual.json 단계가 불필요.

---

### 2.2 scene-splitter.md 출력 구조 수정

**파일:** `.claude/agents/scene-splitter.md`

**현재 구조 (변경 대상):**
```json
{
  "timing": {
    "section_audio": "output/3_audio/hook.mp3",
    "scene_start": 0.0,
    "scene_end": 8.5,
    "duration": 8.5
  },
  "captions": [...]
}
```

**수정 후 구조 (pipeline.py와 일치):**
```json
{
  "scene_id": "s1",
  "section": "hook",
  "duration": 8.5,
  "section_start": 0.0,
  "section_end": 8.5,
  "subtitle_segments": [
    { "index": 1, "text": "영하 20도.", "start": 0.0, "end": 0.9 },
    { "index": 2, "text": "보일러도 없고...", "start": 1.2, "end": 3.1 }
  ]
}
```

**수정 사항:**
1. `timing` 중첩 객체 제거 → 최상위로 이동
2. `captions` → `subtitle_segments`로 이름 변경
3. `words_matched` 필드 제거 (pipeline.py에서 사용 안함)
4. 경로: `output/2_audio/s{n}_timed.json` (기존과 동일)

---

### 2.3 asset-checker/SKILL.md 수정

**파일:** `.claude/skills/asset-checker/SKILL.md`

**수정 사항:**
1. 디렉토리 구조에 `assets/images/` 폴더 명시
2. `image` 타입 에셋 저장 위치 명확화

**추가할 내용 (Step 1.5 섹션):**
```markdown
ASSET_FOLDERS = [
    "assets/icons",
    "assets/portraits",
    "assets/maps",
    "assets/artifacts",
    "assets/images",      # image 타입용 폴더 ← 이미 있음, 확인만
    "output/3_backgrounds"
]
```

---

### 2.4 pipeline.py 수정

#### 2.4.1 sync-assets 명령어 추가

**위치:** Phase 5 명령어 섹션

```python
def cmd_sync_assets(args):
    """에셋 동기화 (assets/ → remotion/public/assets/)"""
    print("\n🔄 에셋 동기화 시작")

    import shutil

    # 복사할 폴더 목록
    asset_folders = ["icons", "portraits", "maps", "artifacts", "images"]

    for folder in asset_folders:
        src = ASSETS_DIR / folder
        dst = REMOTION_ASSETS_DIR / folder

        if src.exists():
            dst.mkdir(parents=True, exist_ok=True)
            for f in src.glob("*.png"):
                shutil.copy2(f, dst / f.name)
            for f in src.glob("*.jpg"):
                shutil.copy2(f, dst / f.name)
            print(f"  [OK] {folder}/")

    # 배경 이미지 동기화
    bg_src = BACKGROUNDS_DIR
    bg_dst = REMOTION_ASSETS_DIR / "backgrounds"
    if bg_src.exists():
        bg_dst.mkdir(parents=True, exist_ok=True)
        for f in bg_src.glob("bg_s*.png"):
            shutil.copy2(f, bg_dst / f.name)
        print(f"  [OK] backgrounds/")

    # 캐시 삭제
    cache_dir = REMOTION_DIR / "node_modules" / ".cache"
    if cache_dir.exists():
        shutil.rmtree(cache_dir)
        print(f"  [OK] 캐시 삭제")

    print("\n[OK] 에셋 동기화 완료!")
```

**argparse 등록:**
```python
p_sync = subparsers.add_parser("sync-assets", help="에셋 동기화")
p_sync.set_defaults(func=cmd_sync_assets)
```

#### 2.4.2 전환 관련 주석 정리

**현재 상태:** 이미 주석 처리됨 (`render_transition`, `composite_transition`)

**추가 정리:**
```python
# ============================================================
# 전환 클립 관련 (현재 미사용, 향후 확장 예정)
# ============================================================
# def render_transition(trans_id: str, concurrency: int = 4):
#     """전환 렌더링 (현재 미사용)
#
#     향후 전환 클립 사용 시 활성화 예정.
#     섹션 간 연결은 현재 gap(마지막 프레임 유지)으로 처리.
#     """
#     pass

# def composite_transition(trans_idx: int):
#     """전환 배경 합성 (현재 미사용)"""
#     pass
```

---

## 3. 삭제/수정 실행 순서

### Phase 1: 파일 삭제

```bash
# 1. 불필요한 에이전트 삭제
rm .claude/agents/scene-director-core.md
rm .claude/agents/scene-director-hook.md
rm .claude/agents/scene-director-outro.md
rm .claude/agents/remotion-coder.md
rm .claude/agents/visual-prompter.md
rm .claude/agents/visual-review.md

# 2. 중복 스킬 삭제
rm -rf .claude/skills/history-script-writer/
```

### Phase 2: 파일 수정

1. **CLAUDE.md**
   - 디렉토리 구조에 `assets/images/` 추가
   - Phase 3에 audio-splitter 에이전트 추가
   - Phase 4에 code-validator 스킬 추가 (선택)

2. **scene-splitter.md**
   - 출력 구조를 pipeline.py와 일치시키기

3. **asset-checker/SKILL.md**
   - `assets/images/` 폴더 존재 확인 (이미 있음)

4. **pipeline.py**
   - `cmd_sync_assets()` 함수 추가
   - argparse에 `sync-assets` 명령어 등록
   - 전환 관련 주석 정리

### Phase 3: 검증

1. `python pipeline.py status` 실행하여 에러 없음 확인
2. CLAUDE.md 읽어서 워크플로우 일관성 확인

---

## 4. 수정 후 파이프라인 요약

### 에이전트 목록 (정리 후)

| 에이전트 | Phase | 역할 |
|----------|-------|------|
| scene-director | 2 | 씬 분할 + 배경 프롬프트 |
| audio-splitter | 3 | **오디오 분할 시점 결정** |
| scene-splitter | 3 | 자막 타이밍 의미적 매칭 |
| scene-coder | 4 | Remotion TSX 생성 |

### 스킬 목록 (정리 후)

| 스킬 | Phase | 역할 |
|------|-------|------|
| script-writer | 1 | 대본 작성 (모든 카테고리) |
| asset-checker | 2.5 | 에셋 확인/프롬프트 생성 |
| remotion | 4 | Remotion 베스트 프랙티스 |
| code-validator | 4 (선택) | TSX 코드 검증 |
| youtube-uploader | 6 이후 | 업로드 메타데이터 |
| image-prompt-writer | 2.5 (선택) | AI 이미지 프롬프트 |

### CLI 명령어 (추가 후)

| 명령어 | Phase | 역할 |
|--------|-------|------|
| `sync-assets` | 5 | 에셋 동기화 (신규) |

---

## 5. 변경 영향도

| 변경 | 영향 | 대응 |
|------|------|------|
| history-script-writer 삭제 | 역사 카테고리 대본 작성 | script-writer가 처리 |
| scene-director 분할 에이전트 삭제 | 섹션별 분할 호출 | scene-director 단일 호출 |
| remotion-coder 삭제 | Remotion 코드 생성 | scene-coder가 처리 |
| visual-prompter/review 삭제 | 시각 설계 | scene-coder가 s{n}.json에서 직접 처리 |
| audio-splitter 유지 | 오디오 분할 시점 | Phase 3 워크플로우에 명시 |
| s{n}_timed.json 구조 변경 | scene-coder 입력 | scene-coder.md도 동기화 필요 |

---

## 6. 체크리스트

### 삭제 대상
- [ ] history-script-writer 폴더 삭제
- [ ] scene-director 분할 에이전트 3개 삭제 (core, hook, outro)
- [ ] remotion-coder.md 삭제
- [ ] visual-prompter.md 삭제
- [ ] visual-review.md 삭제

### 수정 대상
- [ ] CLAUDE.md 디렉토리 구조 수정 (assets/images/ 추가)
- [ ] CLAUDE.md Phase 3 수정 (audio-splitter 추가)
- [ ] CLAUDE.md Phase 4 수정 (code-validator 선택 추가)
- [ ] scene-splitter.md 출력 구조 수정
- [ ] pipeline.py에 sync-assets 추가
- [ ] pipeline.py 전환 주석 정리
- [ ] scene-coder.md에서 s{n}_timed.json 입력 구조 확인

### 검증
- [ ] python pipeline.py status 실행
- [ ] 워크플로우 일관성 확인

---

## 7. audio-splitter vs scene-splitter 상세 비교

> 이 두 에이전트는 **서로 다른 역할**을 수행합니다!

| 항목 | audio-splitter | scene-splitter |
|------|----------------|----------------|
| **역할** | 오디오 분할 **시점** 결정 | 자막 **타이밍** 매칭 |
| **입력** | scenes_{section}.json, {section}_timestamps.json, scenes.json | s{n}.json, {section}_whisper.json |
| **출력** | split_points_{section}.json | s{n}_timed.json, s{n}.srt |
| **목적** | 섹션 오디오를 씬 단위로 나누는 포인트 계산 | Whisper 단어와 자막 세그먼트 동기화 |

### 워크플로우 순서

```
[TTS 생성] → python pipeline.py audio
    ↓
[오디오 분할 시점] → audio-splitter 에이전트
    ↓
[자막 타이밍] → scene-splitter 에이전트
    ↓
[TSX 생성] → scene-coder 에이전트
```
