import type { NearbyCategory, PlaceSummary, RouteSummary } from "@/lib/types";

type NominatimSearchResult = {
  place_id: number;
  osm_type?: string;
  osm_id?: number;
  display_name: string;
  name?: string;
  class?: string;
  type?: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

type OsrmRouteResponse = {
  code: string;
  message?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: Array<[number, number]>;
      type: "LineString";
    };
  }>;
};

type Coordinate = {
  lat: number;
  lng: number;
};

export const DEFAULT_MAP_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";

const FALLBACK_PLACES: PlaceSummary[] = [
  {
    id: "fallback-imsil-cheese-theme-park",
    name: "임실치즈테마파크",
    category: "tourism / attraction",
    address: "전북 임실군 성수면 도인리",
    lat: 35.6177,
    lng: 127.2852,
  },
  {
    id: "fallback-imsil-cheese-village-restaurant",
    name: "치즈마을 로컬식당",
    category: "amenity / restaurant / food",
    address: "전북 임실군 임실읍 치즈마을 인근",
    lat: 35.6192,
    lng: 127.2826,
  },
  {
    id: "fallback-imsil-cheese-cafe",
    name: "치즈테마파크 카페",
    category: "amenity / cafe / dessert",
    address: "전북 임실군 성수면 도인리",
    lat: 35.6167,
    lng: 127.2871,
  },
  {
    id: "fallback-imsil-okjeongho",
    name: "옥정호 붕어섬",
    category: "tourism / viewpoint",
    address: "전북 임실군 운암면 입석리",
    lat: 35.5458,
    lng: 127.1544,
  },
  {
    id: "fallback-imsil-okjeongho-cafe",
    name: "옥정호 물안개 카페",
    category: "amenity / cafe / viewpoint",
    address: "전북 임실군 운암면 옥정호 인근",
    lat: 35.5492,
    lng: 127.1576,
  },
  {
    id: "fallback-imsil-okjeongho-restaurant",
    name: "운암 매운탕 식당",
    category: "amenity / restaurant / food",
    address: "전북 임실군 운암면",
    lat: 35.5419,
    lng: 127.1591,
  },
  {
    id: "fallback-imsil-saseondae",
    name: "사선대관광지",
    category: "tourism / park",
    address: "전북 임실군 관촌면 사선리",
    lat: 35.6759,
    lng: 127.2707,
  },
  {
    id: "fallback-imsil-saseondae-cafe",
    name: "사선대 강변카페",
    category: "amenity / cafe / bakery",
    address: "전북 임실군 관촌면 사선리",
    lat: 35.6737,
    lng: 127.2689,
  },
  {
    id: "fallback-seongsu-cafe-street",
    name: "성수 카페거리",
    category: "amenity / cafe",
    address: "서울 성동구 성수동2가",
    lat: 37.5446,
    lng: 127.0557,
  },
  {
    id: "fallback-seongsu-brunch",
    name: "성수 브런치 키친",
    category: "amenity / restaurant / brunch / food",
    address: "서울 성동구 성수동2가",
    lat: 37.5431,
    lng: 127.0569,
  },
  {
    id: "fallback-seongsu-roastery",
    name: "성수 로스터리 카페",
    category: "amenity / cafe / coffee",
    address: "서울 성동구 연무장길",
    lat: 37.5422,
    lng: 127.0541,
  },
  {
    id: "fallback-seoul-forest",
    name: "서울숲",
    category: "leisure / park",
    address: "서울 성동구 뚝섬로 273",
    lat: 37.5444,
    lng: 127.0374,
  },
  {
    id: "fallback-seoul-forest-dessert",
    name: "서울숲 디저트 카페",
    category: "amenity / cafe / dessert",
    address: "서울 성동구 서울숲 인근",
    lat: 37.5458,
    lng: 127.0413,
  },
  {
    id: "fallback-jeju-seongsan",
    name: "성산일출봉",
    category: "natural / peak",
    address: "제주 서귀포시 성산읍",
    lat: 33.4581,
    lng: 126.9425,
  },
  {
    id: "fallback-jeju-seongsan-seafood",
    name: "성산 해녀밥상",
    category: "amenity / restaurant / seafood / food",
    address: "제주 서귀포시 성산읍",
    lat: 33.4626,
    lng: 126.9367,
  },
  {
    id: "fallback-jeju-seongsan-cafe",
    name: "성산 오션뷰 카페",
    category: "amenity / cafe / view",
    address: "제주 서귀포시 성산읍 해안도로",
    lat: 33.4599,
    lng: 126.9349,
  },
  {
    id: "fallback-busan-haeundae",
    name: "해운대해수욕장",
    category: "natural / beach",
    address: "부산 해운대구 우동",
    lat: 35.1587,
    lng: 129.1604,
  },
  {
    id: "fallback-busan-haeundae-milguksu",
    name: "해운대 밀면집",
    category: "amenity / restaurant / food",
    address: "부산 해운대구 우동",
    lat: 35.1612,
    lng: 129.1621,
  },
  {
    id: "fallback-busan-haeundae-cafe",
    name: "해운대 바다뷰 카페",
    category: "amenity / cafe / view",
    address: "부산 해운대구 해운대해변로",
    lat: 35.1574,
    lng: 129.1635,
  },
  {
    id: "fallback-osaka-castle",
    name: "오사카성",
    category: "historic / castle",
    address: "Osaka, Chuo Ward, Osakajo",
    lat: 34.6873,
    lng: 135.5262,
  },
  {
    id: "fallback-osaka-ramen",
    name: "오사카성 라멘 골목",
    category: "amenity / restaurant / ramen / food",
    address: "Osaka, Chuo Ward",
    lat: 34.6857,
    lng: 135.5206,
  },
  {
    id: "fallback-osaka-castle-cafe",
    name: "오사카성 공원 카페",
    category: "amenity / cafe / dessert",
    address: "Osaka Castle Park",
    lat: 34.6891,
    lng: 135.5292,
  },
  {
    id: "fallback-hongdae-yeonnam-food",
    name: "연남동 맛집골목",
    category: "amenity / restaurant / food",
    address: "서울 마포구 연남동",
    lat: 37.5625,
    lng: 126.9232,
  },
  {
    id: "fallback-hongdae-dessert-cafe",
    name: "연남동 디저트 카페",
    category: "amenity / cafe / dessert",
    address: "서울 마포구 연남동",
    lat: 37.5614,
    lng: 126.9248,
  },
  {
    id: "fallback-ikseon-teahouse",
    name: "익선동 한옥 찻집",
    category: "amenity / cafe / tea / dessert",
    address: "서울 종로구 익선동",
    lat: 37.5742,
    lng: 126.9897,
  },
  {
    id: "fallback-myeongdong-street-food",
    name: "명동 길거리 먹거리",
    category: "amenity / food / street_food",
    address: "서울 중구 명동",
    lat: 37.5637,
    lng: 126.985,
  },
  {
    id: "fallback-busan-gwangalli-seafood",
    name: "광안리 회센터",
    category: "amenity / restaurant / seafood / food",
    address: "부산 수영구 민락동",
    lat: 35.1532,
    lng: 129.1249,
  },
  {
    id: "fallback-busan-jeonpo-cafe",
    name: "전포 카페거리",
    category: "amenity / cafe / coffee",
    address: "부산 부산진구 전포동",
    lat: 35.1584,
    lng: 129.0632,
  },
  {
    id: "fallback-busan-pork-soup",
    name: "부산역 돼지국밥",
    category: "amenity / restaurant / food",
    address: "부산 동구 초량동",
    lat: 35.1168,
    lng: 129.041,
  },
  {
    id: "fallback-jeju-aewol-cafe",
    name: "애월 해안 카페",
    category: "amenity / cafe / view",
    address: "제주 제주시 애월읍",
    lat: 33.4631,
    lng: 126.3097,
  },
  {
    id: "fallback-jeju-dongmun-market-food",
    name: "제주 동문시장 먹거리",
    category: "amenity / food / market",
    address: "제주 제주시 일도일동",
    lat: 33.5123,
    lng: 126.5267,
  },
  {
    id: "fallback-jeju-black-pork",
    name: "서귀포 흑돼지거리",
    category: "amenity / restaurant / food",
    address: "제주 서귀포시 서귀동",
    lat: 33.2473,
    lng: 126.5612,
  },
  {
    id: "fallback-gangneung-tofu-village",
    name: "강릉 초당순두부마을",
    category: "amenity / restaurant / food",
    address: "강원 강릉시 초당동",
    lat: 37.7911,
    lng: 128.9147,
  },
  {
    id: "fallback-gangneung-anmok-coffee",
    name: "안목해변 커피거리",
    category: "amenity / cafe / coffee",
    address: "강원 강릉시 창해로",
    lat: 37.7711,
    lng: 128.9475,
  },
  {
    id: "fallback-sokcho-market-food",
    name: "속초 중앙시장 먹거리",
    category: "amenity / food / market",
    address: "강원 속초시 중앙동",
    lat: 38.2043,
    lng: 128.5917,
  },
  {
    id: "fallback-sokcho-lake-cafe",
    name: "영랑호 호수 카페",
    category: "amenity / cafe / view",
    address: "강원 속초시 영랑동",
    lat: 38.2216,
    lng: 128.5821,
  },
  {
    id: "fallback-gyeongju-hwangridan-food",
    name: "황리단길 한식당",
    category: "amenity / restaurant / food",
    address: "경북 경주시 황남동",
    lat: 35.8359,
    lng: 129.2112,
  },
  {
    id: "fallback-gyeongju-hwangridan-cafe",
    name: "황리단길 한옥 카페",
    category: "amenity / cafe / dessert",
    address: "경북 경주시 황남동",
    lat: 35.8351,
    lng: 129.2104,
  },
  {
    id: "fallback-daegu-dongseongro-food",
    name: "동성로 납작만두 골목",
    category: "amenity / restaurant / food",
    address: "대구 중구 동성로",
    lat: 35.8693,
    lng: 128.5958,
  },
  {
    id: "fallback-daegu-kimkwangseok-cafe",
    name: "김광석거리 로스터리 카페",
    category: "amenity / cafe / coffee",
    address: "대구 중구 대봉동",
    lat: 35.8593,
    lng: 128.6065,
  },
  {
    id: "fallback-jeonju-bibimbap",
    name: "전주 한옥마을 비빔밥",
    category: "amenity / restaurant / food",
    address: "전북 전주시 완산구 풍남동",
    lat: 35.8151,
    lng: 127.153,
  },
  {
    id: "fallback-jeonju-traditional-cafe",
    name: "전주 한옥마을 전통찻집",
    category: "amenity / cafe / tea / dessert",
    address: "전북 전주시 완산구 교동",
    lat: 35.8142,
    lng: 127.1538,
  },
  {
    id: "fallback-yeosu-pocha-food",
    name: "여수 낭만포차 거리",
    category: "amenity / restaurant / food / seafood",
    address: "전남 여수시 종화동",
    lat: 34.7407,
    lng: 127.7448,
  },
  {
    id: "fallback-yeosu-ocean-cafe",
    name: "돌산 오션뷰 카페",
    category: "amenity / cafe / view",
    address: "전남 여수시 돌산읍",
    lat: 34.7297,
    lng: 127.7484,
  },
  {
    id: "fallback-gwangju-dongmyeong-food",
    name: "동명동 브런치 식당",
    category: "amenity / restaurant / brunch / food",
    address: "광주 동구 동명동",
    lat: 35.1518,
    lng: 126.9233,
  },
  {
    id: "fallback-gwangju-dongmyeong-cafe",
    name: "동명동 카페거리",
    category: "amenity / cafe / dessert",
    address: "광주 동구 동명동",
    lat: 35.1527,
    lng: 126.9244,
  },
  {
    id: "fallback-daejeon-sungsimdang",
    name: "대전 성심당 베이커리",
    category: "amenity / cafe / bakery / food",
    address: "대전 중구 은행동",
    lat: 36.3276,
    lng: 127.4273,
  },
  {
    id: "fallback-daejeon-yuseong-noodles",
    name: "유성 칼국수 거리",
    category: "amenity / restaurant / food",
    address: "대전 유성구 봉명동",
    lat: 36.3536,
    lng: 127.3435,
  },
  {
    id: "fallback-incheon-chinatown-food",
    name: "인천 차이나타운 짜장면거리",
    category: "amenity / restaurant / food",
    address: "인천 중구 북성동",
    lat: 37.4752,
    lng: 126.6189,
  },
  {
    id: "fallback-incheon-songdo-cafe",
    name: "송도 센트럴파크 카페",
    category: "amenity / cafe / view",
    address: "인천 연수구 송도동",
    lat: 37.3927,
    lng: 126.6387,
  },
  {
    id: "fallback-suwon-haenggung-food",
    name: "행궁동 맛집거리",
    category: "amenity / restaurant / food",
    address: "경기 수원시 팔달구 행궁동",
    lat: 37.2827,
    lng: 127.0148,
  },
  {
    id: "fallback-suwon-haenggung-cafe",
    name: "행궁동 한옥 카페",
    category: "amenity / cafe / dessert",
    address: "경기 수원시 팔달구 행궁동",
    lat: 37.2834,
    lng: 127.0157,
  },
  {
    id: "fallback-cheongju-suamgol-cafe",
    name: "수암골 전망 카페",
    category: "amenity / cafe / view",
    address: "충북 청주시 상당구 수동",
    lat: 36.6469,
    lng: 127.4965,
  },
  {
    id: "fallback-danyang-market-food",
    name: "단양 구경시장 마늘떡갈비",
    category: "amenity / restaurant / food / market",
    address: "충북 단양군 단양읍",
    lat: 36.9848,
    lng: 128.3652,
  },
  {
    id: "fallback-chuncheon-dakgalbi",
    name: "춘천 닭갈비 골목",
    category: "amenity / restaurant / food",
    address: "강원 춘천시 조양동",
    lat: 37.8798,
    lng: 127.7272,
  },
  {
    id: "fallback-tongyeong-chungmu-food",
    name: "통영 중앙시장 충무김밥",
    category: "amenity / restaurant / food / market",
    address: "경남 통영시 중앙동",
    lat: 34.8462,
    lng: 128.4241,
  },
  {
    id: "fallback-tongyeong-dongpirang-cafe",
    name: "동피랑 전망 카페",
    category: "amenity / cafe / view",
    address: "경남 통영시 동호동",
    lat: 34.8453,
    lng: 128.4269,
  },
];

const CATEGORY_KEYWORDS: Record<NearbyCategory, string[]> = {
  food: ["food", "restaurant", "맛집", "먹거리", "음식", "밥집", "식당", "라멘", "브런치", "seafood", "market"],
  cafe: ["cafe", "coffee", "dessert", "bakery", "카페", "커피", "디저트", "베이커리", "찻집", "뷰카페"],
};

const GENERIC_CATEGORY_TOKENS: Record<NearbyCategory, string[]> = {
  food: ["food", "restaurant", "맛집", "먹거리", "음식", "밥집", "식당", "레스토랑", "브런치", "라멘"],
  cafe: ["cafe", "coffee", "카페", "커피", "디저트", "베이커리", "빵집", "찻집", "뷰카페"],
};

const GENERIC_SEARCH_FILLER_TOKENS = [
  "전국",
  "전국단위",
  "근처",
  "주변",
  "추천",
  "장소",
  "여행",
  "갈만한곳",
  "가볼만한곳",
  "찾아줘",
  "보여줘",
  "등",
];

const REGION_SPREAD_ORDER = [
  "서울",
  "부산",
  "제주",
  "강원",
  "경북",
  "전남",
  "광주",
  "대구",
  "대전",
  "인천",
  "경기",
  "충북",
  "충남",
  "경남",
  "전북",
  "Osaka",
];

const GENERIC_SEARCH_LIMIT = 18;

function compactAddress(result: NominatimSearchResult) {
  const parts = [
    result.address?.road,
    result.address?.suburb,
    result.address?.city ?? result.address?.county,
    result.address?.state,
    result.address?.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : result.display_name;
}

function getStablePlaceId(result: NominatimSearchResult) {
  if (result.osm_type && result.osm_id) {
    return `${result.osm_type}-${result.osm_id}`;
  }

  return `nominatim-${result.place_id}`;
}

function getPlaceName(result: NominatimSearchResult) {
  if (result.name) {
    return result.name;
  }

  return result.display_name.split(",")[0] || "이름 없는 장소";
}

function dedupeConsecutiveCoordinates(coordinates: Coordinate[]) {
  return coordinates.filter((coordinate, index) => {
    const previous = coordinates[index - 1];

    return !previous || previous.lat !== coordinate.lat || previous.lng !== coordinate.lng;
  });
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function placeMatchesCategory(place: PlaceSummary, category: NearbyCategory) {
  const target = normalizeSearchText(`${place.name} ${place.category} ${place.address}`);

  return CATEGORY_KEYWORDS[category].some((keyword) => target.includes(normalizeSearchText(keyword)));
}

function inferGenericCategorySearch(normalizedKeyword: string): NearbyCategory | undefined {
  const categories = (Object.keys(GENERIC_CATEGORY_TOKENS) as NearbyCategory[]).filter((category) =>
    GENERIC_CATEGORY_TOKENS[category].some((token) => normalizedKeyword.includes(normalizeSearchText(token))),
  );

  if (categories.length !== 1) {
    return undefined;
  }

  const [category] = categories;
  const remaining = [...GENERIC_CATEGORY_TOKENS[category], ...GENERIC_SEARCH_FILLER_TOKENS].reduce(
    (text, token) => text.split(normalizeSearchText(token)).join(""),
    normalizedKeyword,
  );

  return remaining.length <= 1 ? category : undefined;
}

function getRegionRank(place: PlaceSummary) {
  const target = `${place.address} ${place.name}`;
  const rank = REGION_SPREAD_ORDER.findIndex((region) => target.includes(region));

  return rank === -1 ? REGION_SPREAD_ORDER.length : rank;
}

function spreadPlacesByRegion(places: PlaceSummary[]) {
  const buckets = new Map<number, PlaceSummary[]>();

  [...places]
    .sort((first, second) => getRegionRank(first) - getRegionRank(second) || first.name.localeCompare(second.name, "ko"))
    .forEach((place) => {
      const rank = getRegionRank(place);
      const bucket = buckets.get(rank) ?? [];

      bucket.push(place);
      buckets.set(rank, bucket);
    });

  const ranks = [...buckets.keys()].sort((first, second) => first - second);
  const spread: PlaceSummary[] = [];
  let pickedInRound = 0;

  do {
    pickedInRound = 0;

    ranks.forEach((rank) => {
      const bucket = buckets.get(rank);
      const place = bucket?.shift();

      if (place) {
        spread.push(place);
        pickedInRound += 1;
      }
    });
  } while (pickedInRound > 0);

  return spread;
}

function dedupePlaces(places: PlaceSummary[]) {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name}-${place.lat.toFixed(4)}-${place.lng.toFixed(4)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function searchFallbackPlaces(keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);
  const tokens = keyword
    .toLowerCase()
    .split(/\s+/)
    .map((token) => normalizeSearchText(token.replace(/여행지|맛집|브런치/g, "")))
    .filter((token) => token.length >= 2);

  if (!normalizedKeyword) {
    return [];
  }

  const genericCategory = inferGenericCategorySearch(normalizedKeyword);

  if (genericCategory) {
    return spreadPlacesByRegion(FALLBACK_PLACES.filter((place) => placeMatchesCategory(place, genericCategory))).slice(
      0,
      GENERIC_SEARCH_LIMIT,
    );
  }

  return FALLBACK_PLACES.map((place) => {
    const name = normalizeSearchText(place.name);
    const target = normalizeSearchText(`${place.name} ${place.address} ${place.category}`);
    const score =
      (name.includes(normalizedKeyword) ? 100 : 0) +
      tokens.filter((token) => name.includes(token)).length * 60 +
      (target.includes(normalizedKeyword) ? 30 : 0) +
      tokens.filter((token) => target.includes(token)).length * 10 +
      (normalizedKeyword.includes("브런치") && target.includes("cafe") ? 20 : 0);

    return {
      place,
      score,
    };
  })
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((result) => result.place);
}

export function searchNearbyFallbackPlaces(
  anchor: Pick<PlaceSummary, "id" | "lat" | "lng">,
  category: NearbyCategory,
) {
  return FALLBACK_PLACES.filter((place) => place.id !== anchor.id && placeMatchesCategory(place, category))
    .map((place) => ({
      place,
      distanceMeters: calculateDistanceMeters(anchor, place),
    }))
    .filter((result) => result.distanceMeters <= 30000)
    .sort((first, second) => first.distanceMeters - second.distanceMeters)
    .map((result) => result.place);
}

export function buildNearbySearchKeyword(
  anchor: Pick<PlaceSummary, "name" | "address">,
  category: NearbyCategory,
) {
  const areaHint = anchor.address.split(/[,\s]+/).slice(0, 3).join(" ");
  const label = category === "food" ? "맛집 식당" : "카페 디저트";

  return `${areaHint || anchor.name} ${label}`;
}

export function buildNominatimSearchUrl(keyword: string) {
  const params = new URLSearchParams({
    q: keyword,
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    limit: "10",
    "accept-language": "ko,en",
  });

  return `${NOMINATIM_SEARCH_URL}?${params.toString()}`;
}

export function adaptNominatimPlace(result: NominatimSearchResult): PlaceSummary {
  return {
    id: getStablePlaceId(result),
    name: getPlaceName(result),
    category: [result.class, result.type].filter(Boolean).join(" / ") || "place",
    address: compactAddress(result),
    lat: Number(result.lat),
    lng: Number(result.lon),
  };
}

export async function searchPlacesByKeyword(keyword: string) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return [];
  }

  const fallbackPlaces = searchFallbackPlaces(trimmedKeyword);
  const genericCategory = inferGenericCategorySearch(normalizeSearchText(trimmedKeyword));

  try {
    const response = await fetch(buildNominatimSearchUrl(trimmedKeyword), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "ko,en",
      },
    });

    if (!response.ok) {
      return fallbackPlaces;
    }

    const results = (await response.json()) as NominatimSearchResult[];
    const onlinePlaces = results
      .map(adaptNominatimPlace)
      .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));

    if (!onlinePlaces.length) {
      return fallbackPlaces;
    }

    return genericCategory ? dedupePlaces([...fallbackPlaces, ...onlinePlaces]) : onlinePlaces;
  } catch {
    return fallbackPlaces;
  }
}

export async function searchNearbyPlaces(
  anchor: Pick<PlaceSummary, "id" | "name" | "address" | "lat" | "lng">,
  category: NearbyCategory,
) {
  const fallbackPlaces = searchNearbyFallbackPlaces(anchor, category);

  try {
    const response = await fetch(buildNominatimSearchUrl(buildNearbySearchKeyword(anchor, category)), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "ko,en",
      },
    });

    if (!response.ok) {
      return fallbackPlaces;
    }

    const results = (await response.json()) as NominatimSearchResult[];
    const onlinePlaces = results
      .map(adaptNominatimPlace)
      .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
      .filter((place) => placeMatchesCategory(place, category))
      .map((place) => ({
        place,
        distanceMeters: calculateDistanceMeters(anchor, place),
      }))
      .filter((result) => result.distanceMeters <= 30000)
      .sort((first, second) => first.distanceMeters - second.distanceMeters)
      .map((result) => result.place);

    return dedupePlaces([...onlinePlaces, ...fallbackPlaces]);
  } catch {
    return fallbackPlaces;
  }
}

export function buildOsrmRouteUrl(coordinates: Coordinate[]) {
  const coordinateText = dedupeConsecutiveCoordinates(coordinates)
    .map((coordinate) => `${coordinate.lng},${coordinate.lat}`)
    .join(";");

  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
  });

  return `${OSRM_ROUTE_URL}/${coordinateText}?${params.toString()}`;
}

export async function calculateRoute(coordinates: Coordinate[]): Promise<RouteSummary | undefined> {
  const routeCoordinates = dedupeConsecutiveCoordinates(coordinates);

  if (routeCoordinates.length < 2) {
    return undefined;
  }

  try {
    const response = await fetch(buildOsrmRouteUrl(routeCoordinates), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return buildStraightLineRoute(routeCoordinates);
    }

    const payload = (await response.json()) as OsrmRouteResponse;
    const route = payload.routes?.[0];

    if (payload.code !== "Ok" || !route) {
      return buildStraightLineRoute(routeCoordinates);
    }

    return {
      coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch {
    return buildStraightLineRoute(routeCoordinates);
  }
}

export function calculateDistanceMeters(from: Coordinate, to: Coordinate) {
  const earthRadiusMeters = 6371000;
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getDistanceLabel(from: Coordinate, to: Coordinate) {
  return formatRouteDistance(calculateDistanceMeters(from, to));
}

function buildStraightLineRoute(coordinates: Coordinate[]): RouteSummary {
  const distanceMeters = coordinates.reduce((total, coordinate, index) => {
    const previous = coordinates[index - 1];

    return previous ? total + calculateDistanceMeters(previous, coordinate) : total;
  }, 0);

  return {
    coordinates,
    distanceMeters,
    durationSeconds: Math.round(distanceMeters / 11.1),
  };
}

export function formatRouteDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function formatRouteDuration(durationSeconds: number) {
  const minutes = Math.round(durationSeconds / 60);

  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
}
