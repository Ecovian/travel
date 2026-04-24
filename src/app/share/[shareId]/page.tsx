import { SharedTripPageClient } from "@/components/shared-trip-page-client";

type PageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function SharedTripPage({ params }: PageProps) {
  const { shareId } = await params;

  return <SharedTripPageClient shareId={shareId} />;
}
