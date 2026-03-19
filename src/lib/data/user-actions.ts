import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { ImageData } from "@/lib/database.types";

// 切换点赞
export async function toggleLike(imageId: string): Promise<{ liked: boolean } | null> {
  if (!isSupabaseConfigured()) {
    // Mock 模式：模拟切换
    return { liked: true };
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.rpc("toggle_like" as string, { p_image_id: imageId } as any);

  if (error) {
    console.error("Error toggling like:", error);
    return null;
  }

  return data as unknown as { liked: boolean };
}

// 切换收藏
export async function toggleFavorite(imageId: string): Promise<{ favorited: boolean } | null> {
  if (!isSupabaseConfigured()) {
    return { favorited: true };
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.rpc("toggle_favorite" as string, { p_image_id: imageId } as any);

  if (error) {
    console.error("Error toggling favorite:", error);
    return null;
  }

  return data as unknown as { favorited: boolean };
}

// 记录下载
export async function recordDownload(
  imageId: string,
  format: "4k" | "avif"
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createBrowserSupabaseClient();
  await supabase.rpc("record_download" as string, { p_image_id: imageId, p_format: format } as any);
}

// 检查当前用户是否已点赞
export async function checkLiked(imageId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_likes" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .eq("image_id", imageId)
    .maybeSingle();

  return !error && !!data;
}

// 检查当前用户是否已收藏
export async function checkFavorited(imageId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_favorites" as any)
    .select("user_id")
    .eq("user_id", user.id)
    .eq("image_id", imageId)
    .maybeSingle();

  return !error && !!data;
}

// 获取用户点赞的图片 ID 列表
export async function getUserLikeIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_likes" as any)
    .select("image_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as any[]).map((row: any) => row.image_id);
}

// 获取用户收藏的图片 ID 列表
export async function getUserFavoriteIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_favorites" as any)
    .select("image_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as any[]).map((row: any) => row.image_id);
}

// 获取用户下载记录
export async function getUserDownloads(): Promise<
  Array<{ image_id: string; format: string; created_at: string }>
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_downloads" as any)
    .select("image_id, format, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as any[];
}
