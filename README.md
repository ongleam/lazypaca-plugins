# lazypaca plugins

<img src="./assets/banner.jpg" alt="Too lazy to go out, but still ready to hunt for the perfect food spot" width="420">

서울 음식점 검색과 예약 요청 MCP를 에이전트에 한 번에 붙이는 플러그인. Claude Code · Codex
두 형식으로 배포한다.

## 설치

**Claude Code**

```
/plugin marketplace add ongleam/lazypaca-plugins
/plugin install lazypaca@lazypaca
```

**Codex**

```
codex plugin marketplace add ongleam/lazypaca-plugins
codex plugin add lazypaca@lazypaca
```

설치하면 MCP 서버가 자동 등록된다 — 별도 `mcp add` 가 필요 없다.

| 도구                             | 하는 일                                  |
| -------------------------------- | ---------------------------------------- |
| `search_places`                  | 지역·음식 종류·업력 기반 음식점 검색    |
| `get_places_details`             | 음식점 상세 정보 배치 조회               |
| `render_place_map`               | 검색 결과를 지도 위젯으로 표시           |
| `check_reservation_availability` | 실시간 예약 가능 시간 확인               |
| `render_reservation_form`        | Google 로그인 기반 예약 폼 표시          |
| `request_reservation`            | 폼을 지원하지 않는 호스트에서 예약 요청  |
| `find_reservations`              | 연결된 계정의 활성 예약 조회             |
| `get_reservation_status`         | 사용자가 제공한 예약 번호의 상태 조회    |
| `cancel_reservation`             | 예약 취소 또는 취소 요청 접수            |

검색·상세·지도·예약 가능 시간은 로그인 없이 사용할 수 있다. 예약 요청·조회·취소는 Google
로그인이 필요하며, 요청과 취소는 외부 상태를 변경한다. 플러그인은 원격 HTTPS MCP만 연결하고
로컬 프로세스나 매니페스트 내 자격증명을 사용하지 않는다.

개인정보처리방침은 [Privacy](https://lazypaca.com/privacy), 이용약관은
[Terms](https://lazypaca.com/terms), 문의는 [Support](https://lazypaca.com/support)에서 확인한다.

## 플러그인 없이 붙일 때

```
claude mcp add --transport http lazypaca https://api.lazypaca.com/mcp
codex mcp add lazypaca --url https://api.lazypaca.com/mcp
```

ChatGPT 는 커넥터로 같은 URL 을 추가한다.

## 개발

형식 차이·검증 방법·보안 규칙은 [CLAUDE.md](./CLAUDE.md) 에 있다.
