import { NextRequest, NextResponse } from "next/server";
import { getImages } from "@/lib/data/images";
import type { SortType, StyleFilter } from "@/lib/data/images";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const style = (searchParams.get("style") || "all") as StyleFilter;
  const sort = (searchParams.get("sort") || "latest") as SortType;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  try {
    const images = await getImages({ style, sort, page, limit });
    return NextResponse.json({ images, page, limit });
  } catch (error) {
    console.error("API /images error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
