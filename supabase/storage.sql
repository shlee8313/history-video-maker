-- ============================================
-- History Video Maker - Supabase Storage Setup
-- 에셋 파일 저장을 위한 스토리지 버킷 설정
-- ============================================

-- 1. 메인 에셋 버킷 생성
-- Supabase Dashboard > Storage에서 실행하거나 SQL Editor에서 실행
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'history-assets',
    'history-assets',
    true,  -- 공개 버킷 (영상 렌더링 시 접근 필요)
    52428800,  -- 50MB 제한
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS(Row Level Security) 정책 설정

-- 모든 사용자가 에셋을 읽을 수 있음
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'history-assets');

-- 인증된 사용자만 업로드 가능 (anon key 사용 시)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'history-assets');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'history-assets');

-- 3. 폴더 구조 가이드 (실제 생성은 파일 업로드 시 자동)
-- history-assets/
-- ├── maps/           # 고지도
-- │   ├── joseon_south_sea.png
-- │   └── jindo_strait_map.png
-- ├── portraits/      # 인물 초상화
-- │   ├── yi_sun_sin_portrait.png
-- │   └── yi_sun_sin_silhouette.png
-- ├── icons/          # 아이콘
-- │   ├── ship_icon_joseon.png
-- │   ├── ship_icon_japan.png
-- │   └── vs_symbol.png
-- ├── backgrounds/    # 배경 이미지
-- │   └── parchment_texture.png
-- └── artifacts/      # 사료 이미지
--     └── nanjung_ilgi.png
