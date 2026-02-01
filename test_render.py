#!/usr/bin/env python3
"""
Test Render Script - 배경 포함 렌더링 테스트
S5_test.tsx를 렌더링하여 test/ 폴더에 저장
"""

import subprocess
import os
import sys
import shutil
from pathlib import Path

# 경로 설정
PROJECT_ROOT = Path(__file__).parent
REMOTION_DIR = PROJECT_ROOT / "remotion"
TEST_OUTPUT_DIR = PROJECT_ROOT / "test"

def backup_root():
    """기존 Root.tsx 백업"""
    root_path = REMOTION_DIR / "src" / "Root.tsx"
    backup_path = REMOTION_DIR / "src" / "Root_backup.tsx"

    if root_path.exists():
        shutil.copy(root_path, backup_path)
        print(f"[OK] Root.tsx backed up to Root_backup.tsx")
    return backup_path

def swap_to_test_root():
    """Root.tsx를 테스트용으로 교체"""
    root_path = REMOTION_DIR / "src" / "Root.tsx"
    test_root_path = REMOTION_DIR / "src" / "Root_test.tsx"

    if test_root_path.exists():
        shutil.copy(test_root_path, root_path)
        print(f"[OK] Swapped to Root_test.tsx")
    else:
        print(f"[ERROR] Root_test.tsx not found!")
        sys.exit(1)

def restore_root():
    """원본 Root.tsx 복원"""
    root_path = REMOTION_DIR / "src" / "Root.tsx"
    backup_path = REMOTION_DIR / "src" / "Root_backup.tsx"

    if backup_path.exists():
        shutil.copy(backup_path, root_path)
        os.remove(backup_path)
        print(f"[OK] Root.tsx restored from backup")

def render_scene(scene_id: str, output_path: Path):
    """Remotion으로 씬 렌더링 (배경 포함, 불투명)"""

    print(f"\n{'='*60}")
    print(f"Rendering {scene_id} with background...")
    print(f"Output: {output_path}")
    print(f"{'='*60}\n")

    # Remotion 렌더 명령
    cmd = [
        "npx", "remotion", "render",
        scene_id,
        str(output_path),
        "--codec", "h264",
        "--image-format", "jpeg",  # 불투명 렌더링 (배경 포함이므로 PNG 불필요)
        "--crf", "18",
        "--log", "verbose"
    ]

    print(f"Command: {' '.join(cmd)}")
    print()

    result = subprocess.run(
        cmd,
        cwd=str(REMOTION_DIR),
        shell=True
    )

    if result.returncode == 0:
        print(f"\n[SUCCESS] Rendered to {output_path}")

        # 파일 크기 확인
        if output_path.exists():
            size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"[INFO] File size: {size_mb:.2f} MB")
    else:
        print(f"\n[ERROR] Render failed with code {result.returncode}")

    return result.returncode

def main():
    print("="*60)
    print("TEST RENDER - Background Included Rendering Test")
    print("="*60)

    # 테스트 출력 폴더 생성
    TEST_OUTPUT_DIR.mkdir(exist_ok=True)

    # 기존 Root.tsx 백업
    backup_root()

    try:
        # 테스트용 Root로 교체
        swap_to_test_root()

        # S5test 렌더링
        output_path = TEST_OUTPUT_DIR / "s5_with_bg.mp4"
        result = render_scene("S5test", output_path)

        if result == 0:
            print("\n" + "="*60)
            print("[TEST COMPLETE]")
            print(f"Output saved to: {output_path}")
            print("="*60)

    finally:
        # 원본 Root.tsx 복원
        restore_root()

    return result

if __name__ == "__main__":
    sys.exit(main())
