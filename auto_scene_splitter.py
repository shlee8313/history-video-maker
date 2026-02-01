#!/usr/bin/env python3
"""
Auto Scene Splitter - Whisper 타임스탬프와 자막 세그먼트 자동 매칭

이 스크립트는 각 섹션의 Whisper words와 씬의 subtitle_segments를 매칭하여
타이밍 파일(s{n}_timed.json)을 생성합니다.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
import re

BASE_DIR = Path(__file__).parent
SCRIPTS_DIR = BASE_DIR / "output" / "1_scripts"
AUDIO_DIR = BASE_DIR / "output" / "2_audio"

def load_json(path: Path) -> Dict:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path: Path, data: Dict):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def normalize_text(text: str) -> str:
    """텍스트 정규화 (비교용)"""
    # 숫자를 한글로 변환 (간단 버전)
    text = re.sub(r'["\'\.,?!]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def find_word_match(words: List[Dict], target_text: str, start_idx: int = 0) -> tuple:
    """
    target_text의 시작/끝에 해당하는 word 인덱스를 찾음
    Returns: (start_word_idx, end_word_idx, start_time, end_time, matched_words)
    """
    target_normalized = normalize_text(target_text)
    target_words = target_normalized.split()

    if not target_words or start_idx >= len(words):
        return None

    # 첫 단어 찾기
    first_target = target_words[0]
    start_word_idx = None

    for i in range(start_idx, len(words)):
        word_normalized = normalize_text(words[i]['word'])
        # 부분 매칭 허용 (조사 분리 등)
        if first_target in word_normalized or word_normalized in first_target or first_target[:2] == word_normalized[:2]:
            start_word_idx = i
            break

    if start_word_idx is None:
        # 첫 두 글자로 재시도
        for i in range(start_idx, len(words)):
            if len(words[i]['word']) >= 2 and len(first_target) >= 2:
                if words[i]['word'][:2] == first_target[:2]:
                    start_word_idx = i
                    break

    if start_word_idx is None:
        return None

    # 마지막 단어 찾기 (대략 segment 길이만큼)
    estimated_words = len(target_words)
    end_word_idx = min(start_word_idx + estimated_words + 3, len(words) - 1)

    # 더 정확한 끝 찾기
    last_target = target_words[-1] if target_words else ""
    for i in range(end_word_idx, start_word_idx, -1):
        if i < len(words):
            word_normalized = normalize_text(words[i]['word'])
            if last_target in word_normalized or word_normalized in last_target:
                end_word_idx = i
                break

    matched_words = [words[j]['word'] for j in range(start_word_idx, min(end_word_idx + 1, len(words)))]

    return (
        start_word_idx,
        end_word_idx,
        words[start_word_idx]['start'],
        words[min(end_word_idx, len(words) - 1)]['end'],
        matched_words
    )

def process_section(section: str, scene_ids: List[str]):
    """섹션의 모든 씬 타이밍 처리"""

    # Whisper 데이터 로드
    whisper_path = AUDIO_DIR / f"{section}_whisper.json"
    if not whisper_path.exists():
        print(f"[SKIP] {section}: whisper file not found")
        return

    whisper_data = load_json(whisper_path)
    words = whisper_data.get('words', [])

    if not words:
        print(f"[SKIP] {section}: no words in whisper data")
        return

    word_idx = 0  # 현재 처리 중인 word 인덱스

    for scene_id in scene_ids:
        # 씬 데이터 로드
        scene_path = SCRIPTS_DIR / f"{scene_id}.json"
        if not scene_path.exists():
            print(f"[SKIP] {scene_id}: scene file not found")
            continue

        scene_data = load_json(scene_path)
        subtitle_segments = scene_data.get('subtitle_segments', [])

        if not subtitle_segments:
            print(f"[SKIP] {scene_id}: no subtitle_segments")
            continue

        captions = []
        scene_start = None
        scene_end = None

        for idx, segment_text in enumerate(subtitle_segments):
            match = find_word_match(words, segment_text, word_idx)

            if match:
                start_word_idx, end_word_idx, start_time, end_time, matched_words = match

                if scene_start is None:
                    scene_start = start_time
                scene_end = end_time

                captions.append({
                    "index": idx,
                    "text": segment_text,
                    "start": round(start_time, 2),
                    "end": round(end_time, 2),
                    "duration": round(end_time - start_time, 2),
                    "words_matched": matched_words
                })

                word_idx = end_word_idx + 1
            else:
                # 매칭 실패 - fallback으로 이전 끝 시간부터 추정
                estimated_duration = len(segment_text) * 0.08  # 글자당 약 0.08초
                if captions:
                    start_time = captions[-1]['end'] + 0.2
                elif scene_start:
                    start_time = scene_start
                else:
                    start_time = words[word_idx]['start'] if word_idx < len(words) else 0

                end_time = start_time + estimated_duration

                captions.append({
                    "index": idx,
                    "text": segment_text,
                    "start": round(start_time, 2),
                    "end": round(end_time, 2),
                    "duration": round(estimated_duration, 2),
                    "words_matched": [],
                    "fallback": True
                })

                if scene_start is None:
                    scene_start = start_time
                scene_end = end_time

        # 타이밍 파일 생성
        if scene_start is None:
            scene_start = 0
        if scene_end is None:
            scene_end = scene_start + 5

        timed_data = {
            "scene_id": scene_id,
            "section": section,
            "timing": {
                "section_audio": f"output/2_audio/{section}.mp3",
                "scene_start": round(scene_start, 2),
                "scene_end": round(scene_end, 2),
                "duration": round(scene_end - scene_start, 2)
            },
            "captions": captions,
            "match_info": {
                "total_segments": len(subtitle_segments),
                "matched_segments": sum(1 for c in captions if 'fallback' not in c),
                "match_rate": f"{sum(1 for c in captions if 'fallback' not in c) / len(subtitle_segments) * 100:.0f}%",
                "confidence": "high" if all('fallback' not in c for c in captions) else "medium"
            }
        }

        output_path = AUDIO_DIR / f"{scene_id}_timed.json"
        save_json(output_path, timed_data)
        print(f"[OK] {scene_id}: {len(captions)} segments, {timed_data['timing']['duration']:.1f}s")

def main():
    # scenes.json 로드
    scenes_path = SCRIPTS_DIR / "scenes.json"
    scenes_data = load_json(scenes_path)

    sections_info = scenes_data.get('meta', {}).get('sections', {})

    # 처리할 섹션들 (이미 처리된 hook, background, core1 제외)
    sections_to_process = ['core2', 'core3', 'core4', 'core5', 'core6', 'core7', 'insight', 'outro']

    for section in sections_to_process:
        if section in sections_info:
            scene_ids = sections_info[section].get('scenes', [])
            print(f"\n[SECTION] {section} ({len(scene_ids)} scenes)")
            process_section(section, scene_ids)
        else:
            print(f"\n[SKIP] {section}: not in scenes.json")

if __name__ == "__main__":
    main()
