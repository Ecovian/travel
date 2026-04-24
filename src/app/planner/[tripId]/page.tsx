import { TripPlannerPageClient } from "@/components/trip-planner-page-client";

type PageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripPlannerDetailPage({ params }: PageProps) {
  const { tripId } = await params;

  return <TripPlannerPageClient tripId={tripId} />;
}
