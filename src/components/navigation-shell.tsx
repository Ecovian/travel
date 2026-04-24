"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "홈" },
  { href: "/explore", label: "탐색" },
  { href: "/planner", label: "일정관리" },
];

export function NavigationShell() {
  const pathname = usePathname();

  return (
    <header className="surface-card sticky top-4 z-20 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-semibold text-white">
              RC
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(23,49,60,0.48)]">
                travel planner
              </p>
              <p className="text-lg font-semibold">Roam Canvas</p>
            </div>
          </Link>
          <span className="hidden rounded-full border border-[rgba(23,49,60,0.12)] bg-white/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(23,49,60,0.5)] lg:inline-flex">
            no login required
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
          <Link className="primary-link ml-auto lg:ml-2" href="/planner">
            여행 만들기
          </Link>
        </div>
      </div>
    </header>
  );
}
