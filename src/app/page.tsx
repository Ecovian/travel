import Link from "next/link";
import { RecentTripPanel } from "@/components/home/recent-trip-panel";
import { featuredDestinations, travelThemes } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="surface-card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="hero-badge">Travel MVP without auth</span>
            <div className="space-y-4">
              <h1 className="section-title max-w-3xl">
                로그인 없이 바로 열고, 탐색과 일정 작성이 한 화면에서 이어지는 여행 캔버스.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[rgba(23,49,60,0.72)] sm:text-lg">
                여행지를 검색하고, 날짜별 Day 플래너에 장소를 담고, 무료 지도와 경로로 동선을 확인하세요.
                복잡한 가입 절차 없이 같은 브라우저에서 계속 이어서 수정할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="primary-link" href="/planner">
                일정 만들기
              </Link>
              <Link className="secondary-link" href="/explore">
                여행지 탐색하기
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.46)]">
                  Storage
                </p>
                <p className="mt-3 text-lg font-semibold">브라우저 저장</p>
                <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">
                  로그인 없이 같은 기기에서 이어쓰기
                </p>
              </article>
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.46)]">
                  Workflow
                </p>
                <p className="mt-3 text-lg font-semibold">탐색 + 플래너 + 지도</p>
                <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">
                  검색 결과와 일정표를 나란히 조정
                </p>
              </article>
              <article className="mini-stat">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.46)]">
                  Routing
                </p>
                <p className="mt-3 text-lg font-semibold">Home / Explore / Planner</p>
                <p className="mt-2 text-sm text-[rgba(23,49,60,0.62)]">
                  가장 작은 MVP 흐름으로 시작
                </p>
              </article>
            </div>
          </div>

          <RecentTripPanel />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="hero-badge">Featured moods</p>
              <h2 className="mt-4 text-3xl">추천 여행 무드</h2>
            </div>
            <Link className="secondary-link" href="/explore">
              탐색 화면 열기
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {featuredDestinations.map((destination) => (
              <article
                key={destination.id}
                className={`overflow-hidden rounded-[26px] bg-gradient-to-br ${destination.accent} p-[1px]`}
              >
                <div className="h-full rounded-[25px] bg-[rgba(255,251,243,0.92)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.52)]">
                    curated route
                  </p>
                  <h3 className="mt-4 text-2xl">{destination.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[rgba(23,49,60,0.68)]">
                    {destination.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="hero-badge">Why this MVP</p>
          <h2 className="mt-4 text-3xl">첫 버전 핵심 포인트</h2>
          <div className="mt-6 space-y-4">
            {travelThemes.map((theme, index) => (
              <article key={theme.title} className="rounded-[24px] border border-[rgba(23,49,60,0.1)] bg-white/56 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,118,110,0.12)] text-sm font-semibold text-tide">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl">{theme.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[rgba(23,49,60,0.68)]">{theme.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
