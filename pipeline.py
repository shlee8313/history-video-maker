#!/usr/bin/env python3
"""
Video Story Maker - Pipeline CLI

사용법:
    python pipeline.py <command> [options]

Phase 1: SCRIPT
    (스킬 사용: /script-writer)

Phase 2: STRUCTURE
    (에이전트 사용: scene-director)

Phase 3: AUDIO
    audio           TTS 생성 + Whisper 타임스탬프

Phase 4: CODE
    (에이전트 사용: scene-splitter, scene-coder)
    update-root     Root.tsx 자동 업데이트

Phase 5: RENDER
    render          Remotion 렌더링 (기본: 배경 포함, --transparent: 투명)
    composite       FFmpeg 배경 합성 (투명 렌더링 시에만 필요)
    section-merge   섹션 합성 (concat + audio)

Phase 6: FINAL
    final           최종 병합 (전환 + BGM)

유틸리티:
    status          프로젝트 상태 확인
    clean           output 폴더 초기화 (에셋 유지)
    init            프로젝트 완전 초기화 (에셋 포함)
    asset-catalog   에셋 카탈로그 생성

예시:
    python pipeline.py audio --voice nova
    python pipeline.py render                    # 배경 포함 렌더링 (기본)
    python pipeline.py render --transparent      # 투명 렌더링 (FFmpeg 합성 필요)
    python pipeline.py render --section hook
    python pipeline.py final --bgm-volume 0.08
"""

import json
import sys
import argparse
import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# .env 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# OpenAI for TTS/Whisper
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# ============================================================
# 경로 설정
# ============================================================
BASE_DIR = Path(__file__).parent
STATE_FILE = BASE_DIR / "output" / "state.json"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
BGM_DIR = BASE_DIR / "BGM"
TRANSITION_ASSETS_DIR = BASE_DIR / "Transition"

# 출력 디렉토리 (CLAUDE.md 구조에 맞춤)
SCRIPTS_DIR = OUTPUT_DIR / "1_scripts"
AUDIO_DIR = OUTPUT_DIR / "2_audio"
BACKGROUNDS_DIR = OUTPUT_DIR / "3_backgrounds"
IMAGES_DIR = OUTPUT_DIR / "3_images"
VISUAL_DIR = OUTPUT_DIR / "4_visual"
RENDERS_DIR = OUTPUT_DIR / "5_renders"
COMPOSITE_DIR = OUTPUT_DIR / "6_scenes"      # 배경 합성된 씬
SCENES_DIR = OUTPUT_DIR / "1_scripts"        # scenes.json 위치
SECTIONS_DIR = OUTPUT_DIR / "6_sections"
TRANSITIONS_DIR = OUTPUT_DIR / "7_transitions"

# Remotion 디렉토리
REMOTION_DIR = BASE_DIR / "remotion"
REMOTION_SCENES_DIR = REMOTION_DIR / "src" / "scenes"
REMOTION_TRANSITIONS_DIR = REMOTION_DIR / "src" / "transitions"
REMOTION_ASSETS_DIR = REMOTION_DIR / "public" / "assets"

# ============================================================
# 섹션 정보 동적 로드
# ============================================================
# 섹션 정보는 reading_script.json 또는 scenes.json에서 동적으로 로드
# 하드코딩된 기본값은 파일이 없을 때만 사용

def get_sections() -> List[str]:
    """
    섹션 목록을 동적으로 로드
    우선순위: scenes.json > reading_script.json > 기본값
    """
    # 1. scenes.json에서 로드 (가장 정확)
    scenes_path = SCRIPTS_DIR / "scenes.json"
    if scenes_path.exists():
        try:
            with open(scenes_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                sections_info = data.get("meta", {}).get("sections", {})
                if sections_info:
                    # 섹션 순서 보장을 위해 scenes 배열에서 순서 추출
                    seen = []
                    for scene in data.get("scenes", []):
                        section = scene.get("section")
                        if section and section not in seen:
                            seen.append(section)
                    if seen:
                        return seen
        except Exception as e:
            print(f"[WARN] Failed to load scenes.json: {e}")

    # 2. reading_script.json에서 로드
    script_path = SCRIPTS_DIR / "reading_script.json"
    if script_path.exists():
        try:
            with open(script_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                sections = [s["id"] for s in data.get("sections", [])]
                if sections:
                    return sections
        except Exception as e:
            print(f"[WARN] Failed to load reading_script.json: {e}")

    # 3. 기본값 (fallback)
    print("[WARN] Using default sections - no script files found")
    return ["hook", "background", "core1", "core2", "core3", "insight", "outro"]


def get_section_scenes(section: str) -> List[str]:
    """특정 섹션의 씬 ID 목록 반환"""
    scenes_path = SCRIPTS_DIR / "scenes.json"
    if scenes_path.exists():
        try:
            with open(scenes_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                sections_info = data.get("meta", {}).get("sections", {})
                return sections_info.get(section, {}).get("scenes", [])
        except:
            pass
    return []


def get_all_scenes() -> List[str]:
    """모든 씬 ID 목록 반환 (순서대로)"""
    scenes_path = SCRIPTS_DIR / "scenes.json"
    if scenes_path.exists():
        try:
            with open(scenes_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [s["scene_id"] for s in data.get("scenes", [])]
        except:
            pass
    return []


def validate_parts_info() -> Dict[str, Any]:
    """
    state.json의 parts 정보를 검증하고 문제점 반환

    Returns:
        {
            "valid": bool,
            "errors": List[str],
            "warnings": List[str],
            "parts_info": Dict (유효한 경우)
        }
    """
    result = {"valid": True, "errors": [], "warnings": [], "parts_info": None}

    state = load_state()
    sections_info = state.get("sections", {})

    if not sections_info:
        result["valid"] = False
        result["errors"].append("state.json에 sections 정보가 없습니다. scene-director 실행이 필요합니다.")
        return result

    # 필수 필드 확인
    required_fields = ["all", "parts", "part_scenes"]
    for field in required_fields:
        if field not in sections_info:
            result["valid"] = False
            result["errors"].append(f"sections.{field} 필드가 없습니다.")

    if not result["valid"]:
        return result

    all_sections = sections_info.get("all", [])
    parts = sections_info.get("parts", {})
    part_scenes = sections_info.get("part_scenes", {})
    max_scenes = sections_info.get("max_scenes_per_part", 10)

    # Part와 part_scenes 키 일치 확인
    if set(parts.keys()) != set(part_scenes.keys()):
        result["valid"] = False
        result["errors"].append("parts와 part_scenes의 키가 일치하지 않습니다.")

    # 각 Part의 씬 개수 확인
    for part_name, scenes in part_scenes.items():
        if len(scenes) > max_scenes:
            result["warnings"].append(f"{part_name}: {len(scenes)}개 씬 (최대 {max_scenes}개 권장 초과)")

        # 씬 파일 존재 확인
        for scene_id in scenes:
            scene_file = SCRIPTS_DIR / f"{scene_id}.json"
            if not scene_file.exists():
                result["errors"].append(f"{scene_id}.json 파일이 없습니다.")
                result["valid"] = False

    # 모든 섹션이 parts에 포함되어 있는지 확인
    sections_in_parts = []
    for sections_list in parts.values():
        sections_in_parts.extend(sections_list)

    missing_sections = set(all_sections) - set(sections_in_parts)
    if missing_sections:
        result["valid"] = False
        result["errors"].append(f"parts에 누락된 섹션: {missing_sections}")

    extra_sections = set(sections_in_parts) - set(all_sections)
    if extra_sections:
        result["warnings"].append(f"all에 없는 섹션이 parts에 포함됨: {extra_sections}")

    if result["valid"]:
        result["parts_info"] = {
            "total_parts": len(parts),
            "total_scenes": sum(len(s) for s in part_scenes.values()),
            "parts": parts,
            "part_scenes": part_scenes
        }

    return result


def cmd_validate_parts(args):
    """Part 분할 정보 검증"""
    print("\n[VALIDATE] Part 분할 정보 검증")
    print("=" * 50)

    result = validate_parts_info()

    if result["errors"]:
        print("\n❌ 오류:")
        for err in result["errors"]:
            print(f"  - {err}")

    if result["warnings"]:
        print("\n⚠️ 경고:")
        for warn in result["warnings"]:
            print(f"  - {warn}")

    if result["valid"]:
        info = result["parts_info"]
        print(f"\n✅ 검증 통과")
        print(f"  - 총 Part: {info['total_parts']}개")
        print(f"  - 총 씬: {info['total_scenes']}개")
        print("\n📋 Part 구성:")
        for part_name, sections in info["parts"].items():
            scenes = info["part_scenes"][part_name]
            print(f"  {part_name}: {sections} ({len(scenes)}개 씬)")
    else:
        print("\n❌ 검증 실패. scene-director 에이전트를 다시 실행해주세요.")

    return result["valid"]


# 전역 변수는 함수 호출로 대체 (lazy loading)
# 사용처에서 get_sections() 호출
SECTIONS = None  # Deprecated: use get_sections() instead


# ============================================================
# 유틸리티 함수
# ============================================================
def load_json(path: Path) -> Optional[Dict]:
    """JSON 파일 로드"""
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def save_json(path: Path, data: Dict, silent: bool = False):
    """JSON 파일 저장"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    if not silent:
        print(f"[OK] Saved: {path}")


def load_state() -> Dict:
    """state.json 로드"""
    if STATE_FILE.exists():
        return load_json(STATE_FILE)
    return {
        "project_id": None,
        "category": None,
        "topic": None,
        "phase": "initialized",
        "current_step": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }


def save_state(state: Dict):
    """state.json 저장"""
    state["updated_at"] = datetime.now().isoformat()
    save_json(STATE_FILE, state)


def ensure_dirs():
    """필요한 디렉토리 생성"""
    dirs = [
        SCRIPTS_DIR,
        AUDIO_DIR,
        BACKGROUNDS_DIR,
        IMAGES_DIR,
        VISUAL_DIR,
        RENDERS_DIR,
        SCENES_DIR,
        SECTIONS_DIR,
        TRANSITIONS_DIR,
        REMOTION_SCENES_DIR,
        REMOTION_TRANSITIONS_DIR,
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)


def get_scenes_for_section(section: str) -> List[str]:
    """특정 섹션의 씬 목록 반환"""
    scenes_file = SCRIPTS_DIR / "scenes.json"
    if not scenes_file.exists():
        print(f"[ERROR] scenes.json 없음")
        return []

    scenes_data = load_json(scenes_file)
    if not scenes_data or "meta" not in scenes_data:
        return []

    section_info = scenes_data["meta"]["sections"].get(section, {})
    return section_info.get("scenes", [])


# ============================================================
# Phase 2: STRUCTURE (merge-scenes)
# ============================================================
def cmd_merge_scenes(args):
    """씬 파일 병합 (scenes_*.json -> scenes.json + s#.json)"""
    print("\n[MERGE] Scene files merging...")

    # 병합할 파일 찾기
    section_files = {
        "hook": SCRIPTS_DIR / "scenes_hook.json",
        "background": None,  # hook 파일에 포함
        "core1": SCRIPTS_DIR / "scenes_core1.json",
        "core2": SCRIPTS_DIR / "scenes_core2.json",
        "core3": SCRIPTS_DIR / "scenes_core3.json",
        "insight": None,  # outro 파일에 포함
        "outro": SCRIPTS_DIR / "scenes_outro.json",
    }

    all_scenes = []
    all_backgrounds = []
    section_scene_map = {}

    # 각 파일에서 씬 수집
    for section, file_path in section_files.items():
        if file_path and file_path.exists():
            data = load_json(file_path)
            if data and "scenes" in data:
                for scene in data["scenes"]:
                    all_scenes.append(scene)
                    sec = scene.get("section", section)
                    if sec not in section_scene_map:
                        section_scene_map[sec] = []
                    section_scene_map[sec].append(scene["scene_id"])

            if data and "backgrounds" in data:
                all_backgrounds.extend(data["backgrounds"])

    if not all_scenes:
        print("[ERROR] No scenes to merge.")
        return

    # 섹션 순서대로 씬 정렬 및 ID 재부여
    section_order = ["hook", "background", "core1", "core2", "core3", "insight", "outro"]
    sorted_scenes_data = []
    new_section_map = {}
    scene_counter = 1

    for section in section_order:
        section_scenes = [s for s in all_scenes if s.get("section") == section]
        if not section_scenes:
            continue

        new_section_map[section] = {"scenes": [], "count": 0}

        for scene in section_scenes:
            new_scene_id = f"s{scene_counter}"
            scene["scene_id"] = new_scene_id
            new_section_map[section]["scenes"].append(new_scene_id)
            new_section_map[section]["count"] += 1
            sorted_scenes_data.append(scene)
            scene_counter += 1

    # 씬 데이터 업데이트 및 개별 파일 저장
    sorted_scenes = []
    for scene in sorted_scenes_data:
        new_id = scene["scene_id"]

        # 개별 씬 파일 저장
        scene_file = SCRIPTS_DIR / f"{new_id}.json"
        save_json(scene_file, scene, silent=True)

        # scenes.json용 요약 데이터
        sorted_scenes.append({
            "scene_id": new_id,
            "section": scene.get("section"),
            "narration_preview": scene.get("narration_tts", "")[:30] + "...",
            "bg_id": scene.get("bg_id")
        })

    # scenes.json 생성
    scenes_json = {
        "meta": {
            "total_scenes": len(sorted_scenes),
            "duration_target": 300,
            "sections": new_section_map
        },
        "scenes": sorted_scenes,
        "backgrounds": all_backgrounds
    }

    save_json(SCRIPTS_DIR / "scenes.json", scenes_json)

    # bg_prompts.json 생성 (배경 프롬프트 추출)
    bg_prompts = {}
    for scene in all_scenes:
        bg_id = scene.get("bg_id")
        bg_prompt = scene.get("bg_prompt")
        if bg_id and bg_prompt and bg_id not in bg_prompts:
            bg_prompts[bg_id] = {
                "bg_id": bg_id,
                "prompt": bg_prompt,
                "scenes": []
            }
        if bg_id in bg_prompts:
            bg_prompts[bg_id]["scenes"].append(scene["scene_id"])

    save_json(SCRIPTS_DIR / "bg_prompts.json", {"backgrounds": list(bg_prompts.values())})

    # scenes_minimal.json 생성 (에이전트용 경량 데이터)
    minimal_scenes = []
    for scene in all_scenes:
        minimal_scenes.append({
            "scene_id": scene["scene_id"],
            "section": scene.get("section"),
            "subtitle_display": scene.get("subtitle_display", "")
        })

    save_json(SCRIPTS_DIR / "scenes_minimal.json", {"scenes": minimal_scenes})

    print(f"\n[DONE] Scene merge completed!")
    print(f"  - Total {len(sorted_scenes)} scenes")
    print(f"  - scenes.json created")
    print(f"  - s1.json ~ s{len(sorted_scenes)}.json created")
    print(f"  - bg_prompts.json created ({len(bg_prompts)} backgrounds)")
    print(f"  - scenes_minimal.json created")

    # state.json 업데이트
    state = load_state()
    state["phase"] = "scenes_completed"
    state["current_step"] = 4
    state["scenes_count"] = len(sorted_scenes)
    save_state(state)


# ============================================================
# Phase 3: AUDIO
# ============================================================
def cmd_audio(args):
    """TTS 생성 + Whisper 타임스탬프"""
    if not OPENAI_AVAILABLE:
        print("[ERROR] OpenAI 패키지가 필요합니다: pip install openai")
        return

    voice = args.voice
    print(f"\n[TTS] Starting TTS generation (voice: {voice})")

    # scenes.json에서 섹션별 narration 수집
    scenes_file = SCRIPTS_DIR / "scenes.json"
    if not scenes_file.exists():
        print("[ERROR] scenes.json not found. Run Phase 2 first.")
        return

    scenes_data = load_json(scenes_file)

    # 섹션별 처리
    sections = get_sections()
    for section in sections:
        scene_ids = get_scenes_for_section(section)
        if not scene_ids:
            print(f"[SKIP] {section} section has no scenes")
            continue

        # 섹션의 모든 narration_tts 수집
        narration_parts = []
        for scene_id in scene_ids:
            scene_file = SCRIPTS_DIR / f"{scene_id}.json"
            if scene_file.exists():
                scene_data = load_json(scene_file)
                if scene_data and "narration_tts" in scene_data:
                    narration_parts.append(scene_data["narration_tts"])

        if not narration_parts:
            print(f"[SKIP] {section} section has no narration")
            continue

        full_narration = " ".join(narration_parts)

        # TTS 생성
        audio_path = AUDIO_DIR / f"{section}.mp3"
        if audio_path.exists() and not args.force:
            print(f"[SKIP] {section}.mp3 already exists (use --force to regenerate)")
            continue

        print(f"[TTS] Generating {section} audio... ({len(full_narration)} chars)")
        generate_tts(full_narration, audio_path, voice)

        # Whisper 타임스탬프 추출
        whisper_path = AUDIO_DIR / f"{section}_whisper.json"
        print(f"[WHISPER] Extracting timestamps for {section}...")
        extract_whisper_timestamps(audio_path, whisper_path)

    print("\n[DONE] Phase 3 (AUDIO) completed!")
    print("Next: Run 'python pipeline.py srt-timing' for subtitle timing")


def generate_tts(text: str, output_path: Path, voice: str = "nova"):
    """OpenAI TTS로 음성 생성"""
    client = OpenAI()

    # 텍스트가 너무 길면 청크 분할 (4096자 제한)
    max_chars = 4000
    if len(text) <= max_chars:
        response = client.audio.speech.create(
            model="tts-1-hd",
            voice=voice,
            input=text
        )
        response.stream_to_file(str(output_path))
    else:
        # 청크 분할 및 병합 (ffmpeg 사용)
        import tempfile
        chunks = []
        for i in range(0, len(text), max_chars):
            chunk = text[i:i+max_chars]
            # 문장 경계에서 자르기 시도
            if i + max_chars < len(text):
                last_period = chunk.rfind("...")
                if last_period > max_chars // 2:
                    chunk = chunk[:last_period + 3]
            chunks.append(chunk)

        temp_files = []
        with tempfile.TemporaryDirectory() as tmpdir:
            for idx, chunk in enumerate(chunks):
                temp_path = Path(tmpdir) / f"chunk_{idx}.mp3"
                response = client.audio.speech.create(
                    model="tts-1-hd",
                    voice=voice,
                    input=chunk
                )
                response.stream_to_file(str(temp_path))
                temp_files.append(temp_path)

            # ffmpeg로 병합
            list_file = Path(tmpdir) / "list.txt"
            with open(list_file, 'w') as f:
                for tf in temp_files:
                    f.write(f"file '{tf}'\n")

            subprocess.run([
                "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                "-i", str(list_file), "-c", "copy", str(output_path)
            ], capture_output=True)

    print(f"  [OK] {output_path.name}")


def extract_whisper_timestamps(audio_path: Path, output_path: Path):
    """Whisper로 타임스탬프 추출"""
    client = OpenAI()

    with open(audio_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["word"]
        )

    result = {
        "text": transcript.text,
        "words": [
            {"word": w.word, "start": w.start, "end": w.end}
            for w in transcript.words
        ] if transcript.words else []
    }

    save_json(output_path, result)


def cmd_srt_timing(args):
    """SRT 타이밍 생성 (subtitle_display + Whisper 매칭)"""
    print("\n[SRT] Generating timing files...")

    scenes_file = SCRIPTS_DIR / "scenes.json"
    if not scenes_file.exists():
        print("[ERROR] scenes.json not found")
        return

    scenes_data = load_json(scenes_file)

    # 섹션별 처리
    sections = get_sections()
    for section in sections:
        section_scenes = scenes_data["meta"]["sections"].get(section, {}).get("scenes", [])
        if not section_scenes:
            continue

        whisper_file = AUDIO_DIR / f"{section}_whisper.json"
        if not whisper_file.exists():
            print(f"[SKIP] {section}_whisper.json not found")
            continue

        whisper_data = load_json(whisper_file)
        words = whisper_data.get("words", [])

        if not words:
            print(f"[SKIP] {section} has no words")
            continue

        # 섹션 전체 duration 계산
        section_duration = words[-1]["end"] if words else 0

        # 씬별 자막 분할
        scene_offset = 0.0

        for scene_id in section_scenes:
            scene_file = SCRIPTS_DIR / f"{scene_id}.json"
            if not scene_file.exists():
                continue

            scene_data = load_json(scene_file)
            subtitle_display = scene_data.get("subtitle_display", "")

            if not subtitle_display:
                continue

            # 자막 분할 (;; 구분자)
            subtitle_segments = subtitle_display.split(";;")
            num_segments = len(subtitle_segments)

            if num_segments == 0:
                continue

            # 이 씬의 예상 duration (섹션 duration을 씬 개수로 균등 분할)
            scene_duration = section_duration / len(section_scenes)
            segment_duration = scene_duration / num_segments

            # 타이밍 파일 생성
            timing_data = {
                "scene_id": scene_id,
                "section": section,
                "duration": scene_duration,
                "section_start": scene_offset,
                "section_end": scene_offset + scene_duration,
                "subtitle_segments": []
            }

            for idx, text in enumerate(subtitle_segments):
                segment_start = scene_offset + (idx * segment_duration)
                segment_end = scene_offset + ((idx + 1) * segment_duration)

                timing_data["subtitle_segments"].append({
                    "index": idx + 1,
                    "text": text.strip(),
                    "start": round(segment_start, 2),
                    "end": round(segment_end, 2),
                    "duration": round(segment_duration, 2)
                })

            # s#_timed.json 저장
            timing_file = AUDIO_DIR / f"{scene_id}_timed.json"
            save_json(timing_file, timing_data, silent=True)

            # SRT 파일 생성
            srt_content = generate_srt(timing_data["subtitle_segments"])
            srt_file = AUDIO_DIR / f"{scene_id}.srt"
            with open(srt_file, 'w', encoding='utf-8') as f:
                f.write(srt_content)

            scene_offset += scene_duration

        print(f"[OK] {section}: {len(section_scenes)} scenes processed")

    print("\n[DONE] SRT timing completed!")


def generate_srt(segments: List[Dict]) -> str:
    """SRT 파일 내용 생성"""
    srt_lines = []

    for seg in segments:
        idx = seg["index"]
        start = format_srt_time(seg["start"])
        end = format_srt_time(seg["end"])
        text = seg["text"]

        srt_lines.append(f"{idx}")
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(text)
        srt_lines.append("")

    return "\n".join(srt_lines)


def format_srt_time(seconds: float) -> str:
    """초를 SRT 시간 형식으로 변환 (00:00:00,000)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


# ============================================================
# Phase 4: CODE (update-root)
# ============================================================
def cmd_update_root(args):
    """Root.tsx 자동 업데이트"""
    print("\n[ROOT] Root.tsx auto update")

    # 씬 컴포넌트 스캔
    scene_files = sorted(REMOTION_SCENES_DIR.glob("S*.tsx"))
    transition_files = sorted(REMOTION_TRANSITIONS_DIR.glob("T*.tsx"))

    if not scene_files:
        print("[ERROR] 씬 파일 없음 (remotion/src/scenes/S*.tsx)")
        return

    # 각 씬의 duration 계산
    compositions = []

    for scene_file in scene_files:
        scene_id = scene_file.stem.lower()  # S1 -> s1
        timing_file = AUDIO_DIR / f"{scene_id}_timed.json"

        if timing_file.exists():
            timing_data = load_json(timing_file)
            # s{n}_timed.json 구조에서 duration 가져오기
            duration = timing_data.get("timing", {}).get("duration", timing_data.get("duration", 10))
        else:
            duration = 10  # default

        duration_frames = int(duration * 30) + 1
        compositions.append({
            "id": scene_file.stem,
            "component": scene_file.stem,
            "durationInFrames": duration_frames,
            "type": "scene"
        })

    for trans_file in transition_files:
        compositions.append({
            "id": trans_file.stem,
            "component": trans_file.stem,
            "durationInFrames": 90,  # 3초 기본
            "type": "transition"
        })

    # Root.tsx 생성
    root_content = generate_root_tsx(compositions)
    root_path = REMOTION_DIR / "src" / "Root.tsx"

    with open(root_path, 'w', encoding='utf-8') as f:
        f.write(root_content)

    print(f"[OK] Root.tsx 업데이트 완료 ({len(compositions)}개 Composition)")


def generate_root_tsx(compositions: List[Dict]) -> str:
    """Root.tsx 내용 생성"""
    # imports
    scene_imports = []
    trans_imports = []

    for comp in compositions:
        if comp["type"] == "scene":
            scene_imports.append(f'import {{ {comp["component"]} }} from "./scenes/{comp["component"]}";')
        else:
            trans_imports.append(f'import {{ {comp["component"]} }} from "./transitions/{comp["component"]}";')

    imports = "\n".join(scene_imports + trans_imports)

    # compositions
    comp_elements = []
    for comp in compositions:
        comp_elements.append(
            f'      <Composition\n'
            f'        id="{comp["id"]}"\n'
            f'        component={{{comp["component"]}}}\n'
            f'        durationInFrames={{{comp["durationInFrames"]}}}\n'
            f'        fps={{30}}\n'
            f'        width={{1920}}\n'
            f'        height={{1080}}\n'
            f'      />'
        )

    comp_str = "\n".join(comp_elements)

    return f'''import React from "react";
import {{ Composition }} from "remotion";
{imports}

export const RemotionRoot: React.FC = () => {{
  return (
    <>
{comp_str}
    </>
  );
}};
'''


# ============================================================
# Phase 5: RENDER
# ============================================================
def cmd_render(args):
    """Remotion 렌더링 (배경 포함 기본, --transparent로 투명 렌더링)"""
    transparent = args.transparent
    mode = "투명 배경" if transparent else "배경 포함"
    print(f"\n🎬 Remotion 렌더링 시작 ({mode})")

    section = args.section
    scene = args.scene
    concurrency = args.concurrency

    if scene:
        # 단일 씬 렌더링
        render_scene(scene, concurrency, transparent)
    elif section:
        # 섹션별 렌더링
        scene_ids = get_scenes_for_section(section)
        for scene_id in scene_ids:
            render_scene(scene_id, concurrency, transparent)
        # 전환 클립은 사용하지 않음 (섹션 직접 연결)
    else:
        # 전체 렌더링
        scenes_data = load_json(SCENES_DIR / "scenes.json")
        if scenes_data:
            for scene_info in scenes_data.get("scenes", []):
                render_scene(scene_info["scene_id"], concurrency, transparent)

        # 전환은 섹션 간 연결에 사용하지 않음 (직접 연결)

    print("\n[OK] 렌더링 완료!")
    if not transparent:
        print("💡 배경 포함 렌더링 완료. composite 단계를 생략하고 section-merge로 진행하세요.")


def render_scene(scene_id: str, concurrency: int = 4, transparent: bool = False):
    """단일 씬 렌더링

    Args:
        scene_id: 씬 ID (예: s1)
        concurrency: 동시 렌더링 수
        transparent: True면 투명 배경 WebM, False면 배경 포함 MP4
    """
    comp_id = scene_id.upper() if not scene_id[0].isupper() else scene_id  # s1 -> S1

    if transparent:
        # 투명 배경 모드: WebM (알파 채널 포함)
        output_path = RENDERS_DIR / f"{scene_id.lower()}_raw.webm"

        if output_path.exists():
            print(f"[SKIP] {scene_id} 이미 존재, 스킵")
            return

        print(f"🎬 {scene_id} 렌더링 중... (투명)")

        # ⚠️ 중요: --pixel-format yuva420p 필수! (알파 채널 포함)
        cmd = f'npx remotion render src/index.ts {comp_id} --output "{output_path}" --codec vp9 --image-format png --pixel-format yuva420p --concurrency {concurrency}'
    else:
        # 배경 포함 모드: MP4 (직접 출력)
        output_path = COMPOSITE_DIR / f"{scene_id.lower()}.mp4"

        if output_path.exists():
            print(f"[SKIP] {scene_id} 이미 존재, 스킵")
            return

        print(f"🎬 {scene_id} 렌더링 중... (배경 포함)")

        # 배경 포함 렌더링: H.264 MP4
        cmd = f'npx remotion render src/index.ts {comp_id} --output "{output_path}" --codec h264 --image-format jpeg --crf 18 --concurrency {concurrency}'

    result = subprocess.run(cmd, cwd=str(REMOTION_DIR), capture_output=True, text=True, shell=True)

    if result.returncode == 0:
        print(f"  [OK] {output_path.name}")
    else:
        print(f"  [ERROR] 실패: {result.stderr[:500]}")


# 전환 클립은 사용하지 않음 (섹션 직접 연결)
# def render_transition(trans_id: str, concurrency: int = 4):
#     """전환 렌더링 (사용 안함)"""
#     pass


def cmd_composite(args):
    """FFmpeg 배경 합성 (2-layer) - 투명 렌더링 시에만 필요"""
    print("\n🎨 배경 합성 시작")
    print("💡 참고: 배경 포함 렌더링(기본)을 사용한 경우 이 단계는 생략됩니다.")

    section = args.section

    if section:
        scene_ids = get_scenes_for_section(section)
    else:
        scenes_data = load_json(SCENES_DIR / "scenes.json")
        scene_ids = [s["scene_id"] for s in scenes_data.get("scenes", [])]

    for scene_id in scene_ids:
        composite_scene(scene_id)

    print("\n[OK] 배경 합성 완료!")


def composite_scene(scene_id: str):
    """단일 씬 배경 합성 (WebM 투명 + 배경 PNG → MP4)"""
    render_path = RENDERS_DIR / f"{scene_id.lower()}_raw.webm"
    bg_path = BACKGROUNDS_DIR / f"bg_{scene_id.lower()}.png"
    output_path = COMPOSITE_DIR / f"{scene_id.lower()}.mp4"

    if not render_path.exists():
        print(f"[WARN] {scene_id} 렌더링 없음, 스킵")
        return

    if output_path.exists():
        print(f"[SKIP] {scene_id} 합성본 이미 존재, 스킵")
        return

    print(f"🎨 {scene_id} 배경 합성 중...")

    # 먼저 렌더링 영상의 길이를 구함
    duration_cmd = f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{render_path}"'
    duration_result = subprocess.run(duration_cmd, capture_output=True, text=True, shell=True)
    duration = float(duration_result.stdout.strip()) if duration_result.stdout.strip() else 10.0

    if bg_path.exists():
        # ⚠️ 중요: -c:v libvpx-vp9 디코더와 format=yuva420p 필수!
        # Remotion에서 yuva420p로 렌더링한 WebM의 알파채널을 제대로 읽으려면
        # libvpx-vp9 디코더를 명시하고 yuva420p 포맷으로 변환해야 함
        # 이 설정 없으면 배경이 첫 프레임만 표시되는 문제 발생
        cmd = f'ffmpeg -y -loop 1 -t {duration} -framerate 30 -i "{bg_path}" -c:v libvpx-vp9 -i "{render_path}" -filter_complex "[1:v]format=yuva420p[fg];[0:v]scale=1920:1080,format=yuva420p[bg];[bg][fg]overlay=0:0" -c:v libx264 -preset fast -pix_fmt yuv420p -t {duration} "{output_path}"'
    else:
        # 배경 없음: 검은 배경 사용
        print(f"  [WARN] {bg_path.name} 없음, 검은 배경 사용")
        cmd = f'ffmpeg -y -f lavfi -t {duration} -i "color=c=black:s=1920x1080:r=30" -c:v libvpx-vp9 -i "{render_path}" -filter_complex "[1:v]format=yuva420p[fg];[0:v]format=yuva420p[bg];[bg][fg]overlay=0:0" -c:v libx264 -preset fast -pix_fmt yuv420p -t {duration} "{output_path}"'

    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)

    if result.returncode == 0:
        print(f"  [OK] {output_path.name}")
    else:
        print(f"  [ERROR] 실패: {result.stderr[:200]}")


def cmd_section_merge(args):
    """섹션 합성 (concat + audio)"""
    print("\n🔗 섹션 합성 시작")

    section = args.section
    sections_to_process = [section] if section else get_sections()

    for sec in sections_to_process:
        merge_section(sec)

    print("\n[OK] 섹션 합성 완료!")


def merge_section(section: str):
    """단일 섹션 합성 (씬 사이 gap을 마지막 프레임으로 채움)"""
    scene_ids = get_scenes_for_section(section)
    if not scene_ids:
        print(f"[WARN] {section} 섹션에 씬 없음, 스킵")
        return

    output_path = SECTIONS_DIR / f"section_{section}.mp4"
    audio_path = AUDIO_DIR / f"{section}.mp3"

    if output_path.exists():
        print(f"[SKIP] section_{section}.mp4 이미 존재, 스킵")
        return

    print(f"🔗 {section} 섹션 합성 중...")

    # 씬별 타이밍 정보 로드 및 gap 계산
    import tempfile
    padded_files = []
    temp_files = []  # 삭제할 임시 파일 목록

    for i, scene_id in enumerate(scene_ids):
        scene_path = COMPOSITE_DIR / f"{scene_id}.mp4"
        if not scene_path.exists():
            print(f"  [WARN] {scene_id}.mp4 없음, 스킵")
            continue

        # 현재 씬의 타이밍 정보
        timed_path = AUDIO_DIR / f"{scene_id}_timed.json"
        if not timed_path.exists():
            padded_files.append(scene_path)
            continue

        current_timing = load_json(timed_path)
        current_end = current_timing.get('timing', {}).get('scene_end', 0)

        # 다음 씬의 시작 시간 확인 (gap 계산)
        gap_duration = 0
        if i + 1 < len(scene_ids):
            next_scene_id = scene_ids[i + 1]
            next_timed_path = AUDIO_DIR / f"{next_scene_id}_timed.json"
            if next_timed_path.exists():
                next_timing = load_json(next_timed_path)
                next_start = next_timing.get('timing', {}).get('scene_start', 0)
                gap_duration = next_start - current_end

        # gap이 있으면 마지막 프레임 연장
        if gap_duration > 0.05:  # 50ms 이상인 경우만
            padded_path = COMPOSITE_DIR / f"{scene_id}_padded.mp4"
            pad_cmd = f'ffmpeg -y -i "{scene_path}" -vf "tpad=stop_mode=clone:stop_duration={gap_duration}" -c:v libx264 -preset fast -an "{padded_path}"'
            result = subprocess.run(pad_cmd, capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                padded_files.append(padded_path)
                temp_files.append(padded_path)
                print(f"    {scene_id}: +{gap_duration:.2f}s gap 추가")
            else:
                padded_files.append(scene_path)
        else:
            padded_files.append(scene_path)

    if not padded_files:
        print(f"  [ERROR] {section} 섹션에 합성 가능한 씬 없음")
        return

    # concat 리스트 파일 생성
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        for sf in padded_files:
            f.write(f"file '{sf}'\n")
        list_file = f.name

    try:
        if audio_path.exists():
            # 영상 concat + 오디오 합성
            cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_file}" -i "{audio_path}" -c:v libx264 -preset fast -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest "{output_path}"'
        else:
            # 영상만 concat
            cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_file}" -c:v libx264 -preset fast "{output_path}"'

        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)

        if result.returncode == 0:
            print(f"  [OK] section_{section}.mp4")
        else:
            print(f"  [ERROR] 실패: {result.stderr[:200]}")
    finally:
        os.unlink(list_file)


# ============================================================
# Phase 6: FINAL
# ============================================================
def cmd_final(args):
    """최종 병합 (섹션 연결 + BGM)"""
    print("\n🎬 최종 병합 시작")

    bgm_volume = args.bgm_volume
    section_gap = getattr(args, 'section_gap', 1.0)  # 섹션 간 gap (기본 1초)
    output_path = OUTPUT_DIR / "final_video.mp4"

    # 섹션 목록 구성
    sections = get_sections()
    section_files = []
    temp_files = []  # 삭제할 임시 파일

    import tempfile

    for idx, section in enumerate(sections):
        section_path = SECTIONS_DIR / f"section_{section}.mp4"
        if not section_path.exists():
            print(f"  [WARN] section_{section}.mp4 없음")
            continue

        # 모든 섹션에 1초 gap 추가 (마지막 프레임 유지 + 무음)
        # 마지막 섹션도 포함 - 영상 끝이 자연스럽게 마무리되도록
        if section_gap > 0:
            extended_path = SECTIONS_DIR / f"section_{section}_extended.mp4"

            # tpad로 마지막 프레임 연장 + apad로 무음 추가
            extend_cmd = f'ffmpeg -y -i "{section_path}" -vf "tpad=stop_mode=clone:stop_duration={section_gap}" -af "apad=pad_dur={section_gap}" -c:v libx264 -preset fast -c:a aac "{extended_path}"'

            result = subprocess.run(extend_cmd, capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                section_files.append(extended_path)
                temp_files.append(extended_path)
                print(f"  [OK] section_{section}.mp4 (+{section_gap}s)")
            else:
                section_files.append(section_path)
                print(f"  [OK] section_{section}.mp4 (연장 실패, 원본 사용)")
        else:
            section_files.append(section_path)
            print(f"  [OK] section_{section}.mp4")

    if not section_files:
        print("[ERROR] 합성할 섹션 없음")
        return

    # concat 리스트 파일
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        for sf in section_files:
            f.write(f"file '{sf}'\n")
        list_file = f.name

    try:
        # BGM 선택
        bgm_files = list(BGM_DIR.glob("*.mp3"))

        if bgm_files:
            import random
            bgm_path = random.choice(bgm_files)
            print(f"🎵 BGM: {bgm_path.name}")

            # concat + BGM 믹싱
            cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_file}" -i "{bgm_path}" -filter_complex "[1:a]volume={bgm_volume}[bgm];[0:a][bgm]amix=inputs=2:duration=first" -c:v libx264 -preset fast -c:a aac -b:a 192k "{output_path}"'
        else:
            # BGM 없이
            print("  [INFO] BGM 없음, 나레이션만 포함")
            cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_file}" -c:v libx264 -preset fast -c:a aac -b:a 192k "{output_path}"'

        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)

        if result.returncode == 0:
            # 최종 영상 정보 출력
            duration_cmd = f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{output_path}"'
            dur_result = subprocess.run(duration_cmd, capture_output=True, text=True, shell=True)
            duration = float(dur_result.stdout.strip()) if dur_result.stdout.strip() else 0

            print(f"\n[OK] 최종 영상 생성 완료!")
            print(f"📁 {output_path}")
            print(f"⏱️ 길이: {int(duration//60)}분 {int(duration%60)}초")
        else:
            print(f"[ERROR] 실패: {result.stderr[:500]}")
    finally:
        os.unlink(list_file)
        # 임시 fade 파일 삭제
        for tf in temp_files:
            if tf.exists():
                os.unlink(tf)


# 전환 클립은 사용하지 않음 (섹션 직접 연결)
# def composite_transition(trans_idx: int):
#     """전환 배경 합성 (사용 안함)"""
#     pass


# ============================================================
# 유틸리티 명령어
# ============================================================
def cmd_status(args):
    """프로젝트 상태 확인"""
    state = load_state()

    print("\n📊 프로젝트 상태")
    print("=" * 50)
    print(f"카테고리: {state.get('category', '-')}")
    print(f"주제: {state.get('topic', '-')}")
    print(f"Phase: {state.get('phase', '-')}")
    print(f"업데이트: {state.get('updated_at', '-')}")
    print("=" * 50)

    # 파일 존재 확인
    print("\n📁 파일 상태:")

    checks = [
        ("reading_script.json", SCRIPTS_DIR / "reading_script.json"),
        ("scenes.json", SCRIPTS_DIR / "scenes.json"),
        ("hook.mp3", AUDIO_DIR / "hook.mp3"),
        ("S1.tsx", REMOTION_SCENES_DIR / "S1.tsx"),
        ("final_video.mp4", OUTPUT_DIR / "final_video.mp4"),
    ]

    for name, path in checks:
        status = "[OK]" if path.exists() else "[ERROR]"
        print(f"  {status} {name}")


def cmd_clean(args):
    """output 폴더만 초기화 (에셋 유지)"""
    import shutil

    print("\n🧹 output 폴더 초기화")

    if args.phase:
        print(f"Phase {args.phase} 이후만 삭제")
        phase_dirs = {
            1: [SCRIPTS_DIR],
            2: [SCRIPTS_DIR],  # scenes.json도 SCRIPTS_DIR에 저장
            3: [AUDIO_DIR],
            4: [REMOTION_SCENES_DIR, REMOTION_TRANSITIONS_DIR],
            5: [RENDERS_DIR, COMPOSITE_DIR],
        }
        for p in range(args.phase, 6):
            for d in phase_dirs.get(p, []):
                if d.exists():
                    if d in [REMOTION_SCENES_DIR, REMOTION_TRANSITIONS_DIR]:
                        for f in d.glob("*.tsx"):
                            f.unlink()
                            print(f"  🗑️ {f.name}")
                    else:
                        shutil.rmtree(d)
                        print(f"  🗑️ {d}")
    else:
        # output 전체 삭제
        dirs_to_clean = [
            SCRIPTS_DIR, AUDIO_DIR,
            BACKGROUNDS_DIR, RENDERS_DIR, COMPOSITE_DIR
        ]

        for d in dirs_to_clean:
            if d.exists():
                shutil.rmtree(d)
                print(f"  - {d.name}")

        # Remotion 씬/전환 삭제
        for f in REMOTION_SCENES_DIR.glob("S*.tsx"):
            f.unlink()
            print(f"  🗑️ scenes/{f.name}")

        for f in REMOTION_TRANSITIONS_DIR.glob("T*.tsx"):
            f.unlink()
            print(f"  🗑️ transitions/{f.name}")

    # 디렉토리 재생성
    ensure_dirs()

    print("\n[OK] output 초기화 완료!")


def cmd_init(args):
    """프로젝트 완전 초기화 (에셋 포함)"""
    import shutil

    print("\n[INIT] Project Full Reset")
    print("=" * 50)

    # 1. output 폴더 초기화
    print("\n[1/4] Cleaning output folders...")
    for d in [SCRIPTS_DIR, AUDIO_DIR, BACKGROUNDS_DIR, VISUAL_DIR, RENDERS_DIR, SCENES_DIR, SECTIONS_DIR, TRANSITIONS_DIR]:
        if d.exists():
            shutil.rmtree(d)
            print(f"  - {d.name}")

    # final_video.mp4 삭제
    final_video = OUTPUT_DIR / "final_video.mp4"
    if final_video.exists():
        final_video.unlink()
        print(f"  - final_video.mp4")

    # asset_catalog.csv 삭제
    catalog = OUTPUT_DIR / "asset_catalog.csv"
    if catalog.exists():
        catalog.unlink()
        print(f"  - asset_catalog.csv")

    # 2. Remotion 씬/전환 삭제
    print("\n[2/4] Cleaning Remotion code...")
    scene_count = 0
    for f in REMOTION_SCENES_DIR.glob("S*.tsx"):
        f.unlink()
        scene_count += 1
    print(f"  - scenes/*.tsx ({scene_count})")

    trans_count = 0
    for f in REMOTION_TRANSITIONS_DIR.glob("T*.tsx"):
        f.unlink()
        trans_count += 1
    print(f"  - transitions/*.tsx ({trans_count})")

    # Root.tsx 초기화
    root_path = REMOTION_DIR / "src" / "Root.tsx"
    root_content = '''import React from "react";
// import { Composition } from "remotion";
// Scenes and Transitions will be auto-generated by pipeline.py update-root

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Compositions will be added here by pipeline.py update-root */}
    </>
  );
};
'''
    with open(root_path, 'w', encoding='utf-8') as f:
        f.write(root_content)
    print(f"  - Root.tsx reset")

    # 3. assets 폴더 내용 삭제
    print("\n[3/4] Cleaning assets folders...")
    asset_categories = ["icons", "maps", "portraits", "artifacts", "backgrounds"]

    for cat in asset_categories:
        cat_dir = ASSETS_DIR / cat
        if cat_dir.exists():
            count = 0
            for f in cat_dir.iterdir():
                if f.is_file():
                    f.unlink()
                    count += 1
            if count > 0:
                print(f"  - assets/{cat}/ ({count})")

    # remotion/public/assets 도 정리
    for cat in asset_categories:
        cat_dir = REMOTION_ASSETS_DIR / cat
        if cat_dir.exists():
            count = 0
            for f in cat_dir.iterdir():
                if f.is_file():
                    f.unlink()
                    count += 1
            if count > 0:
                print(f"  - remotion/public/assets/{cat}/ ({count})")

    # remotion/out 폴더 정리
    remotion_out_dir = REMOTION_DIR / "out"
    if remotion_out_dir.exists():
        count = 0
        for f in remotion_out_dir.iterdir():
            if f.is_file():
                f.unlink()
                count += 1
            elif f.is_dir():
                shutil.rmtree(f)
                count += 1
        if count > 0:
            print(f"  - remotion/out/ ({count})")

    # 4. state.json 초기화
    print("\n[4/4] Resetting state.json...")
    initial_state = {
        "project_id": None,
        "category": None,
        "topic": None,
        "duration_target": 300,
        "aspect_ratio": "16:9",
        "voice": "nova",
        "phase": "initialized",
        "current_step": 0,
        "scenes_count": 0,
        "created_at": None,
        "updated_at": None
    }
    save_json(STATE_FILE, initial_state)

    # 디렉토리 재생성
    ensure_dirs()

    print("\n" + "=" * 50)
    print("[OK] Project initialization complete!")
    print("\nTo start a new project:")
    print("  1. Use /script-writer skill for script")
    print("  2. Use scene-director agent for scene split")
    print("  3. Generate assets and save to assets/ folder")


def cmd_download_assets(args):
    """Supabase에서 에셋 다운로드"""
    print("\n[DOWNLOAD] Downloading assets from Supabase...")

    try:
        from supabase import create_client
    except ImportError:
        print("[ERROR] supabase package required: pip install supabase")
        return

    # Supabase REST API URL (not PostgreSQL URL)
    SUPABASE_URL = "https://lgpkjmxasrcuvycxefxh.supabase.co"
    SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")

    if not SUPABASE_KEY:
        print("[ERROR] SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY environment variable required")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 필요한 에셋 수집
    required_assets = set()
    for scene_file in SCRIPTS_DIR.glob("s*.json"):
        if scene_file.name in ["scenes.json", "scenes_minimal.json"]:
            continue
        scene_data = load_json(scene_file)
        if scene_data:
            for elem in scene_data.get("required_elements", []):
                asset = elem.get("asset")
                if asset:
                    required_assets.add(asset)

    print(f"[INFO] {len(required_assets)} assets required")

    # Supabase에서 에셋 정보 조회
    response = supabase.table("assets").select("*").execute()
    all_assets = {a["asset_id"]: a for a in response.data}

    # 다운로드
    downloaded = 0
    for asset_id in required_assets:
        if asset_id not in all_assets:
            print(f"[WARN] {asset_id} not found in database")
            continue

        asset_info = all_assets[asset_id]
        file_path = asset_info["file_path"]  # e.g., "icons/clock_icon.png"

        local_path = ASSETS_DIR / file_path
        remotion_path = REMOTION_ASSETS_DIR / file_path

        # 이미 존재하면 스킵
        if local_path.exists():
            continue

        # Supabase Storage에서 다운로드
        try:
            bucket_name = "history-assets"
            data = supabase.storage.from_(bucket_name).download(file_path)

            # 로컬 저장
            local_path.parent.mkdir(parents=True, exist_ok=True)
            with open(local_path, 'wb') as f:
                f.write(data)

            # Remotion에도 복사
            remotion_path.parent.mkdir(parents=True, exist_ok=True)
            with open(remotion_path, 'wb') as f:
                f.write(data)

            downloaded += 1
            print(f"[OK] {file_path}")
        except Exception as e:
            print(f"[ERROR] {asset_id}: {str(e)[:50]}")

    print(f"\n[DONE] Downloaded {downloaded} new assets")



    """에셋 카탈로그 생성"""
    print("\n[CATALOG] Generating asset catalog...")

    catalog = {
        "icons": [],
        "portraits": [],
        "maps": [],
        "generated_at": datetime.now().isoformat()
    }

    categories = ["icons", "portraits", "maps"]

    for cat in categories:
        cat_dir = ASSETS_DIR / cat
        if cat_dir.exists():
            for f in cat_dir.glob("*.png"):
                catalog[cat].append({
                    "name": f.stem,
                    "path": f"assets/{cat}/{f.name}"
                })
            for f in cat_dir.glob("*.jpg"):
                catalog[cat].append({
                    "name": f.stem,
                    "path": f"assets/{cat}/{f.name}"
                })

    output_path = OUTPUT_DIR / "asset_catalog.csv"
    save_json(output_path, catalog)

    total = sum(len(catalog[c]) for c in categories)
    print(f"[OK] Catalog generated ({total} assets)")


# ============================================================
# 메인
# ============================================================
def main():
    parser = argparse.ArgumentParser(
        description="Video Story Maker Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    subparsers = parser.add_subparsers(dest="command", help="명령어")

    # Phase 2: merge-scenes
    p_merge = subparsers.add_parser("merge-scenes", help="씬 파일 병합")
    p_merge.set_defaults(func=cmd_merge_scenes)

    # Phase 3: audio
    p_audio = subparsers.add_parser("audio", help="TTS 생성 + Whisper")
    p_audio.add_argument("--voice", default="nova", help="TTS 음성 (기본: nova)")
    p_audio.add_argument("--force", action="store_true", help="기존 파일 덮어쓰기")
    p_audio.set_defaults(func=cmd_audio)

    # Phase 3.5: srt-timing
    p_srt = subparsers.add_parser("srt-timing", help="SRT 타이밍 생성")
    p_srt.set_defaults(func=cmd_srt_timing)

    # Phase 4: update-root
    p_root = subparsers.add_parser("update-root", help="Root.tsx 자동 업데이트")
    p_root.set_defaults(func=cmd_update_root)

    # Phase 5: render
    p_render = subparsers.add_parser("render", help="Remotion 렌더링 (기본: 배경 포함)")
    p_render.add_argument("--section", "-s", help="특정 섹션만")
    p_render.add_argument("--scene", help="특정 씬만")
    p_render.add_argument("--concurrency", "-c", type=int, default=4, help="동시성 (기본: 4)")
    p_render.add_argument("--transparent", "-t", action="store_true", help="투명 배경 렌더링 (WebM, FFmpeg 합성 필요)")
    p_render.set_defaults(func=cmd_render)

    # Phase 5: composite
    p_composite = subparsers.add_parser("composite", help="배경 합성")
    p_composite.add_argument("--section", "-s", help="특정 섹션만")
    p_composite.set_defaults(func=cmd_composite)

    # Phase 5: section-merge
    p_section = subparsers.add_parser("section-merge", help="섹션 합성")
    p_section.add_argument("--section", "-s", help="특정 섹션만")
    p_section.set_defaults(func=cmd_section_merge)

    # Phase 6: final
    p_final = subparsers.add_parser("final", help="최종 병합")
    p_final.add_argument("--bgm-volume", type=float, default=0.08, help="BGM 볼륨 (기본: 0.08)")
    p_final.add_argument("--section-gap", type=float, default=1.0, help="섹션 간 gap 시간 - 마지막 프레임 유지 (기본: 1초, 0이면 비활성화)")
    p_final.set_defaults(func=cmd_final)

    # 유틸리티
    p_status = subparsers.add_parser("status", help="프로젝트 상태")
    p_status.set_defaults(func=cmd_status)

    p_clean = subparsers.add_parser("clean", help="output 폴더 초기화 (에셋 유지)")
    p_clean.add_argument("--phase", type=int, help="특정 Phase 이후만")
    p_clean.set_defaults(func=cmd_clean)

    p_init = subparsers.add_parser("init", help="프로젝트 완전 초기화 (에셋 포함)")
    p_init.set_defaults(func=cmd_init)

    # asset-catalog 명령어는 asset-checker 스킬로 대체됨
    # p_catalog = subparsers.add_parser("asset-catalog", help="에셋 카탈로그 생성")
    # p_catalog.set_defaults(func=cmd_asset_catalog)

    p_download = subparsers.add_parser("download-assets", help="Supabase에서 에셋 다운로드")
    p_download.set_defaults(func=cmd_download_assets)

    p_validate = subparsers.add_parser("validate-parts", help="Part 분할 정보 검증")
    p_validate.set_defaults(func=cmd_validate_parts)

    # 파싱 및 실행
    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        return

    ensure_dirs()
    args.func(args)


if __name__ == "__main__":
    main()
