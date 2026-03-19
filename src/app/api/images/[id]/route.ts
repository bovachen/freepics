import { NextRequest, NextResponse } from "next/server";
import { getImageById, incrementView } from "@/lib/data/images";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const image = await getImageById(id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // 增加浏览量（异步，不阻塞响应）
    incrementView(id).catch(console.error);

    return NextResponse.json({ image });
  } catch (error) {
    console.error("API /images/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
