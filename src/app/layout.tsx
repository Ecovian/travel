import type { Metadata } from "next";
import { NavigationShell } from "@/components/navigation-shell";
import "leaflet/dist/leaflet.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Roam Canvas",
  description: "로그인 없이 바로 시작하는 여행 일정 설계 웹앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <NavigationShell />
          <main className="relative z-10 mt-6 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
