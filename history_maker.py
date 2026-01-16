#!/usr/bin/env python3
"""
History Video Maker - 메인 유틸리티 모듈

사용법:
    python history_maker.py <command> [options]

명령어:
    merge-scenes    scenes_*.json 병합 및 분할
    status          프로젝트 상태 확인
    clean           프로젝트 초기화 (생성된 파일 정리)
    asset-check     필요한 에셋 조회 (Supabase에서)
    asset-upload    로컬 에셋을 Supabase에 업로드
    asset-download  Supabase에서 에셋 다운로드
    asset-list      Supabase에 저장된 에셋 목록
    tts-generate    섹션별 TTS 생성 (Step 6)
    tts-timestamps  Whisper 타임스탬프 추출 (Step 6.5-1)
    tts-split       FFmpeg으로 씬별 오디오 분할 (Step 6.5-3)
    tts-pipeline    전체 TTS 파이프라인 실행 (6 + 6.5-1 + 6.5-3)

예시:
    python history_maker.py merge-scenes
    python history_maker.py status
    python history_maker.py clean                  # 전체 초기화
    python history_maker.py clean --keep-assets    # assets/ 유지
    python history_maker.py clean --phase 4        # Phase 4 이후만 삭제
    python history_maker.py asset-check
    python history_maker.py asset-upload
    python history_maker.py asset-download yi_sun_sin_portrait
    python history_maker.py tts-pipeline
"""

import json
import sys
import argparse
import os
import mimetypes
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# .env 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv 없으면 환경변수 직접 사용

# Supabase 클라이언트
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

# PIL for image info
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

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
STATE_FILE = BASE_DIR / "state.json"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"

# 출력 디렉토리
SCRIPTS_DIR = OUTPUT_DIR / "1_scripts"
AUDIO_DIR = OUTPUT_DIR / "2_audio"
IMAGES_DIR = OUTPUT_DIR / "3_images"
VISUAL_DIR = OUTPUT_DIR / "4_visual"
RENDERS_DIR = OUTPUT_DIR / "5_renders"
SCENES_DIR = OUTPUT_DIR / "6_scenes"
TRANSITIONS_DIR = OUTPUT_DIR / "7_transitions"

# Remotion 디렉토리
REMOTION_DIR = BASE_DIR / "remotion"
REMOTION_SCENES_DIR = REMOTION_DIR / "src" / "scenes"
REMOTION_ASSETS_DIR = REMOTION_DIR / "public" / "assets"

# 에셋 카테고리 디렉토리
ASSET_CATEGORIES = {
    "maps": ASSETS_DIR / "maps",
    "portraits": ASSETS_DIR / "portraits",
    "icons": ASSETS_DIR / "icons",
    "backgrounds": ASSETS_DIR / "backgrounds",
    "artifacts": ASSETS_DIR / "artifacts",
}

# Supabase 설정
def _parse_supabase_url(raw_url: str) -> str:
    """Supabase URL을 API URL 형식으로 변환"""
    if not raw_url:
        return ""
    # postgresql://postgres:xxx@db.PROJECT_ID.supabase.co:5432/postgres 형식에서 PROJECT_ID 추출
    import re
    match = re.search(r'db\.([a-z0-9]+)\.supabase\.co', raw_url)
    if match:
        project_id = match.group(1)
        return f"https://{project_id}.supabase.co"
    # 이미 https:// 형식이면 그대로 반환
    if raw_url.startswith("https://") and ".supabase.co" in raw_url:
        return raw_url
    return ""

SUPABASE_URL = _parse_supabase_url(os.getenv("SUPABASE_URL", ""))
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
STORAGE_BUCKET = "history-assets"


# ============================================================
# 공통 유틸리티
# ============================================================
def load_json(filepath: Path) -> dict:
    """JSON 파일 로드"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data: dict, filepath: Path, quiet: bool = False):
    """JSON 파일 저장 (들여쓰기 2칸)"""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    if not quiet:
        print(f"  -> {filepath.name}")


def get_project_info() -> dict:
    """state.json에서 프로젝트 정보 읽기"""
    if STATE_FILE.exists():
        state = load_json(STATE_FILE)
        return {
            "project_id": state.get("project_id", "unknown"),
            "topic": state.get("topic", "역사 영상"),
            "style": state.get("style", "antique"),
            "aspect_ratio": state.get("aspect_ratio", "16:9"),
            "duration_target": state.get("duration_target", 120),
            "phase": state.get("phase", "initialized"),
            "current_step": state.get("current_step", 1),
            "scenes_count": state.get("scenes_count", 0),
        }
    return {
        "project_id": "unknown",
        "topic": "역사 영상",
        "style": "antique",
        "aspect_ratio": "16:9",
        "duration_target": 120,
        "phase": "initialized",
        "current_step": 1,
        "scenes_count": 0,
    }


def update_state(updates: dict):
    """state.json 업데이트"""
    state = get_project_info()
    state.update(updates)
    state["updated_at"] = datetime.now().isoformat()
    save_json(state, STATE_FILE, quiet=True)


# ============================================================
# 명령어: merge-scenes
# ============================================================
SCENE_INPUT_FILES = [
    "scenes_hook.json",   # hook + background
    "scenes_core.json",   # core
    "scenes_outro.json",  # insight + outro
]


def cmd_merge_scenes():
    """scenes_*.json 파일들을 병합하고 개별 s#.json으로 분할"""
    print("=" * 50)
    print("씬 병합 및 분할")
    print("=" * 50)

    if not SCRIPTS_DIR.exists():
        print(f"오류: {SCRIPTS_DIR} 디렉토리가 없습니다.")
        return False

    # 1. 기존 파일 정리
    print("\n[1] 기존 s#.json 파일 정리")
    for f in SCRIPTS_DIR.glob("s*.json"):
        name = f.name
        if name.startswith("s") and not name.startswith("scenes"):
            rest = name[1:-5]
            if rest.isdigit():
                f.unlink()
                print(f"  [DEL] {f.name}")

    # 2. 병합
    print("\n[2] scenes_*.json 병합")
    all_scenes = []
    for filename in SCENE_INPUT_FILES:
        filepath = SCRIPTS_DIR / filename
        if not filepath.exists():
            print(f"  [SKIP] {filename} 없음")
            continue
        data = load_json(filepath)
        scenes = data.get("scenes", [])
        print(f"  [LOAD] {filename}: {len(scenes)}개 씬")
        all_scenes.extend(scenes)

    if not all_scenes:
        print("오류: 병합할 씬이 없습니다.")
        return False

    # scene_id 재정렬
    for i, scene in enumerate(all_scenes, start=1):
        scene["scene_id"] = f"s{i}"

    total_duration = sum(s.get("duration", 0) for s in all_scenes)
    project_info = get_project_info()

    merged = {
        "meta": {
            "topic": project_info["topic"],
            "total_duration": total_duration,
            "scenes_count": len(all_scenes),
            "style": project_info["style"],
            "aspect_ratio": project_info["aspect_ratio"],
            "created_at": datetime.now().isoformat()
        },
        "scenes": all_scenes
    }

    # 3. scenes.json 저장
    print("\n[3] scenes.json 저장")
    save_json(merged, SCRIPTS_DIR / "scenes.json")

    # 4. 개별 파일로 분할
    print("\n[4] 개별 s#.json 분할")
    for scene in all_scenes:
        scene_id = scene["scene_id"]
        save_json(scene, SCRIPTS_DIR / f"{scene_id}.json")

    # 5. state.json 업데이트
    update_state({
        "scenes_count": len(all_scenes),
        "phase": "scenes_completed",
        "current_step": 4
    })

    print("\n" + "=" * 50)
    print(f"완료! 총 {len(all_scenes)}개 씬, {total_duration}초")
    print("=" * 50)
    return True


# ============================================================
# 명령어: status
# ============================================================
PHASE_NAMES = {
    "initialized": "Step 1 완료 - 프로젝트 설정",
    "script_saved": "Step 2 완료 - 대본 작성",
    "scenes_completed": "Step 3-4 완료 - 씬 분할",
    "tts_completed": "Step 5-6 완료 - TTS 생성",
    "code_completed": "Step 7-9 완료 - 코드 생성",
    "rendered": "Step 11 완료 - 렌더링",
    "finished": "완료!"
}


def cmd_status():
    """프로젝트 상태 확인"""
    print("=" * 50)
    print("프로젝트 상태")
    print("=" * 50)

    info = get_project_info()

    print(f"\n프로젝트: {info['topic']}")
    print(f"ID: {info['project_id']}")
    print(f"스타일: {info['style']}")
    print(f"비율: {info['aspect_ratio']}")
    print(f"목표 길이: {info['duration_target']}초")
    print(f"\n현재 Phase: {info['phase']}")
    print(f"  -> {PHASE_NAMES.get(info['phase'], '알 수 없음')}")
    print(f"현재 Step: {info['current_step']}")
    print(f"씬 개수: {info['scenes_count']}")

    # 파일 존재 확인
    print("\n생성된 파일:")
    checks = [
        (SCRIPTS_DIR / "reading_script.json", "대본"),
        (SCRIPTS_DIR / "scenes.json", "씬 목록"),
        (SCRIPTS_DIR / "transitions.json", "전환 텍스트"),
    ]
    for path, name in checks:
        status = "O" if path.exists() else "X"
        print(f"  [{status}] {name}: {path.name}")

    # 씬별 파일 확인
    if info['scenes_count'] > 0:
        print(f"\n씬 파일 (s1~s{info['scenes_count']}):")
        for i in range(1, info['scenes_count'] + 1):
            scene_file = SCRIPTS_DIR / f"s{i}.json"
            audio_file = AUDIO_DIR / f"s{i}.mp3"
            visual_file = VISUAL_DIR / f"s{i}_visual.json"

            s_status = "O" if scene_file.exists() else "X"
            a_status = "O" if audio_file.exists() else "X"
            v_status = "O" if visual_file.exists() else "X"

            print(f"  s{i}: 스크립트[{s_status}] 오디오[{a_status}] 비주얼[{v_status}]")

    print("\n" + "=" * 50)
    return True


# ============================================================
# 명령어: clean
# ============================================================
def cmd_clean(phase: Optional[int] = None, keep_assets: bool = False):
    """생성된 파일 정리

    Args:
        phase: 특정 Phase 이후 파일만 삭제 (None이면 전체)
        keep_assets: True면 assets/ 폴더는 유지
    """
    import shutil

    print("=" * 50)
    print("프로젝트 초기화")
    print("=" * 50)

    if phase is None:
        print("\n⚠️  전체 프로젝트 파일을 삭제합니다.")
        print("\n삭제 대상:")
        print("  - output/ 폴더 내 모든 생성물")
        print("  - remotion/src/scenes/S*.tsx")
        print("  - remotion/public/assets/ 내 이미지")
        if not keep_assets:
            print("  - assets/ 폴더 내 이미지")
        print("\n보존 항목:")
        print("  - output/voice_test/ (목소리 테스트)")
        print("  - state.json (초기화됨)")
        if keep_assets:
            print("  - assets/ 폴더 (--keep-assets)")

        confirm = input("\n계속하시겠습니까? (y/N): ")
        if confirm.lower() != 'y':
            print("취소되었습니다.")
            return False

    deleted_counts = {}

    # 1. output/ 폴더 정리
    output_dirs_to_clean = []
    if phase is None or phase >= 1:
        output_dirs_to_clean.append((SCRIPTS_DIR, "1_scripts"))
    if phase is None or phase >= 3:
        output_dirs_to_clean.append((AUDIO_DIR, "2_audio"))
        output_dirs_to_clean.append((IMAGES_DIR, "3_images"))
    if phase is None or phase >= 4:
        output_dirs_to_clean.append((VISUAL_DIR, "4_visual"))
    if phase is None or phase >= 5:
        output_dirs_to_clean.append((RENDERS_DIR, "5_renders"))
        output_dirs_to_clean.append((SCENES_DIR, "6_scenes"))
        output_dirs_to_clean.append((TRANSITIONS_DIR, "7_transitions"))

    print("\n[output/]")
    for dir_path, name in output_dirs_to_clean:
        if dir_path.exists():
            count = 0
            for f in dir_path.glob("*"):
                # voice_test 폴더는 보존
                if name == "2_audio" and f.name == "voice_test":
                    continue
                if f.is_file():
                    f.unlink()
                    count += 1
                elif f.is_dir():
                    shutil.rmtree(f)
                    count += 1
            if count > 0:
                print(f"  [{name}] {count}개 삭제")
                deleted_counts[name] = count

    # output/ 루트 파일들 정리
    if phase is None:
        root_files = ["asset_catalog.json", "asset_check_report.json", "image_prompts.json"]
        root_count = 0
        for fname in root_files:
            fpath = OUTPUT_DIR / fname
            if fpath.exists():
                fpath.unlink()
                root_count += 1
        if root_count > 0:
            print(f"  [output/] {root_count}개 JSON 삭제")
            deleted_counts["output_root"] = root_count

    # 2. assets/ 폴더 정리 (keep_assets가 False인 경우만)
    if not keep_assets and (phase is None):
        print("\n[assets/]")
        asset_categories = ["maps", "portraits", "icons", "backgrounds", "artifacts"]
        for category in asset_categories:
            cat_dir = ASSETS_DIR / category
            if cat_dir.exists():
                count = 0
                for f in cat_dir.glob("*"):
                    if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
                        f.unlink()
                        count += 1
                if count > 0:
                    print(f"  [{category}/] {count}개 이미지 삭제")
                    deleted_counts[f"assets_{category}"] = count

    # 3. Remotion 폴더 정리
    if phase is None or phase >= 4:
        print("\n[remotion/]")
        remotion_count = 0

        # 씬 파일 삭제 (S*.tsx) - 대문자 S
        if REMOTION_SCENES_DIR.exists():
            for f in REMOTION_SCENES_DIR.glob("S*.tsx"):
                f.unlink()
                remotion_count += 1
            if remotion_count > 0:
                print(f"  [src/scenes/] {remotion_count}개 S*.tsx 삭제")

        # public/assets/ 하위 이미지 삭제
        if REMOTION_ASSETS_DIR.exists():
            asset_count = 0
            for subdir in REMOTION_ASSETS_DIR.iterdir():
                if subdir.is_dir():
                    for f in subdir.glob("*"):
                        if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
                            f.unlink()
                            asset_count += 1
            if asset_count > 0:
                print(f"  [public/assets/] {asset_count}개 이미지 삭제")
                deleted_counts["remotion_assets"] = asset_count

        deleted_counts["remotion_scenes"] = remotion_count

    # 4. 임시 파일 삭제 (프로젝트 전체에서 tmpclaude-* 검색)
    tmp_count = 0

    # 프로젝트 루트
    for tmp_file in BASE_DIR.glob("tmpclaude-*"):
        if tmp_file.is_dir():
            shutil.rmtree(tmp_file)
        else:
            tmp_file.unlink()
        tmp_count += 1

    # output/ 폴더 전체 (하위 폴더 포함)
    if OUTPUT_DIR.exists():
        for tmp_file in OUTPUT_DIR.rglob("tmpclaude-*"):
            if tmp_file.is_dir():
                shutil.rmtree(tmp_file)
            else:
                tmp_file.unlink()
            tmp_count += 1

    # remotion/ 폴더 전체 (하위 폴더 포함)
    if REMOTION_DIR.exists():
        for tmp_file in REMOTION_DIR.rglob("tmpclaude-*"):
            if tmp_file.is_dir():
                shutil.rmtree(tmp_file)
            else:
                tmp_file.unlink()
            tmp_count += 1

    if tmp_count > 0:
        print(f"\n[temp] {tmp_count}개 임시 파일 삭제")
        deleted_counts["temp"] = tmp_count

    # 5. state.json 초기화
    if phase is None:
        print("\n[state.json] 초기화")
        initial_state = {
            "project_id": "",
            "topic": "",
            "duration_target": 120,
            "aspect_ratio": "16:9",
            "style": "antique",
            "narrator_voice": "nova",
            "phase": "initialized",
            "current_step": 1,
            "scenes_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        save_json(initial_state, STATE_FILE, quiet=True)
        print("  -> phase: initialized, step: 1")

    # 결과 요약
    total_deleted = sum(deleted_counts.values())
    print("\n" + "=" * 50)
    print(f"초기화 완료! 총 {total_deleted}개 항목 삭제")
    print("=" * 50)

    return True


# ============================================================
# Supabase 에셋 관리
# ============================================================
def get_supabase_client() -> Optional[Any]:
    """Supabase 클라이언트 생성"""
    if not SUPABASE_AVAILABLE:
        print("[ERROR] supabase package not installed")
        print("  pip install supabase")
        return None

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] Supabase env not set")
        print("  Set SUPABASE_URL, SUPABASE_ANON_KEY in .env")
        return None

    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[ERROR] Supabase connection failed - {e}")
        return None


def get_image_info(filepath: Path) -> Dict[str, Any]:
    """이미지 파일 정보 추출"""
    info = {
        "file_size": filepath.stat().st_size,
        "mime_type": mimetypes.guess_type(str(filepath))[0] or "image/png",
    }

    if PIL_AVAILABLE:
        try:
            with Image.open(filepath) as img:
                info["width"] = img.width
                info["height"] = img.height
        except Exception:
            info["width"] = None
            info["height"] = None
    else:
        info["width"] = None
        info["height"] = None

    return info


def extract_required_assets() -> List[Dict[str, Any]]:
    """scenes.json에서 필요한 에셋 목록 추출"""
    scenes_file = SCRIPTS_DIR / "scenes.json"
    if not scenes_file.exists():
        print("오류: scenes.json 파일이 없습니다.")
        return []

    data = load_json(scenes_file)
    assets = []
    seen = set()

    for scene in data.get("scenes", []):
        for elem in scene.get("required_elements", []):
            asset_id = elem.get("asset")
            if asset_id and asset_id not in seen:
                seen.add(asset_id)
                elem_type = elem.get("type", "image")

                # 타입에 따른 카테고리 매핑
                category = "icons"
                if elem_type == "map":
                    category = "maps"
                elif elem_type == "image":
                    if "portrait" in asset_id or "silhouette" in asset_id:
                        category = "portraits"
                    else:
                        category = "backgrounds"
                elif elem_type == "icon":
                    category = "icons"

                assets.append({
                    "asset_id": asset_id,
                    "type": elem_type,
                    "category": category,
                    "role": elem.get("role", ""),
                    "scene_id": scene.get("scene_id", ""),
                })

    return assets


def generate_asset_catalog() -> Dict[str, Any]:
    """assets/ 폴더 전체를 스캔하여 에셋 카탈로그 생성

    다른 에이전트(visual-layout, motion-canvas-coder 등)가
    사용 가능한 에셋 목록을 파악할 수 있도록 카탈로그 생성
    """
    catalog = {
        "meta": {
            "generated_at": datetime.now().isoformat(),
            "base_path": str(ASSETS_DIR),
            "total_assets": 0
        },
        "categories": {}
    }

    # 카테고리별 한글 설명
    category_labels = {
        "maps": "지도",
        "portraits": "인물/캐릭터",
        "icons": "아이콘",
        "backgrounds": "배경",
        "artifacts": "사료/유물",
        "characters": "캐릭터",
        "objects": "물체"
    }

    total_count = 0

    # 모든 하위 폴더 스캔 (기존 카테고리 + 새로운 폴더)
    if ASSETS_DIR.exists():
        for subdir in ASSETS_DIR.iterdir():
            if not subdir.is_dir():
                continue

            category = subdir.name
            assets_list = []

            # 이미지 파일 스캔
            for filepath in subdir.glob("*"):
                if filepath.suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
                    continue

                asset_id = filepath.stem

                # 이미지 크기 추출
                width, height = None, None
                if PIL_AVAILABLE:
                    try:
                        with Image.open(filepath) as img:
                            width, height = img.width, img.height
                    except Exception:
                        pass

                # 파일 정보
                asset_entry = {
                    "filename": filepath.name,
                    "asset_id": asset_id,
                    "path": f"assets/{category}/{filepath.name}",
                    "size": f"{width}x{height}" if width and height else "unknown",
                    "width": width,
                    "height": height,
                    "format": filepath.suffix.lower().lstrip("."),
                    "file_size_kb": round(filepath.stat().st_size / 1024, 1),
                    "tags": [category, asset_id]
                }

                assets_list.append(asset_entry)
                total_count += 1

            if assets_list:
                # 파일명 기준 정렬
                assets_list.sort(key=lambda x: x["filename"])

                catalog["categories"][category] = {
                    "label": category_labels.get(category, category),
                    "count": len(assets_list),
                    "assets": assets_list
                }

    catalog["meta"]["total_assets"] = total_count

    return catalog


def cmd_asset_check():
    """필요한 에셋 조회 및 상태 확인 + 카탈로그 생성"""
    print("=" * 50)
    print("에셋 체크 + 카탈로그 생성")
    print("=" * 50)

    # 0. 에셋 카탈로그 생성 (항상 실행)
    print("\n[0] 에셋 카탈로그 생성")
    catalog = generate_asset_catalog()
    catalog_path = OUTPUT_DIR / "asset_catalog.json"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    save_json(catalog, catalog_path)

    print(f"  총 {catalog['meta']['total_assets']}개 에셋 발견")
    for cat_name, cat_data in catalog.get("categories", {}).items():
        print(f"    - {cat_name}: {cat_data['count']}개")

    # 1. 필요한 에셋 목록 추출
    required = extract_required_assets()
    if not required:
        print("\n필요한 에셋이 없거나 scenes.json을 찾을 수 없습니다.")
        print(f"\n카탈로그 생성 완료: {catalog_path}")
        return True

    print(f"\n[1] 필요한 에셋: {len(required)}개")

    # 2. Supabase 연결
    supabase = get_supabase_client()

    # 3. 각 에셋 상태 확인
    results = {"found": [], "missing": [], "local_only": []}

    for asset in required:
        asset_id = asset["asset_id"]
        category = asset["category"]

        # 로컬 파일 확인
        local_path = None
        for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
            check_path = ASSET_CATEGORIES.get(category, ASSETS_DIR) / f"{asset_id}{ext}"
            if check_path.exists():
                local_path = check_path
                break

        # Supabase 확인
        db_record = None
        if supabase:
            try:
                response = supabase.table("assets").select("*").eq("asset_id", asset_id).execute()
                if response.data:
                    db_record = response.data[0]
            except Exception as e:
                print(f"  [WARN] DB 조회 실패 ({asset_id}): {e}")

        # 상태 분류
        if db_record:
            if local_path:
                results["found"].append({**asset, "local": str(local_path), "db": db_record})
            else:
                results["found"].append({**asset, "local": None, "db": db_record})
        elif local_path:
            results["local_only"].append({**asset, "local": str(local_path)})
        else:
            results["missing"].append(asset)

    # 4. 결과 출력
    print(f"\n[Supabase에 있음] {len(results['found'])}개")
    for item in results["found"]:
        local_status = "로컬O" if item.get("local") else "로컬X"
        print(f"  [O] {item['asset_id']} ({item['category']}) - {local_status}")

    print(f"\n[로컬에만 있음 - 업로드 필요] {len(results['local_only'])}개")
    for item in results["local_only"]:
        print(f"  [^] {item['asset_id']} ({item['category']}) - {item['local']}")

    print(f"\n[없음 - 생성 필요] {len(results['missing'])}개")
    for item in results["missing"]:
        print(f"  [X] {item['asset_id']} ({item['category']}) - {item['role']}")

    # 5. 결과 저장
    report = {
        "checked_at": datetime.now().isoformat(),
        "summary": {
            "total": len(required),
            "found": len(results["found"]),
            "local_only": len(results["local_only"]),
            "missing": len(results["missing"]),
        },
        "details": results
    }
    report_path = OUTPUT_DIR / "asset_check_report.json"
    save_json(report, report_path)

    print(f"\n상세 리포트: {report_path}")
    print(f"에셋 카탈로그: {catalog_path}")
    print("=" * 50)

    # 6. 다음 단계 안내
    if results["local_only"]:
        print("\n로컬 에셋을 Supabase에 업로드하려면:")
        print("  python history_maker.py asset-upload")

    if results["missing"]:
        print("\n없는 에셋을 생성하려면:")
        print("  /image-prompt-writer 스킬을 사용하세요")

    return True


def cmd_asset_catalog():
    """에셋 카탈로그만 생성 (에이전트용)

    assets/ 폴더를 스캔하여 output/asset_catalog.json 생성
    visual-layout, motion-canvas-coder 등 에이전트가 참조
    """
    print("=" * 50)
    print("에셋 카탈로그 생성")
    print("=" * 50)

    catalog = generate_asset_catalog()
    catalog_path = OUTPUT_DIR / "asset_catalog.json"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    save_json(catalog, catalog_path)

    print(f"\n총 {catalog['meta']['total_assets']}개 에셋")
    print("-" * 40)

    for cat_name, cat_data in catalog.get("categories", {}).items():
        print(f"\n[{cat_data['label']}] {cat_name}/ ({cat_data['count']}개)")
        for asset in cat_data["assets"][:5]:  # 처음 5개만 표시
            print(f"  - {asset['filename']} ({asset['size']})")
        if cat_data["count"] > 5:
            print(f"  ... 외 {cat_data['count'] - 5}개")

    print("\n" + "=" * 50)
    print(f"카탈로그 저장: {catalog_path}")
    print("=" * 50)

    return True


def cmd_asset_upload(asset_id: Optional[str] = None):
    """로컬 에셋을 Supabase에 업로드"""
    print("=" * 50)
    print("에셋 업로드 (Local -> Supabase)")
    print("=" * 50)

    supabase = get_supabase_client()
    if not supabase:
        return False

    # 업로드 대상 파일 찾기
    files_to_upload = []

    if asset_id:
        # 특정 에셋만
        for category, dir_path in ASSET_CATEGORIES.items():
            for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
                filepath = dir_path / f"{asset_id}{ext}"
                if filepath.exists():
                    files_to_upload.append((filepath, category, asset_id))
                    break
    else:
        # assets/ 폴더 전체 스캔
        for category, dir_path in ASSET_CATEGORIES.items():
            if not dir_path.exists():
                continue
            for filepath in dir_path.glob("*"):
                if filepath.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
                    aid = filepath.stem
                    files_to_upload.append((filepath, category, aid))

    if not files_to_upload:
        print("업로드할 파일이 없습니다.")
        print(f"  assets/ 폴더에 이미지를 넣어주세요: {ASSETS_DIR}")
        return False

    print(f"\n업로드 대상: {len(files_to_upload)}개 파일")

    uploaded = 0
    for filepath, category, aid in files_to_upload:
        print(f"\n  [{category}] {aid}")

        # 이미 DB에 있는지 확인
        try:
            existing = supabase.table("assets").select("id").eq("asset_id", aid).execute()
            if existing.data:
                print(f"    -> 이미 존재함, 스킵")
                continue
        except Exception as e:
            print(f"    -> DB 확인 실패: {e}")

        # 이미지 정보 추출
        img_info = get_image_info(filepath)

        # 스토리지 업로드
        storage_path = f"{category}/{filepath.name}"
        try:
            with open(filepath, "rb") as f:
                file_data = f.read()

            # 스토리지에 업로드
            supabase.storage.from_(STORAGE_BUCKET).upload(
                storage_path,
                file_data,
                {"content-type": img_info["mime_type"]}
            )
            print(f"    -> 스토리지 업로드 완료")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                print(f"    -> 스토리지에 이미 존재")
            else:
                print(f"    -> 스토리지 업로드 실패: {e}")
                continue

        # DB에 메타데이터 저장
        project_info = get_project_info()
        db_record = {
            "asset_id": aid,
            "asset_type": category.rstrip("s"),  # maps -> map
            "category": category,
            "file_name": filepath.name,
            "file_path": storage_path,
            "file_size": img_info["file_size"],
            "mime_type": img_info["mime_type"],
            "width": img_info["width"],
            "height": img_info["height"],
            "title": aid.replace("_", " ").title(),
            "era": "조선",
            "period": project_info.get("topic", ""),
        }

        try:
            supabase.table("assets").insert(db_record).execute()
            print(f"    -> DB 메타데이터 저장 완료")
            uploaded += 1
        except Exception as e:
            print(f"    -> DB 저장 실패: {e}")

    print(f"\n업로드 완료: {uploaded}개")
    print("=" * 50)
    return True


# 에셋별 프롬프트 템플릿 (흰색 배경 - 배경 제거 용이)
ASSET_PROMPT_TEMPLATES = {
    # Maps (배경 이미지라 흰색 배경 불필요)
    "joseon_south_sea": {
        "prompt": "Ancient Korean map of southern sea coast, Joseon dynasty style, showing Korean peninsula southern region with Jindo island, hand-drawn cartography on aged parchment, sepia tones, traditional East Asian map aesthetics, compass rose, wave patterns in ocean areas, mountain symbols for land, 16th century historical map style",
        "size": "1920x1080",
        "is_background": True
    },
    "joseon_south_sea_detail": {
        "prompt": "Detailed ancient Korean naval map, Joseon dynasty 1597, southern coastal waters near Jindo, showing Chilcheollyang strait area marked with X symbol for battle loss, traditional brush stroke style, aged yellowed paper texture, ink wash painting influence, military strategic map aesthetic",
        "size": "1920x1080",
        "is_background": True
    },
    "jindo_strait_map": {
        "prompt": "Ancient tactical map of Myeongnyang Strait (Uldolmok), narrow channel between Jindo island and mainland Korea, showing swirling tidal current patterns, 294 meter width marked, traditional Korean cartography style, military strategy map, ink on aged parchment, arrows indicating water flow direction",
        "size": "1920x1080",
        "is_background": True
    },
    # Portraits (흰색 배경으로 배경 제거 용이하게)
    "yi_sun_sin_silhouette": {
        "prompt": "Dramatic silhouette of Admiral Yi Sun-sin, Korean naval commander in traditional armor and helmet, side profile facing right, heroic pose standing tall, solid black silhouette, flowing cape, dignified military bearing, historical warrior aesthetic, pure white background, clean edges, isolated subject",
        "size": "800x1200",
        "white_bg": True
    },
    "yi_sun_sin_portrait": {
        "prompt": "Historical portrait of Admiral Yi Sun-sin, Korean naval hero, traditional Joseon dynasty military armor, stern dignified expression, classical East Asian portrait painting style, muted earth tones, aged canvas texture, 16th century Korean general aesthetic, formal pose, detailed armor craftsmanship, pure white background, clean edges for easy background removal",
        "size": "800x1000",
        "white_bg": True
    },
    "yi_sunsin_portrait": {
        "prompt": "Admiral Yi Sun-sin portrait in battle stance, wearing traditional Korean naval commander armor, determined expression, holding sword, historical oil painting style, dramatic lighting on subject, heroic composition, pure white background, isolated figure, clean edges for background removal",
        "size": "800x1000",
        "white_bg": True
    },
    # Icons (흰색 배경으로 배경 제거 용이하게)
    "vs_symbol": {
        "prompt": "Dramatic VS battle symbol, metallic gold and bronze texture, ancient warfare aesthetic, ornate decorative frame, aged metal with patina, historical document style emblem, versus confrontation symbol, pure white background, isolated icon, clean edges",
        "size": "400x400",
        "white_bg": True
    },
    "question_mark": {
        "prompt": "Mysterious question mark symbol, hand-drawn calligraphy style, sepia ink, historical document aesthetic, curiosity and mystery symbol, pure white background, isolated symbol, clean sharp edges for easy cutout",
        "size": "300x400",
        "white_bg": True
    },
    "ship_icon_12": {
        "prompt": "Formation of 12 Korean turtle ships (Geobukseon) icons arranged in group, top-down view, traditional wooden warship silhouettes, simple iconic style, historical naval fleet symbol, Joseon dynasty naval vessels, pure white background, clean isolated icons",
        "size": "600x400",
        "white_bg": True
    },
    "arrow_north": {
        "prompt": "Military tactical arrow pointing upward/north, ancient map style, hand-drawn ink brush stroke, indicating troop movement direction, traditional cartography symbol, strategic advance indicator, pure white background, isolated arrow icon, clean edges",
        "size": "200x400",
        "white_bg": True
    },
    "current_arrow": {
        "prompt": "Swirling ocean current arrows, tidal flow indicator, multiple curved arrows showing water movement, traditional nautical map style, blue-gray ink wash, dynamic water flow pattern, ancient maritime chart aesthetic, pure white background, isolated arrows",
        "size": "400x300",
        "white_bg": True
    },
    "ship_icon_joseon": {
        "prompt": "Single Korean Panokseon warship icon, Joseon dynasty naval vessel, side view silhouette, traditional wooden battleship with distinctive roof structure, simple iconic representation, historical naval symbol, pure white background, clean isolated ship icon",
        "size": "300x200",
        "white_bg": True
    },
    "arrow_forward": {
        "prompt": "Bold forward-pointing arrow, military charge direction indicator, hand-drawn brush stroke style, dynamic aggressive movement symbol, traditional ink style, battle advance arrow, historical tactical map element, pure white background, isolated icon",
        "size": "400x200",
        "white_bg": True
    },
    "ship_icon_japan": {
        "prompt": "Japanese Sengoku period warship icon (Atakebune), side view silhouette, 16th century Japanese naval vessel, distinctive tall structure, simple iconic representation, darker tone than Korean ships, enemy fleet symbol, pure white background, clean isolated icon",
        "size": "300x200",
        "white_bg": True
    },
    "collision_effect": {
        "prompt": "Naval collision impact symbol, ships crashing effect, explosive burst pattern, traditional ink splash style, chaos and destruction indicator, battle damage symbol, dynamic impact lines radiating outward, pure white background, isolated effect icon",
        "size": "400x400",
        "white_bg": True
    },
    "sinking_ship": {
        "prompt": "Sinking warship icon, tilted vessel going underwater, waves engulfing ship, destruction symbol, simple silhouette style, naval defeat indicator, historical maritime disaster representation, ink wash style, pure white background, clean isolated icon",
        "size": "300x300",
        "white_bg": True
    },
    "victory_symbol": {
        "prompt": "Ancient victory emblem, triumphant laurel wreath or Korean traditional victory symbol, golden bronze metallic texture, military honor badge, aged antique finish, historical conquest symbol, ornate decorative design, pure white background, isolated emblem, clean edges",
        "size": "400x400",
        "white_bg": True
    },
    "eye_icon": {
        "prompt": "Wisdom eye symbol, strategic vision icon, single eye representing insight and foresight, traditional East Asian artistic style, ink brush painting aesthetic, seeing beyond the obvious, military strategist symbol, pure white background, isolated icon, clean edges",
        "size": "300x300",
        "white_bg": True
    },
}

DEFAULT_PROMPT_TEMPLATE = {
    "prompt": "Historical documentary style icon, antique aesthetic, sepia tones, traditional East Asian artistic style, pure white background, isolated icon, clean edges for easy background removal",
    "size": "400x400",
    "white_bg": True
}


def cmd_asset_prompts():
    """누락된 에셋의 AI 이미지 생성 프롬프트 JSON 생성"""
    print("=" * 50)
    print("Asset Prompts Generation")
    print("=" * 50)

    # 1. 필요한 에셋 목록 추출
    required = extract_required_assets()
    if not required:
        print("No assets required or scenes.json not found.")
        return False

    # 2. Supabase/로컬 확인하여 누락된 에셋만 필터
    supabase = get_supabase_client()
    missing_assets = []

    for asset in required:
        asset_id = asset["asset_id"]
        category = asset["category"]

        # 로컬 파일 확인
        local_exists = False
        for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
            check_path = ASSET_CATEGORIES.get(category, ASSETS_DIR) / f"{asset_id}{ext}"
            if check_path.exists():
                local_exists = True
                break

        # Supabase 확인
        db_exists = False
        if supabase:
            try:
                response = supabase.table("assets").select("id").eq("asset_id", asset_id).execute()
                if response.data:
                    db_exists = True
            except Exception:
                pass

        # 둘 다 없으면 누락
        if not local_exists and not db_exists:
            missing_assets.append(asset)

    if not missing_assets:
        print("\nAll assets are available. No prompts needed.")
        return True

    print(f"\nMissing assets: {len(missing_assets)}")

    # 3. 프롬프트 JSON 생성
    project_info = get_project_info()
    prompts_data = {
        "meta": {
            "project": project_info.get("topic", "History Video"),
            "style": f"{project_info.get('style', 'antique')}, historical documentary, parchment texture",
            "resolution": "1920x1080" if project_info.get("aspect_ratio") == "16:9" else "1080x1920",
            "created_at": datetime.now().strftime("%Y-%m-%d"),
            "total_assets": len(missing_assets)
        },
        "assets": []
    }

    for asset in missing_assets:
        asset_id = asset["asset_id"]
        category = asset["category"]
        role = asset.get("role", "")

        # 템플릿에서 프롬프트 가져오기
        template = ASSET_PROMPT_TEMPLATES.get(asset_id, DEFAULT_PROMPT_TEMPLATE)

        # 배경 이미지인지 확인
        is_background = template.get("is_background", False)

        asset_entry = {
            "folder": category,
            "filename": f"{asset_id}.png",
            "asset_id": asset_id,
            "prompt": template.get("prompt", DEFAULT_PROMPT_TEMPLATE["prompt"]),
            "negative_prompt": "modern, digital, cartoon, anime, bright neon colors, text in Korean, complex background" if not is_background else "modern, digital, cartoon, anime, bright neon colors, text in Korean",
            "size": template.get("size", "400x400"),
            "role": role
        }

        # 배경 제거가 필요한 에셋은 흰색 배경 표시
        if template.get("white_bg", False):
            asset_entry["background"] = "white (for easy removal)"
        elif is_background:
            asset_entry["background"] = "full image (no removal needed)"

        prompts_data["assets"].append(asset_entry)
        print(f"  [+] {category}/{asset_id}.png")

    # 4. JSON 파일 저장
    output_path = OUTPUT_DIR / "image_prompts.json"
    save_json(prompts_data, output_path)

    print(f"\n" + "=" * 50)
    print(f"Generated: {output_path}")
    print(f"Total: {len(missing_assets)} asset prompts")
    print("=" * 50)
    print("\nNext steps:")
    print("  1. Use image_prompts.json with AI image generator")
    print("  2. Save generated images to assets/<folder>/<filename>")
    print("  3. Run: python history_maker.py asset-upload")

    return True


def cmd_asset_download(asset_id: Optional[str] = None, category: Optional[str] = None):
    """Supabase에서 에셋 다운로드"""
    print("=" * 50)
    print("에셋 다운로드 (Supabase -> Local)")
    print("=" * 50)

    supabase = get_supabase_client()
    if not supabase:
        return False

    # 다운로드 대상 조회
    try:
        query = supabase.table("assets").select("*")
        if asset_id:
            query = query.eq("asset_id", asset_id)
        if category:
            query = query.eq("category", category)

        response = query.execute()
        assets = response.data
    except Exception as e:
        print(f"오류: DB 조회 실패 - {e}")
        return False

    if not assets:
        print("다운로드할 에셋이 없습니다.")
        return False

    print(f"\n다운로드 대상: {len(assets)}개")

    downloaded = 0
    for asset in assets:
        aid = asset["asset_id"]
        cat = asset.get("category", "icons")
        storage_path = asset.get("file_path", "")
        filename = asset.get("file_name", f"{aid}.png")

        print(f"\n  [{cat}] {aid}")

        # 로컬 경로 생성
        local_dir = ASSET_CATEGORIES.get(cat, ASSETS_DIR / cat)
        local_dir.mkdir(parents=True, exist_ok=True)
        local_path = local_dir / filename

        if local_path.exists():
            print(f"    -> 이미 존재함, 스킵")
            continue

        # 스토리지에서 다운로드
        try:
            data = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)
            with open(local_path, "wb") as f:
                f.write(data)
            print(f"    -> 다운로드 완료: {local_path}")
            downloaded += 1

            # 사용 횟수 증가
            supabase.rpc("increment_asset_usage", {"p_asset_id": aid}).execute()
        except Exception as e:
            print(f"    -> 다운로드 실패: {e}")

    print(f"\n다운로드 완료: {downloaded}개")
    print("=" * 50)
    return True


def cmd_asset_list(category: Optional[str] = None):
    """Supabase에 저장된 에셋 목록"""
    print("=" * 50)
    print("에셋 목록 (Supabase)")
    print("=" * 50)

    supabase = get_supabase_client()
    if not supabase:
        return False

    try:
        query = supabase.table("assets").select("asset_id, category, title, width, height, usage_count")
        if category:
            query = query.eq("category", category)

        response = query.order("category").order("usage_count", desc=True).execute()
        assets = response.data
    except Exception as e:
        print(f"오류: DB 조회 실패 - {e}")
        return False

    if not assets:
        print("저장된 에셋이 없습니다.")
        return False

    # 카테고리별 그룹화
    by_category = {}
    for asset in assets:
        cat = asset.get("category", "unknown")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(asset)

    for cat, items in by_category.items():
        print(f"\n[{cat}] ({len(items)}개)")
        for item in items:
            size = f"{item.get('width', '?')}x{item.get('height', '?')}"
            usage = item.get("usage_count", 0)
            print(f"  - {item['asset_id']} ({size}) - 사용: {usage}회")

    print(f"\n총 {len(assets)}개 에셋")
    print("=" * 50)
    return True


# ============================================================
# TTS 파이프라인 (Step 6 ~ 6.5)
# ============================================================
SECTION_FILES = ["hook", "core", "outro"]


def get_openai_client():
    """OpenAI 클라이언트 생성"""
    if not OPENAI_AVAILABLE:
        print("[ERROR] openai package not installed")
        print("  pip install openai")
        return None

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[ERROR] OPENAI_API_KEY not set in .env")
        return None

    return OpenAI()


def cmd_tts_generate(voice: str = "nova"):
    """Step 6: 섹션별 TTS 생성"""
    print("=" * 50)
    print("Step 6: 섹션별 TTS 생성")
    print("=" * 50)

    client = get_openai_client()
    if not client:
        return False

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    generated = 0
    for section in SECTION_FILES:
        scene_file = SCRIPTS_DIR / f"scenes_{section}.json"
        if not scene_file.exists():
            print(f"\n[SKIP] scenes_{section}.json 없음")
            continue

        print(f"\n[{section}] TTS 생성 중...")

        # narration_tts 합치기
        data = load_json(scene_file)
        scenes = data.get("scenes", [])
        full_text = " ".join([s.get("narration_tts", "") for s in scenes])

        if not full_text.strip():
            print(f"  -> narration_tts가 비어있음")
            continue

        print(f"  텍스트 길이: {len(full_text)}자")

        # TTS 생성
        try:
            response = client.audio.speech.create(
                model="gpt-4o-mini-tts",
                voice=voice,
                input=full_text,
                response_format="mp3"
            )

            output_path = AUDIO_DIR / f"{section}.mp3"
            with open(output_path, "wb") as f:
                f.write(response.content)

            print(f"  -> 저장: {output_path.name}")
            generated += 1

        except Exception as e:
            print(f"  -> 오류: {e}")

    print(f"\n완료: {generated}개 섹션 TTS 생성")
    return generated > 0


def cmd_tts_timestamps():
    """Step 6.5-1: Whisper 타임스탬프 추출"""
    print("=" * 50)
    print("Step 6.5-1: Whisper 타임스탬프 추출")
    print("=" * 50)

    client = get_openai_client()
    if not client:
        return False

    extracted = 0
    for section in SECTION_FILES:
        audio_file = AUDIO_DIR / f"{section}.mp3"
        if not audio_file.exists():
            print(f"\n[SKIP] {section}.mp3 없음")
            continue

        print(f"\n[{section}] Whisper 분석 중...")

        try:
            with open(audio_file, "rb") as f:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    language="ko",
                    response_format="verbose_json",
                    timestamp_granularities=["segment"]
                )

            result = response.model_dump()

            output_path = AUDIO_DIR / f"{section}_timestamps.json"
            save_json(result, output_path)

            print(f"  총 길이: {result.get('duration', 0):.1f}초")
            print(f"  세그먼트: {len(result.get('segments', []))}개")
            extracted += 1

        except Exception as e:
            print(f"  -> 오류: {e}")

    print(f"\n완료: {extracted}개 타임스탬프 추출")
    print("\n⚠️ 다음 단계: audio-splitter Sub-agent로 AI 매칭 실행")
    return extracted > 0


def cmd_tts_split():
    """Step 6.5-3: FFmpeg으로 씬별 오디오 분할 + 타이밍 파일 생성"""
    print("=" * 50)
    print("Step 6.5-3: FFmpeg 오디오 분할 + 타이밍 생성")
    print("=" * 50)

    # split_points 파일들 찾기
    split_files = list(AUDIO_DIR.glob("split_points*.json"))

    if not split_files:
        print("오류: split_points*.json 파일이 없습니다.")
        print("  -> audio-splitter Sub-agent로 먼저 AI 매칭을 실행하세요.")
        return False

    split_count = 0
    timing_count = 0

    for split_file in split_files:
        data = load_json(split_file)

        # 단일 파일인 경우 (split_points.json)
        if "sections" in data:
            sections = data["sections"]
        else:
            # 섹션별 파일인 경우 (split_points_core.json)
            sections = {data.get("section", "unknown"): data}

        for section_name, section_data in sections.items():
            source_file = section_data.get("source_file", f"{section_name}.mp3")
            source_path = AUDIO_DIR / source_file

            if not source_path.exists():
                print(f"\n[SKIP] {source_file} 없음")
                continue

            print(f"\n[{section_name}] {source_file} 분할")

            for split in section_data.get("splits", []):
                scene_id = split["scene_id"]
                start = split["start"]
                end = split["end"]
                duration = split.get("duration", end - start)
                output_path = AUDIO_DIR / f"{scene_id}.mp3"

                # FFmpeg으로 오디오 분할
                cmd = [
                    "ffmpeg", "-y",
                    "-i", str(source_path),
                    "-ss", str(start),
                    "-to", str(end),
                    "-c", "copy",
                    str(output_path)
                ]

                result = subprocess.run(cmd, capture_output=True, text=True)

                if result.returncode == 0:
                    print(f"  [OK] {scene_id}: {start:.2f}s ~ {end:.2f}s ({duration:.2f}s)")
                    split_count += 1

                    # 타이밍 파일 생성
                    timing_data = {
                        "scene_id": scene_id,
                        "section": section_name,
                        "audio_file": f"{scene_id}.mp3",
                        "duration": round(duration, 3),
                        "start_in_section": round(start, 3),
                        "end_in_section": round(end, 3),
                        "source_file": source_file
                    }

                    # narration_summary가 있으면 추가
                    if "narration_summary" in split:
                        timing_data["narration_summary"] = split["narration_summary"]

                    timing_path = AUDIO_DIR / f"{scene_id}_timing.json"
                    save_json(timing_data, timing_path, quiet=True)
                    timing_count += 1
                else:
                    print(f"  [ERR] {scene_id}: {result.stderr[:100]}")

    print(f"\n완료: {split_count}개 씬 오디오 분할")
    print(f"      {timing_count}개 타이밍 파일 생성")
    return split_count > 0


def cmd_tts_pipeline(voice: str = "nova"):
    """전체 TTS 파이프라인 (Step 6 + 6.5-1 + 6.5-3)"""
    print("=" * 50)
    print("TTS 파이프라인 전체 실행")
    print("=" * 50)

    # Step 6: TTS 생성
    print("\n" + "=" * 50)
    if not cmd_tts_generate(voice):
        print("TTS 생성 실패")
        return False

    # Step 6.5-1: 타임스탬프 추출
    print("\n" + "=" * 50)
    if not cmd_tts_timestamps():
        print("타임스탬프 추출 실패")
        return False

    # Step 6.5-2: AI 매칭 (수동 필요)
    print("\n" + "=" * 50)
    print("Step 6.5-2: AI 매칭 필요")
    print("=" * 50)
    print("""
다음 명령으로 audio-splitter Sub-agent를 실행하세요:

각 섹션별로 병렬 실행:
  Task 1: audio-splitter → hook 섹션
  Task 2: audio-splitter → core 섹션
  Task 3: audio-splitter → outro 섹션

AI 매칭 완료 후:
  python history_maker.py tts-split
""")

    return True


# ============================================================
# 메인
# ============================================================
def main():
    parser = argparse.ArgumentParser(
        description="History Video Maker 유틸리티",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
명령어:
  merge-scenes    scenes_*.json 병합 및 분할
  status          프로젝트 상태 확인
  clean           생성된 파일 정리
  asset-check     필요한 에셋 조회 + 카탈로그 생성
  asset-catalog   에셋 카탈로그만 생성 (에이전트용)
  asset-prompts   누락 에셋 프롬프트 JSON 생성
  asset-upload    로컬 에셋 업로드 (-> Supabase)
  asset-download  에셋 다운로드 (Supabase ->)
  asset-list      Supabase 에셋 목록
  tts-generate    섹션별 TTS 생성 (Step 6)
  tts-timestamps  Whisper 타임스탬프 추출 (Step 6.5-1)
  tts-split       FFmpeg 오디오 분할 (Step 6.5-3)
  tts-pipeline    전체 TTS 파이프라인 실행

예시:
  python history_maker.py merge-scenes
  python history_maker.py status
  python history_maker.py clean --phase 2
  python history_maker.py asset-check
  python history_maker.py asset-catalog
  python history_maker.py asset-prompts
  python history_maker.py asset-upload
  python history_maker.py asset-download yi_sun_sin_portrait
  python history_maker.py tts-pipeline --voice nova
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="실행할 명령어")

    # merge-scenes
    subparsers.add_parser("merge-scenes", help="씬 파일 병합 및 분할")

    # status
    subparsers.add_parser("status", help="프로젝트 상태 확인")

    # clean
    clean_parser = subparsers.add_parser("clean", help="프로젝트 초기화 (생성된 파일 정리)")
    clean_parser.add_argument(
        "--phase", type=int, choices=[1, 2, 3, 4, 5],
        help="특정 Phase 이후 파일만 삭제"
    )
    clean_parser.add_argument(
        "--keep-assets", action="store_true",
        help="assets/ 폴더는 유지 (Supabase 에셋 보존)"
    )

    # asset-check
    subparsers.add_parser("asset-check", help="필요한 에셋 조회 + 카탈로그 생성")

    # asset-catalog
    subparsers.add_parser("asset-catalog", help="에셋 카탈로그만 생성 (에이전트용)")

    # asset-prompts
    subparsers.add_parser("asset-prompts", help="누락 에셋 프롬프트 JSON 생성")

    # asset-upload
    upload_parser = subparsers.add_parser("asset-upload", help="로컬 에셋 업로드")
    upload_parser.add_argument(
        "asset_id", nargs="?", default=None,
        help="특정 에셋만 업로드 (생략 시 전체)"
    )

    # asset-download
    download_parser = subparsers.add_parser("asset-download", help="에셋 다운로드")
    download_parser.add_argument(
        "asset_id", nargs="?", default=None,
        help="특정 에셋만 다운로드 (생략 시 전체)"
    )
    download_parser.add_argument(
        "--category", "-c", type=str,
        help="카테고리로 필터 (maps, portraits, icons, backgrounds, artifacts)"
    )

    # asset-list
    list_parser = subparsers.add_parser("asset-list", help="Supabase 에셋 목록")
    list_parser.add_argument(
        "--category", "-c", type=str,
        help="카테고리로 필터"
    )

    # tts-generate
    tts_gen_parser = subparsers.add_parser("tts-generate", help="섹션별 TTS 생성 (Step 6)")
    tts_gen_parser.add_argument(
        "--voice", "-v", type=str, default="nova",
        help="TTS 목소리 (기본: nova)"
    )

    # tts-timestamps
    subparsers.add_parser("tts-timestamps", help="Whisper 타임스탬프 추출 (Step 6.5-1)")

    # tts-split
    subparsers.add_parser("tts-split", help="FFmpeg 오디오 분할 (Step 6.5-3)")

    # tts-pipeline
    tts_pipe_parser = subparsers.add_parser("tts-pipeline", help="전체 TTS 파이프라인")
    tts_pipe_parser.add_argument(
        "--voice", "-v", type=str, default="nova",
        help="TTS 목소리 (기본: nova)"
    )

    args = parser.parse_args()

    if args.command == "merge-scenes":
        cmd_merge_scenes()
    elif args.command == "status":
        cmd_status()
    elif args.command == "clean":
        cmd_clean(args.phase, getattr(args, 'keep_assets', False))
    elif args.command == "asset-check":
        cmd_asset_check()
    elif args.command == "asset-catalog":
        cmd_asset_catalog()
    elif args.command == "asset-prompts":
        cmd_asset_prompts()
    elif args.command == "asset-upload":
        cmd_asset_upload(args.asset_id)
    elif args.command == "asset-download":
        cmd_asset_download(args.asset_id, args.category)
    elif args.command == "asset-list":
        cmd_asset_list(args.category)
    elif args.command == "tts-generate":
        cmd_tts_generate(args.voice)
    elif args.command == "tts-timestamps":
        cmd_tts_timestamps()
    elif args.command == "tts-split":
        cmd_tts_split()
    elif args.command == "tts-pipeline":
        cmd_tts_pipeline(args.voice)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
