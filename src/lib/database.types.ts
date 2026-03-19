// TypeScript 类型定义（匹配 Supabase Schema）

export interface Database {
  public: {
    Tables: {
      images: {
        Row: ImageRow;
        Insert: ImageInsert;
        Update: ImageUpdate;
      };
      user_likes: {
        Row: UserLikeRow;
        Insert: UserLikeInsert;
        Update: never;
      };
      user_favorites: {
        Row: UserFavoriteRow;
        Insert: UserFavoriteInsert;
        Update: never;
      };
      user_downloads: {
        Row: UserDownloadRow;
        Insert: UserDownloadInsert;
        Update: never;
      };
    };
    Functions: {
      toggle_like: {
        Args: { p_image_id: string };
        Returns: { liked: boolean };
      };
      toggle_favorite: {
        Args: { p_image_id: string };
        Returns: { favorited: boolean };
      };
      increment_view: {
        Args: { p_image_id: string };
        Returns: void;
      };
      record_download: {
        Args: { p_image_id: string; p_format: string };
        Returns: void;
      };
    };
  };
}

// images 表
export interface ImageRow {
  id: string;
  title_zh: string;
  title_en: string;
  description_zh: string | null;
  description_en: string | null;
  alt_text_zh: string | null;
  alt_text_en: string | null;
  prompt_en: string | null;
  prompt_zh: string | null;
  negative_prompt: string | null;
  model: string | null;
  lora_name: string | null;
  sampler: string | null;
  steps: number | null;
  cfg_scale: number | null;
  seed: number | null;
  width: number;
  height: number;
  style: "realistic" | "anime";
  is_holiday: boolean;
  holiday_name: string | null;
  tags_zh: string[];
  tags_en: string[];
  r2_4k_key: string | null;
  r2_avif_key: string | null;
  r2_thumb_1920: string | null;
  r2_thumb_400: string | null;
  metadata_source: string;
  likes_count: number;
  views_count: number;
  downloads_4k: number;
  downloads_avif: number;
  created_at: string;
}

export type ImageInsert = Omit<ImageRow, "id" | "likes_count" | "views_count" | "downloads_4k" | "downloads_avif" | "created_at" | "metadata_source"> & {
  id?: string;
  likes_count?: number;
  views_count?: number;
  downloads_4k?: number;
  downloads_avif?: number;
  created_at?: string;
  metadata_source?: string;
};

export type ImageUpdate = Partial<ImageInsert>;

// user_likes 表
export interface UserLikeRow {
  user_id: string;
  image_id: string;
  created_at: string;
}

export type UserLikeInsert = Omit<UserLikeRow, "created_at"> & {
  created_at?: string;
};

// user_favorites 表
export interface UserFavoriteRow {
  user_id: string;
  image_id: string;
  created_at: string;
}

export type UserFavoriteInsert = Omit<UserFavoriteRow, "created_at"> & {
  created_at?: string;
};

// user_downloads 表
export interface UserDownloadRow {
  id: string;
  user_id: string;
  image_id: string;
  format: "4k" | "avif";
  created_at: string;
}

export type UserDownloadInsert = Omit<UserDownloadRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// 前端用的统一图片接口（兼容 mock 数据结构）
export interface ImageData {
  id: string;
  title_zh: string;
  title_en: string;
  description_zh: string;
  description_en: string;
  alt_text_zh: string;
  alt_text_en: string;
  prompt_en: string;
  prompt_zh: string;
  negative_prompt: string;
  model: string;
  lora_name?: string;
  sampler: string;
  steps: number;
  cfg_scale: number;
  seed: number;
  width: number;
  height: number;
  style: "realistic" | "anime";
  is_holiday: boolean;
  holiday_name?: string;
  tags_zh: string[];
  tags_en: string[];
  thumbnail: string;
  r2_4k_key: string;
  r2_avif_key: string;
  likes_count: number;
  views_count: number;
  downloads_4k: number;
  downloads_avif: number;
  created_at: string;
  aspect_ratio: number;
}

// 将数据库行转换为前端 ImageData
export function rowToImageData(row: ImageRow): ImageData {
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

  return {
    id: row.id,
    title_zh: row.title_zh,
    title_en: row.title_en,
    description_zh: row.description_zh || "",
    description_en: row.description_en || "",
    alt_text_zh: row.alt_text_zh || "",
    alt_text_en: row.alt_text_en || "",
    prompt_en: row.prompt_en || "",
    prompt_zh: row.prompt_zh || "",
    negative_prompt: row.negative_prompt || "",
    model: row.model || "",
    lora_name: row.lora_name || undefined,
    sampler: row.sampler || "",
    steps: row.steps || 0,
    cfg_scale: row.cfg_scale || 0,
    seed: row.seed || 0,
    width: row.width,
    height: row.height,
    style: row.style,
    is_holiday: row.is_holiday,
    holiday_name: row.holiday_name || undefined,
    tags_zh: row.tags_zh || [],
    tags_en: row.tags_en || [],
    thumbnail: row.r2_thumb_400
      ? `${R2_PUBLIC_URL}/${row.r2_thumb_400}`
      : "/images/mock/mountain.png",
    r2_4k_key: row.r2_4k_key || "",
    r2_avif_key: row.r2_avif_key || "",
    likes_count: row.likes_count,
    views_count: row.views_count,
    downloads_4k: row.downloads_4k,
    downloads_avif: row.downloads_avif,
    created_at: row.created_at,
    aspect_ratio: row.width / row.height,
  };
}
