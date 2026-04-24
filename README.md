# Roam Canvas

로그인 없이 바로 시작하는 여행 일정 웹앱 MVP입니다. `Next.js App Router + TypeScript + Tailwind CSS`로 구성했고, 일정은 브라우저 `localStorage`에 저장됩니다.

## 주요 기능

- `/` : 앱 소개, 추천 여행 무드, 최근 작업한 여행 이어가기
- `/explore` : OpenStreetMap 기반 장소 검색과 지도 탐색
- `/planner` : 여행 목록 확인, 새 여행 생성
- `/planner/[tripId]` : 날짜별 일정 작성, 장소 추가/삭제, 메모, 순서 조정, OSRM 경로 확인
- `/share/[shareId]` : 공유 링크를 가진 사람이 같은 여행을 조회/수정

## 실행 방법

1. 의존성을 설치합니다.
   - `npm.cmd install`
2. 개발 서버를 실행합니다.
   - `npm.cmd run dev`

## 스크립트

- `npm.cmd run dev`
- `npm.cmd run build`
- `npm.cmd run typecheck`
- `npm.cmd run test`

## 비고

- 로그인, 로그아웃, 회원가입, 백엔드 저장은 포함하지 않았습니다.
- 지도 타일은 OpenStreetMap, 장소 검색은 Nominatim, 경로 계산은 OSRM 공개 API를 사용합니다.
- API 키는 필요하지 않습니다.
- 외부 지도/검색/경로 API가 연결되지 않는 환경에서도 기본 장소 데이터와 오프라인 핀 지도로 위치와 직선 거리를 확인할 수 있습니다.
- 공유 링크는 로컬 개발에서는 `.data/shared-trips.json`에 저장되고, Vercel 배포 환경에서는 Upstash Redis REST 환경변수(`KV_REST_API_URL`, `KV_REST_API_TOKEN` 또는 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)가 필요합니다.
- Vercel에서 다른 사람이 공유 링크를 함께 수정하려면 Vercel Marketplace에서 Upstash Redis를 프로젝트에 연결한 뒤 다시 배포해야 합니다.
- 공개 API는 프로덕션 대량 트래픽용 인프라가 아니므로 서비스 규모가 커지면 자체 Nominatim/OSRM 서버나 전용 제공자를 붙이는 구조로 확장하는 편이 좋습니다.
- 같은 브라우저 기준으로 최근 여행과 저장된 일정이 유지됩니다.
