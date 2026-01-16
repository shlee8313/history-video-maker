"""
TTS 목소리 테스트 스크립트
gpt-4o-mini-tts의 다양한 목소리로 샘플 음성 생성
"""

import os
from pathlib import Path
from openai import OpenAI

# 환경 설정
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# OpenAI 클라이언트
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 테스트 디렉토리
TEST_DIR = Path(__file__).parent / "output" / "voice_test"
TEST_DIR.mkdir(parents=True, exist_ok=True)

# 테스트 텍스트 (역사 다큐 스타일)
TEST_TEXT = "배 열두 척으로, 백서른세 척을 이겼다? 불가능합니다. 그런데 이순신은 해냈습니다. 대체 어떻게?"

# gpt-4o-mini-tts 사용 가능한 목소리들
VOICES = [
    ("alloy", "중성적, 균형잡힌 톤"),
    ("ash", "부드럽고 차분한 톤"),
    ("ballad", "따뜻하고 풍부한 톤"),
    ("coral", "밝고 명확한 여성 톤"),
    ("echo", "깊고 울림있는 톤"),
    ("fable", "영국식 억양, 표현력 풍부"),
    ("nova", "밝고 활기찬 여성 톤"),
    ("onyx", "깊고 권위있는 남성 톤"),
    ("sage", "차분하고 지적인 톤"),
    ("shimmer", "따뜻하고 친근한 여성 톤"),
    ("verse", "다재다능한 중성 톤"),
]

# 다큐멘터리 내레이터 스타일 instruction
INSTRUCTION = "역사 다큐멘터리 내레이터처럼 차분하고 권위 있게 읽어주세요. 적절한 강조와 휴지를 넣어 청취자가 내용을 이해할 수 있도록 해주세요."

def test_voices():
    """모든 목소리로 테스트 음성 생성"""
    print("=" * 60)
    print("TTS 목소리 테스트")
    print("=" * 60)
    print(f"\n테스트 텍스트: {TEST_TEXT}")
    print(f"저장 위치: {TEST_DIR}")
    print("\n생성 중...")
    print("-" * 60)

    for voice, description in VOICES:
        output_path = TEST_DIR / f"voice_{voice}.mp3"

        # 이미 존재하면 스킵
        if output_path.exists():
            print(f"[{voice}] 이미 존재, 스킵 - {description}")
            continue

        print(f"[{voice}] 생성 중... - {description}")

        try:
            response = client.audio.speech.create(
                model="gpt-4o-mini-tts",
                voice=voice,
                input=TEST_TEXT,
                instructions=INSTRUCTION,
                response_format="mp3"
            )

            # 파일 저장
            with open(output_path, "wb") as f:
                f.write(response.content)

            size_kb = output_path.stat().st_size / 1024
            print(f"  -> 완료: {output_path.name} ({size_kb:.1f} KB)")

        except Exception as e:
            print(f"  -> 오류: {e}")

    print("-" * 60)
    print("\n테스트 완료!")
    print("\n생성된 파일 목록:")
    for f in sorted(TEST_DIR.glob("voice_*.mp3")):
        size_kb = f.stat().st_size / 1024
        voice_name = f.stem.replace("voice_", "")
        desc = next((d for v, d in VOICES if v == voice_name), "")
        print(f"  - {f.name} ({size_kb:.1f} KB) - {desc}")

    print("\n" + "=" * 60)
    print("목소리 선택 가이드:")
    print("=" * 60)
    print("  여성 목소리: coral, nova, shimmer")
    print("  남성 목소리: onyx, echo")
    print("  중성 목소리: alloy, ash, sage, verse")
    print("  특수 스타일: ballad(따뜻함), fable(영국식)")
    print("\n음성 파일을 들어보고 원하시는 목소리를 선택해주세요!")

if __name__ == "__main__":
    test_voices()
