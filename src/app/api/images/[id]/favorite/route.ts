import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ favorited: true, message: "Mock mode" });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("toggle_favorite" as string, { p_image_id: id } as any);

    if (error) {
      if (error.message.includes("Not authenticated")) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API /images/[id]/favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
