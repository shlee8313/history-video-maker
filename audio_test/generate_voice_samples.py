"""
OpenAI TTS 음성 샘플 생성 스크립트
모든 음성 종류로 동일한 텍스트를 녹음하여 비교
"""

import os
from pathlib import Path

# .env 로드
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from openai import OpenAI

# OpenAI 클라이언트
client = OpenAI()

# 샘플 텍스트 (hook 섹션에서 발췌)
SAMPLE_TEXT = """여러분, 오늘날 서울 강남 땅 부러우시죠?
압구정, 청담, 도곡동... 평당 일억이 넘는 금싸라기 땅.
그런데 조선시대에도 한양의 노른자 땅을 쓸어 담은 사람들이 있었습니다.
놀라운 건, 그들의 직업이었죠."""

# OpenAI TTS 음성 목록
VOICES = [
    ("alloy", "중성적, 균형잡힌 톤"),
    ("echo", "따뜻하고 자연스러운 남성"),
    ("fable", "영국식 억양, 표현력 있음"),
    ("onyx", "깊고 권위있는 남성"),
    ("nova", "따뜻하고 친근한 여성"),
    ("shimmer", "밝고 경쾌한 여성"),
]

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent

def generate_sample(voice_id: str, description: str):
    """단일 음성 샘플 생성"""
    output_path = OUTPUT_DIR / f"sample_{voice_id}.mp3"

    print(f"Generating: {voice_id} - {description}")

    response = client.audio.speech.create(
        model="tts-1-hd",  # 고품질 모델
        voice=voice_id,
        input=SAMPLE_TEXT,
        speed=1.0
    )

    response.stream_to_file(str(output_path))
    print(f"  -> Saved: {output_path.name}")

    return output_path

def main():
    print("=" * 60)
    print("OpenAI TTS 음성 샘플 생성")
    print("=" * 60)
    print(f"\n샘플 텍스트:\n{SAMPLE_TEXT}\n")
    print("-" * 60)

    # 각 음성으로 샘플 생성
    for voice_id, description in VOICES:
        try:
            generate_sample(voice_id, description)
        except Exception as e:
            print(f"  -> Error: {e}")

    print("-" * 60)
    print("\n완료! audio_test 폴더에서 샘플을 확인하세요.")
    print("\n음성 특징:")
    for voice_id, description in VOICES:
        print(f"  - {voice_id}: {description}")

if __name__ == "__main__":
    main()
