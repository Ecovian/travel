import { describe, expect, it } from "vitest";
import {
  adaptNominatimPlace,
  buildNominatimSearchUrl,
  buildOsrmRouteUrl,
  calculateDistanceMeters,
  formatRouteDistance,
  formatRouteDuration,
  getDistanceLabel,
  searchNearbyFallbackPlaces,
  searchFallbackPlaces,
} from "@/lib/osm";

describe("osm helpers", () => {
  it("builds a Nominatim search URL without API keys", () => {
    const url = new URL(buildNominatimSearchUrl("서울 카페"));

    expect(url.origin).toBe("https://nominatim.openstreetmap.org");
    expect(url.searchParams.get("q")).toBe("서울 카페");
    expect(url.searchParams.get("format")).toBe("jsonv2");
    expect(url.searchParams.get("limit")).toBe("10");
  });

  it("adapts Nominatim search results to the shared place model", () => {
    const place = adaptNominatimPlace({
      place_id: 123,
      osm_type: "node",
      osm_id: 456,
      display_name: "테스트 장소, 서울, 대한민국",
      name: "테스트 장소",
      class: "amenity",
      type: "cafe",
      lat: "37.5",
      lon: "127.1",
      address: {
        city: "서울",
        country: "대한민국",
      },
    });

    expect(place).toEqual({
      id: "node-456",
      name: "테스트 장소",
      category: "amenity / cafe",
      address: "서울, 대한민국",
      lat: 37.5,
      lng: 127.1,
    });
  });

  it("builds an OSRM route URL and formats route summaries", () => {
    const url = new URL(
      buildOsrmRouteUrl([
        { lat: 37.5, lng: 127.1 },
        { lat: 37.6, lng: 127.2 },
      ]),
    );

    expect(url.origin).toBe("https://router.project-osrm.org");
    expect(url.pathname).toContain("/route/v1/driving/127.1,37.5;127.2,37.6");
    expect(url.searchParams.get("geometries")).toBe("geojson");
    expect(formatRouteDistance(1520)).toBe("1.5 km");
    expect(formatRouteDuration(3720)).toBe("1시간 2분");
  });

  it("provides local fallback places and straight-line distance", () => {
    const places = searchFallbackPlaces("임실 여행지");
    const okjeongho = places.find((place) => place.name.includes("옥정호"))!;
    const distance = calculateDistanceMeters(places[0], okjeongho);

    expect(places.length).toBeGreaterThanOrEqual(2);
    expect(places[0].name).toContain("임실");
    expect(distance).toBeGreaterThan(1000);
    expect(searchFallbackPlaces("성수 브런치")[0]?.name).toContain("성수");
  });

  it("spreads generic food and cafe fallback results across the country", () => {
    const cafes = searchFallbackPlaces("전국 카페");
    const food = searchFallbackPlaces("전국 맛집");
    const cafeRegions = new Set(cafes.slice(0, 8).map((place) => place.address.split(" ")[0]));
    const foodRegions = new Set(food.slice(0, 8).map((place) => place.address.split(" ")[0]));

    expect(cafes.length).toBeGreaterThanOrEqual(8);
    expect(food.length).toBeGreaterThanOrEqual(8);
    expect(cafeRegions.size).toBeGreaterThanOrEqual(6);
    expect(foodRegions.size).toBeGreaterThanOrEqual(6);
    expect(cafes.slice(0, 6).some((place) => place.address.includes("임실"))).toBe(false);
  });

  it("finds nearby food and cafes around an anchor place", () => {
    const anchor = searchFallbackPlaces("임실치즈테마파크")[0];
    const food = searchNearbyFallbackPlaces(anchor, "food");
    const cafes = searchNearbyFallbackPlaces(anchor, "cafe");

    expect(food[0]?.category).toContain("food");
    expect(cafes[0]?.category).toContain("cafe");
    expect(getDistanceLabel(anchor, cafes[0])).toMatch(/m|km/);
  });
});
