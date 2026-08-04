# lazypaca plugins

<img src="./assets/banner.jpg" alt="Too lazy to go out, but still ready to hunt for the perfect food spot" width="420">

한국 음식점 검색 MCP 를 에이전트에 한 번에 붙이는 플러그인. Claude Code · Codex 두 형식으로
배포한다.

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

| 도구               | 하는 일                   |
| ------------------ | ------------------------- |
| `search_places`    | 조건 기반 음식점 검색     |
| `get_places`       | id 배치 상세 조회         |
| `render_place_map` | 결과를 지도 위젯으로 렌더 |

무인증 공개 read-only 다. 자격증명·토큰을 요구하지 않고, 쓰기 도구가 없고, 로컬에서 실행되는
프로세스가 없다 (원격 HTTP MCP).

## 플러그인 없이 붙일 때

```
claude mcp add --transport http lazypaca https://api.lazypaca.com/mcp
codex mcp add lazypaca --url https://api.lazypaca.com/mcp
```

ChatGPT 는 커넥터로 같은 URL 을 추가한다.

## 개발

형식 차이·검증 방법·보안 규칙은 [CLAUDE.md](./CLAUDE.md) 에 있다.
