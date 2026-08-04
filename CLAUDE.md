# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

**플러그인 하나(`lazypaca`)를 두 플랫폼 형식으로 배포하는 마켓플레이스 레포**다. 코드는
없고 매니페스트가 전부다 — 사용자가 마켓플레이스 하나만 추가하면 lazypaca MCP 가 자동
등록된다.

서버 구현은 여기 없다. 별도 레포(`ongleam/lazypaca`)의 `apps/api` 가
`https://api.lazypaca.com/mcp` 로 서비스하고, 이 레포는 **그 URL 을 가리키는 포인터**다.

## 레포 구조

```
.claude-plugin/marketplace.json     Claude Code 마켓플레이스
.agents/plugins/marketplace.json    Codex 마켓플레이스
plugins/lazypaca/
  .claude-plugin/plugin.json        Claude 매니페스트
  .codex-plugin/plugin.json         Codex 매니페스트 (interface 블록 필수적으로 유용)
  .mcp.json                         ★ 두 플랫폼이 공유하는 유일한 실체
```

**플러그인 본문은 하나고 매니페스트만 두 벌이다.** 두 플랫폼이 서로의 디렉토리를 무시하기
때문에 같은 `plugins/lazypaca/` 를 그대로 공유한다. 플러그인이 늘어도 이 규칙을 유지한다 —
플랫폼별로 디렉토리를 복제하면 `.mcp.json` 이 두 벌이 되고 URL 이 갈라진다.

## 두 형식의 차이 (실측 — 문서만 믿지 말 것)

| 항목               | Claude Code                                        | Codex                                                        |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| 마켓플레이스 위치  | `.claude-plugin/marketplace.json`                  | `.agents/plugins/marketplace.json`                           |
| 매니페스트 위치    | `<plugin>/.claude-plugin/`                         | `<plugin>/.codex-plugin/` (여기엔 plugin.json 만)            |
| `plugins[].source` | 문자열 `"./plugins/lazypaca"`                      | 객체 `{"source":"local","path":"./plugins/lazypaca"}`        |
| MCP 연결           | 루트 `.mcp.json` **자동 탐색**                     | `plugin.json` 의 `"mcpServers": "./.mcp.json"` **명시 필요** |
| 설치               | `/plugin marketplace add ongleam/lazypaca-plugins` | `codex plugin marketplace add ongleam/lazypaca-plugins`      |
| 로컬 검증          | `claude plugin marketplace add ./`                 | `codex plugin marketplace add .`                             |

**측정해서 알아낸 것들:**

- **`.mcp.json` 한 벌로 둘 다 된다.** Codex 는 문서에 HTTP 예시가 없고 config.toml 에는
  `type` 키가 없지만, 플러그인 `.mcp.json` 의 `{"type":"http","url":...}` 를 그대로 먹고
  streamable HTTP 로 등록한다 (`codex mcp list` 로 확인). 분기시키지 않는다.
- **래퍼 키는 `mcpServers` (camelCase).** OpenAI 문서 예시의 `mcp_servers` 는 오타고 Rust
  구현은 `#[serde(rename_all="camelCase")]` 라 안 먹는다 (openai/codex#22105).
- **`policy.authentication` 은 `ON_INSTALL` | `ON_USE` 뿐이다.** 문서에 도는 `ON_FIRST_USE`
  를 넣으면 Codex 가 마켓플레이스 파일 전체를 거부한다 — serde 가 unknown variant 에서
  하드 실패한다. 즉 **오타 하나가 전체 마켓플레이스를 못 쓰게 만든다.**
- `claude plugin marketplace add .` 는 거부된다. `./` 로 써야 한다.

## 커맨드

빌드도 테스트도 없다. 검증은 실제 CLI 로 하고, **격리된 홈에서** 돌려 개인 설정을 오염시키지
않는다.

```bash
# JSON 유효성
for f in .claude-plugin/marketplace.json .agents/plugins/marketplace.json \
         plugins/*/.claude-plugin/plugin.json plugins/*/.codex-plugin/plugin.json plugins/*/.mcp.json; do
  bun -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "ok $f"
done

# Codex 설치 검증 (격리 홈 — /tmp 는 경고를 뱉으니 ~/.cache 아래)
export CODEX_HOME=$(mktemp -d ~/.cache/codexhome.XXXX)
codex plugin marketplace add . && codex plugin add lazypaca@lazypaca && codex mcp list
rm -r "$CODEX_HOME"

# Claude 설치 검증
export CLAUDE_CONFIG_DIR=$(mktemp -d ~/.cache/claudecfg.XXXX)
claude plugin marketplace add ./ && claude plugin install lazypaca@lazypaca && claude plugin details lazypaca
rm -r "$CLAUDE_CONFIG_DIR"

# 엔드포인트 생존 (200 이어야 한다)
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://api.lazypaca.com/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c","version":"0"}}}'
```

## 보안 — 깨뜨리면 안 되는 것

**플러그인 설치는 사용자가 우리에게 세션 권한을 위임하는 행위다.** 이 레포에 머지되는 한
줄이 남의 머신에서 그대로 실행된다. 그래서 편의보다 표면 축소가 항상 우선한다.

1. **원격 `http` MCP 만 싣는다. stdio(`command`/`args`) 금지.**
   `{"command":"npx","args":["-y","..."]}` 형태는 설치 즉시 사용자 머신에서 프로세스를
   띄우고 레지스트리에서 코드를 끌어온다 — 임의 코드 실행 + 공급망 표면을 한 번에 얹는다.
   우리 서버는 이미 HTTP 로 뜬다. 로컬 프로세스를 요구할 이유가 없다.

2. **`hooks` 를 추가하지 않는다.** 훅은 사용자 셸에서 모델 판단 없이 무조건 실행된다.
   두 플랫폼 다 플러그인 훅을 지원하지만(`hooks/hooks.json`) 이 레포는 갖지 않는다.
   요구가 오면 스킬(모델이 읽고 판단하는 텍스트)로 낮춘다.

3. **자격증명을 매니페스트에 넣지 않는다.** `api.lazypaca.com/mcp` 는 무인증 공개
   read-only 라 애초에 넣을 토큰이 없다 — 이게 이 플러그인의 안전성 근거다. 인증이 필요한
   서버가 생기면 값이 아니라 `${ENV_VAR}`·`bearer_token_env_var`·OAuth 로만 붙인다.
   이 레포는 `.env` 를 갖지 않는다.

4. **내부 엔드포인트를 싣지 않는다.** `admin.lazypaca.com` 계열(Workspace OAuth 게이트)은
   공개 마켓플레이스에 올리지 않는다. 인증이 막아주더라도 내부 표면을 광고할 이유가 없다.
   내부 전용 도구는 사내 마켓플레이스(`ongleam/team-ongleam-plugins`)로 간다.

5. **`https` + 우리가 소유한 도메인만.** `http://`·IP·터널 URL(ngrok 등)은 커밋하지 않는다.
   로컬 디버깅은 개인 설정(`claude mcp add`·`codex mcp add`)으로 하고 레포에 남기지 않는다.

6. **쓰기 도구가 붙으면 이 문서부터 고친다.** 지금 계약은 "read-only 라서 사용자가 잃을 게
   없다" 이고, 이건 서버가 지키는 성질이지 플러그인이 지키는 성질이 아니다. `apps/api` 에
   변경 도구가 생기는 순간 이 플러그인의 위험 등급이 바뀐다 — 그때는 별도 플러그인으로
   분리해서 사용자가 read-only 만 설치할 수 있게 둔다.

7. **MCP 도구 설명·응답은 프롬프트 인젝션 표면이다.** 크롤한 음식점 리뷰·설명이 그대로
   모델 컨텍스트에 들어간다. 방어는 서버(`apps/api` 어댑터)의 책임이고 플러그인에서는
   막을 수 없다 — 여기서 할 수 있는 유일한 통제는 **신뢰하는 서버 URL 만 싣는 것**이다.

8. **main 브랜치 보호.** 리뷰 없는 push 금지. 마켓플레이스는 태그가 아니라 브랜치를 읽으므로
   **커밋 = 즉시 배포**다. 되돌림도 커밋 하나 — 그만큼 잘못 나가는 것도 커밋 하나다.

### 커밋 전 체크

- [ ] `.mcp.json` 에 `command`/`args`/`env` 가 없다 (`type`·`url` 만)
- [ ] URL 이 `https://` + `*.lazypaca.com`
- [ ] 토큰·키·PII 문자열 0 (`git diff | grep -iE 'token|secret|key|password'`)
- [ ] 두 매니페스트 어디에도 `hooks` 없음
- [ ] 두 CLI 로 격리 설치가 실제로 성공 (위 커맨드)

## 플러그인을 추가할 때

`plugins/<name>/` 하나를 만들고 **두 매니페스트를 같이** 넣는다 — 한쪽만 넣으면 그 플랫폼
사용자에게는 조용히 없는 플러그인이 된다. 그다음 두 마켓플레이스 파일의 `plugins[]` 에
각각의 `source` 형식으로 등록한다(문자열 vs 객체).

스킬·커맨드(`skills/`)는 텍스트라 안전하지만, `.mcp.json` 과 `hooks` 는 위 보안 규칙을 다시
통과해야 한다.
