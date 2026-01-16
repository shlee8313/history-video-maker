-- ============================================
-- History Video Maker - Supabase Schema
-- 에셋 관리를 위한 테이블 및 스토리지 설정
-- ============================================

-- 1. 에셋 메타데이터 테이블
-- 이미지/에셋의 정보를 저장하여 재사용 가능하게 함
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 기본 정보
    asset_id VARCHAR(100) NOT NULL,           -- 고유 에셋 ID (예: yi_sun_sin_portrait)
    asset_type VARCHAR(50) NOT NULL,          -- map, portrait, icon, background, artifact
    category VARCHAR(50),                      -- maps, portraits, icons, backgrounds, artifacts

    -- 파일 정보
    file_name VARCHAR(255) NOT NULL,          -- 실제 파일명
    file_path VARCHAR(500),                   -- 스토리지 경로
    file_size INTEGER,                        -- 파일 크기 (bytes)
    mime_type VARCHAR(100),                   -- image/png, image/jpeg 등

    -- 이미지 속성
    width INTEGER,                            -- 이미지 너비 (px)
    height INTEGER,                           -- 이미지 높이 (px)

    -- 설명 및 메타데이터
    title VARCHAR(255),                       -- 에셋 제목 (한글)
    title_en VARCHAR(255),                    -- 에셋 제목 (영문)
    description TEXT,                         -- 상세 설명
    keywords TEXT[],                          -- 검색 키워드 배열

    -- 역사 관련 정보
    era VARCHAR(100),                         -- 시대 (조선, 고려, 삼국시대 등)
    period VARCHAR(100),                      -- 세부 시기 (임진왜란, 명량해전 등)
    related_figures TEXT[],                   -- 관련 인물 배열
    related_events TEXT[],                    -- 관련 사건 배열

    -- AI 생성 정보 (AI로 생성된 에셋인 경우)
    is_ai_generated BOOLEAN DEFAULT FALSE,    -- AI 생성 여부
    ai_prompt TEXT,                           -- 생성에 사용된 프롬프트
    ai_model VARCHAR(100),                    -- 사용된 AI 모델

    -- 사용 통계
    usage_count INTEGER DEFAULT 0,            -- 사용 횟수
    last_used_at TIMESTAMP WITH TIME ZONE,    -- 마지막 사용 시간

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 유니크 제약조건
    CONSTRAINT unique_asset_id UNIQUE (asset_id)
);

-- 2. 프로젝트-에셋 연결 테이블
-- 어떤 프로젝트에서 어떤 에셋을 사용했는지 추적
CREATE TABLE IF NOT EXISTS project_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    project_id VARCHAR(100) NOT NULL,         -- 프로젝트 ID
    asset_id VARCHAR(100) NOT NULL,           -- 에셋 ID (assets.asset_id 참조)
    scene_id VARCHAR(50),                     -- 사용된 씬 ID (s1, s2, ...)
    role VARCHAR(255),                        -- 에셋의 역할 설명

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 복합 유니크 제약조건
    CONSTRAINT unique_project_asset_scene UNIQUE (project_id, asset_id, scene_id)
);

-- 3. 에셋 태그 테이블 (다대다 관계용)
CREATE TABLE IF NOT EXISTS asset_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    asset_id VARCHAR(100) NOT NULL,           -- assets.asset_id 참조
    tag VARCHAR(100) NOT NULL,                -- 태그명

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_asset_tag UNIQUE (asset_id, tag)
);

-- 4. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_assets_asset_id ON assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_era ON assets(era);
CREATE INDEX IF NOT EXISTS idx_assets_period ON assets(period);
CREATE INDEX IF NOT EXISTS idx_assets_keywords ON assets USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_assets_related_figures ON assets USING GIN(related_figures);
CREATE INDEX IF NOT EXISTS idx_assets_related_events ON assets USING GIN(related_events);

CREATE INDEX IF NOT EXISTS idx_project_assets_project ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_asset ON project_assets(asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_tags_asset ON asset_tags(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag ON asset_tags(tag);

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 사용 횟수 증가 함수
CREATE OR REPLACE FUNCTION increment_asset_usage(p_asset_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE assets
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE asset_id = p_asset_id;
END;
$$ LANGUAGE plpgsql;

-- 7. 에셋 검색 함수 (키워드, 시대, 유형으로 검색)
CREATE OR REPLACE FUNCTION search_assets(
    p_keyword TEXT DEFAULT NULL,
    p_type VARCHAR DEFAULT NULL,
    p_era VARCHAR DEFAULT NULL,
    p_period VARCHAR DEFAULT NULL
)
RETURNS SETOF assets AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM assets
    WHERE
        (p_keyword IS NULL OR
         title ILIKE '%' || p_keyword || '%' OR
         title_en ILIKE '%' || p_keyword || '%' OR
         description ILIKE '%' || p_keyword || '%' OR
         p_keyword = ANY(keywords))
        AND (p_type IS NULL OR asset_type = p_type)
        AND (p_era IS NULL OR era = p_era)
        AND (p_period IS NULL OR period = p_period)
    ORDER BY usage_count DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql;
