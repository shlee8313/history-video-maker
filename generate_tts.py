"""
TTS 생성 스크립트
OpenAI gpt-4o-mini-tts API를 사용하여 나레이션 음성 생성
"""

import json
import os
from pathlib import Path
from openai import OpenAI

# 환경 설정
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# 경로 설정
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
SCRIPTS_DIR = OUTPUT_DIR / "1_scripts"
AUDIO_DIR = OUTPUT_DIR / "2_audio"

# OpenAI 클라이언트
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_tts():
    """씬별 TTS 생성"""

    # 오디오 디렉토리 생성
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # scenes.json 로드
    scenes_file = SCRIPTS_DIR / "scenes.json"
    with open(scenes_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    scenes = data.get("scenes", [])
    print(f"총 {len(scenes)}개 씬 TTS 생성 시작")
    print("=" * 50)

    for scene in scenes:
        scene_id = scene.get("scene_id", "unknown")
        narration = scene.get("narration_tts", "")

        if not narration:
            print(f"[{scene_id}] 나레이션 없음, 스킵")
            continue

        output_path = AUDIO_DIR / f"{scene_id}.mp3"

        # 이미 존재하면 스킵
        if output_path.exists():
            print(f"[{scene_id}] 이미 존재, 스킵")
            continue

        print(f"[{scene_id}] 생성 중...")
        print(f"  텍스트: {narration[:50]}...")

        try:
            # gpt-4o-mini-tts 사용, nova 목소리 (밝고 활기찬 여성 톤)
            response = client.audio.speech.create(
                model="gpt-4o-mini-tts",
                voice="nova",  # 밝고 활기찬 여성 톤
                input=narration,
                instructions="역사 다큐멘터리 내레이터처럼 차분하고 권위 있게 읽어주세요. 적절한 강조와 휴지를 넣어 청취자가 내용을 이해할 수 있도록 해주세요.",
                response_format="mp3"
            )

            # 파일 저장
            response.stream_to_file(str(output_path))
            print(f"  -> 완료: {output_path}")

        except Exception as e:
            print(f"  -> 오류: {e}")

    print("=" * 50)
    print("TTS 생성 완료!")

    # 생성된 파일 목록
    print("\n생성된 파일:")
    for f in sorted(AUDIO_DIR.glob("*.mp3")):
        size_kb = f.stat().st_size / 1024
        print(f"  - {f.name} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    generate_tts()
