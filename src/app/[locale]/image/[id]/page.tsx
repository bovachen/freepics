import { getImageById, getSimilarImages } from "@/lib/data/images";
import ImageDetailClient from "./ImageDetailClient";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ImageDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const image = await getImageById(id);

  if (!image) {
    return (
      <div className="detail-page" style={{ paddingTop: "calc(var(--header-height) + 4rem)", textAlign: "center" }}>
        <h1>404 - Image Not Found</h1>
      </div>
    );
  }

  const similarImages = await getSimilarImages(image.id, image.style, 4);

  return <ImageDetailClient image={image} similarImages={similarImages} />;
}
