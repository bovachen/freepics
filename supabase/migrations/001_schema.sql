-- ============================================
-- FreePics.cc Database Schema
-- Run this migration in Supabase SQL Editor
-- ============================================

-- 1. Images 表
CREATE TABLE IF NOT EXISTS images (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh        text NOT NULL,
  title_en        text NOT NULL,
  description_zh  text,
  description_en  text,
  alt_text_zh     text,
  alt_text_en     text,
  prompt_en       text,
  prompt_zh       text,
  negative_prompt text,
  model           text,
  lora_name       text,
  sampler         text,
  steps           int,
  cfg_scale       float,
  seed            bigint,
  -- 横版 (landscape 16:9)
  width           int DEFAULT 4096,
  height          int DEFAULT 2304,
  -- 竖版 (portrait 9:16)
  width_portrait  int DEFAULT 2304,
  height_portrait int DEFAULT 4096,
  style           text NOT NULL CHECK (style IN ('realistic', 'anime')),
  is_holiday      boolean DEFAULT false,
  holiday_name    text,
  tags_zh         text[] DEFAULT '{}',
  tags_en         text[] DEFAULT '{}',
  -- 横版 R2 存储路径
  r2_4k_key       text,
  r2_avif_key     text,
  r2_thumb_1920   text,
  r2_thumb_400    text,
  -- 竖版 R2 存储路径
  r2_4k_portrait_key   text,
  r2_avif_portrait_key text,
  r2_thumb_portrait    text,
  metadata_source text DEFAULT 'freepics.cc',
  likes_count     int DEFAULT 0,
  views_count     int DEFAULT 0,
  downloads_4k    int DEFAULT 0,
  downloads_avif  int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_images_style ON images(style);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_likes ON images(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_images_downloads ON images((downloads_4k + downloads_avif) DESC);
CREATE INDEX IF NOT EXISTS idx_images_tags_zh ON images USING GIN(tags_zh);
CREATE INDEX IF NOT EXISTS idx_images_tags_en ON images USING GIN(tags_en);

-- 全文搜索列（用触发器自动更新，因为 to_tsvector 不是 IMMUTABLE）
ALTER TABLE images ADD COLUMN IF NOT EXISTS fts_zh tsvector;
ALTER TABLE images ADD COLUMN IF NOT EXISTS fts_en tsvector;

CREATE INDEX IF NOT EXISTS idx_images_fts_zh ON images USING GIN(fts_zh);
CREATE INDEX IF NOT EXISTS idx_images_fts_en ON images USING GIN(fts_en);

-- 触发器函数：自动更新全文搜索向量
CREATE OR REPLACE FUNCTION images_fts_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.fts_zh := to_tsvector('simple',
    coalesce(NEW.title_zh, '') || ' ' ||
    coalesce(NEW.description_zh, '') || ' ' ||
    coalesce(array_to_string(NEW.tags_zh, ' '), '')
  );
  NEW.fts_en := to_tsvector('english',
    coalesce(NEW.title_en, '') || ' ' ||
    coalesce(NEW.description_en, '') || ' ' ||
    coalesce(array_to_string(NEW.tags_en, ' '), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_images_fts
  BEFORE INSERT OR UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION images_fts_trigger();

-- 2. 用户点赞表
CREATE TABLE IF NOT EXISTS user_likes (
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  image_id   uuid REFERENCES images ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, image_id)
);

-- 3. 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  image_id   uuid REFERENCES images ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, image_id)
);

-- 4. 下载记录表
CREATE TABLE IF NOT EXISTS user_downloads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  image_id   uuid REFERENCES images ON DELETE CASCADE,
  format     text NOT NULL CHECK (format IN ('4k', 'avif')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_downloads_user ON user_downloads(user_id, created_at DESC);

-- ============================================
-- RLS 策略
-- ============================================

ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;

-- images: 任何人可读
CREATE POLICY "Images are viewable by everyone"
  ON images FOR SELECT
  USING (true);

-- images: 仅 service_role 可写（n8n 用 service_role key 写入）
CREATE POLICY "Images are insertable by service role only"
  ON images FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Images are updatable by service role only"
  ON images FOR UPDATE
  USING (false);

-- user_likes: 用户只能操作自己的
CREATE POLICY "Users can view their own likes"
  ON user_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes"
  ON user_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON user_likes FOR DELETE
  USING (auth.uid() = user_id);

-- user_favorites: 同上
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- user_downloads: 用户可查看和插入自己的
CREATE POLICY "Users can view their own downloads"
  ON user_downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads"
  ON user_downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 数据库函数
-- ============================================

-- 切换点赞
CREATE OR REPLACE FUNCTION toggle_like(p_image_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM user_likes WHERE user_id = v_user_id AND image_id = p_image_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM user_likes WHERE user_id = v_user_id AND image_id = p_image_id;
    UPDATE images SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_image_id;
    RETURN json_build_object('liked', false);
  ELSE
    INSERT INTO user_likes(user_id, image_id) VALUES (v_user_id, p_image_id);
    UPDATE images SET likes_count = likes_count + 1 WHERE id = p_image_id;
    RETURN json_build_object('liked', true);
  END IF;
END;
$$;

-- 切换收藏
CREATE OR REPLACE FUNCTION toggle_favorite(p_image_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM user_favorites WHERE user_id = v_user_id AND image_id = p_image_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM user_favorites WHERE user_id = v_user_id AND image_id = p_image_id;
    RETURN json_build_object('favorited', false);
  ELSE
    INSERT INTO user_favorites(user_id, image_id) VALUES (v_user_id, p_image_id);
    RETURN json_build_object('favorited', true);
  END IF;
END;
$$;

-- 增加浏览量
CREATE OR REPLACE FUNCTION increment_view(p_image_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE images SET views_count = views_count + 1 WHERE id = p_image_id;
END;
$$;

-- 记录下载
CREATE OR REPLACE FUNCTION record_download(p_image_id uuid, p_format text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  -- 更新图片下载计数
  IF p_format = '4k' THEN
    UPDATE images SET downloads_4k = downloads_4k + 1 WHERE id = p_image_id;
  ELSIF p_format = 'avif' THEN
    UPDATE images SET downloads_avif = downloads_avif + 1 WHERE id = p_image_id;
  END IF;

  -- 如果已登录则记录下载
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_downloads(user_id, image_id, format)
    VALUES (v_user_id, p_image_id, p_format);
  END IF;
END;
$$;
