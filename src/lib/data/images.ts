import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { rowToImageData, type ImageData } from "@/lib/database.types";
import {
  mockImages,
  getImageById as getMockImageById,
  searchImages as searchMockImages,
  getImagesByTag as getMockImagesByTag,
  getImagesByStyle as getMockImagesByStyle,
} from "@/data/mock";

export type SortType = "latest" | "popular" | "downloads" | "random";
export type StyleFilter = "all" | "realistic" | "anime";

interface GetImagesOptions {
  style?: StyleFilter;
  sort?: SortType;
  page?: number;
  limit?: number;
}

// 获取图片列表
export async function getImages(options: GetImagesOptions = {}): Promise<ImageData[]> {
  const { style = "all", sort = "latest", page = 1, limit = 24 } = options;

  if (!isSupabaseConfigured()) {
    // Fallback to mock data
    let images = getMockImagesByStyle(style);
    switch (sort) {
      case "popular":
        images = [...images].sort((a, b) => b.likes_count - a.likes_count);
        break;
      case "downloads":
        images = [...images].sort(
          (a, b) => b.downloads_4k + b.downloads_avif - (a.downloads_4k + a.downloads_avif)
        );
        break;
      case "random":
        images = [...images].sort(() => Math.random() - 0.5);
        break;
      case "latest":
      default:
        images = [...images].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    const start = (page - 1) * limit;
    return images.slice(start, start + limit);
  }

  const supabase = createServerSupabaseClient();
  let query = supabase.from("images").select("*");

  // 风格过滤
  if (style !== "all") {
    query = query.eq("style", style);
  }

  // 排序
  switch (sort) {
    case "popular":
      query = query.order("likes_count", { ascending: false });
      break;
    case "downloads":
      // 由于不能直接 order by expression，按 downloads_4k 降序
      query = query.order("downloads_4k", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // 分页
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching images:", error);
    return getMockImagesByStyle(style);
  }

  return data.map(rowToImageData);
}

// 获取单张图片
export async function getImageById(id: string): Promise<ImageData | null> {
  if (!isSupabaseConfigured()) {
    return getMockImageById(id) || null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    // Fallback: try mock data (useful during dev with uuid vs mock ids)
    return getMockImageById(id) || null;
  }

  return rowToImageData(data);
}

// 搜索图片
export async function searchImagesDB(
  query: string,
  locale: "zh" | "en",
  limit: number = 24
): Promise<ImageData[]> {
  if (!isSupabaseConfigured()) {
    return searchMockImages(query, locale);
  }

  const supabase = createServerSupabaseClient();
  const ftsColumn = locale === "zh" ? "fts_zh" : "fts_en";

  // 尝试全文搜索
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .textSearch(ftsColumn, query, { type: "websearch" })
    .limit(limit);

  if (error || !data || data.length === 0) {
    // Fallback to ILIKE search
    const titleCol = locale === "zh" ? "title_zh" : "title_en";
    const { data: fallbackData } = await supabase
      .from("images")
      .select("*")
      .ilike(titleCol, `%${query}%`)
      .limit(limit);

    if (fallbackData && fallbackData.length > 0) {
      return fallbackData.map(rowToImageData);
    }

    return searchMockImages(query, locale);
  }

  return data.map(rowToImageData);
}

// 按标签获取
export async function getImagesByTagDB(
  tag: string,
  locale: "zh" | "en",
  limit: number = 24
): Promise<ImageData[]> {
  if (!isSupabaseConfigured()) {
    return getMockImagesByTag(tag, locale);
  }

  const supabase = createServerSupabaseClient();
  const tagsCol = locale === "zh" ? "tags_zh" : "tags_en";

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .contains(tagsCol, [tag])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return getMockImagesByTag(tag, locale);
  }

  return data.map(rowToImageData);
}

// 获取相似图片
export async function getSimilarImages(
  imageId: string,
  style: "realistic" | "anime",
  limit: number = 4
): Promise<ImageData[]> {
  if (!isSupabaseConfigured()) {
    return mockImages
      .filter((img) => img.id !== imageId && img.style === style)
      .slice(0, limit);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("style", style)
    .neq("id", imageId)
    .order("likes_count", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return mockImages
      .filter((img) => img.id !== imageId && img.style === style)
      .slice(0, limit);
  }

  return data.map(rowToImageData);
}

// 获取所有标签
export async function getAllTagsDB(locale: "zh" | "en"): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    const { getAllTags } = await import("@/data/mock");
    return getAllTags(locale);
  }

  const supabase = createServerSupabaseClient();
  const tagsCol = locale === "zh" ? "tags_zh" : "tags_en";

  const { data, error } = await supabase
    .from("images")
    .select(tagsCol);

  if (error || !data) {
    const { getAllTags } = await import("@/data/mock");
    return getAllTags(locale);
  }

  const tagSet = new Set<string>();
  data.forEach((row: Record<string, unknown>) => {
    const tags = row[tagsCol] as string[];
    if (tags) tags.forEach((t) => tagSet.add(t));
  });

  return Array.from(tagSet).sort();
}

// 增加浏览量
export async function incrementView(imageId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createServerSupabaseClient();
  await supabase.rpc("increment_view" as string, { p_image_id: imageId } as any);
}
