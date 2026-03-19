import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let format: string;
  try {
    const body = await request.json();
    format = body.format;
    if (!["4k", "avif"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Missing format" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ recorded: true, message: "Mock mode" });
  }

  try {
    const supabase = createServerSupabaseClient();
    await supabase.rpc("record_download" as string, { p_image_id: id, p_format: format } as any);
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("API /images/[id]/download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
