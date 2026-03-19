import { NextRequest, NextResponse } from "next/server";
import { searchImagesDB } from "@/lib/data/images";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const locale = (searchParams.get("locale") || "zh") as "zh" | "en";
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  if (!q.trim()) {
    return NextResponse.json({ images: [], query: q });
  }

  try {
    const images = await searchImagesDB(q, locale, limit);
    return NextResponse.json({ images, query: q });
  } catch (error) {
    console.error("API /search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
