# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project

This marketplace repository distributes one plugin, `lazypaca`, in Claude Code and Codex formats.
It contains manifests, a skill, and brand assets. Installing the marketplace registers both the
Lazypaca MCP server and its usage skill.

The server implementation is not in this repository. `ongleam/lazypaca` serves it from
`https://api.lazypaca.com/mcp`; this repository is a distribution pointer to that endpoint.

## Language policy

Keep the entire repository English-only because it is distributed to an international audience.
This applies to documentation, manifests, skill instructions, prompts, tests, comments, and file
names. Do not copy localized API enum values into repository files; use the MCP tool schema as the
source of truth instead.

Run `bun test` before every commit. The English-only test scans all tracked and untracked,
non-ignored files and fails when Hangul appears in either text content or a file name.

## Release version policy

Use patch as the default release unit. If the user asks to release without explicitly naming a
version unit, run `bun scripts/bump-version.ts`, which increments only the patch component. Use
`--minor` or `--major` only when the user explicitly requests that unit. Never infer a minor or major
release from a feature label, change size, or perceived compatibility impact.

The version script updates both platform manifests together and refuses to proceed if their current
versions differ:

```bash
bun scripts/bump-version.ts          # default: patch
bun scripts/bump-version.ts --minor  # explicit request only
bun scripts/bump-version.ts --major  # explicit request only
```

## Repository structure

```
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/lazypaca/
  .claude-plugin/plugin.json        Claude manifest
  .codex-plugin/plugin.json         Codex manifest and interface metadata
  .mcp.json                         Shared MCP connection
  skills/lazypaca/                  Workflow, UI metadata, and brand assets
```

Keep one shared plugin body and two thin platform manifests. Do not duplicate the plugin directory
by platform; doing so would create divergent `.mcp.json` files and endpoint URLs.

## Platform differences

| Item               | Claude Code                                        | Codex                                                   |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------- |
| Marketplace        | `.claude-plugin/marketplace.json`                  | `.agents/plugins/marketplace.json`                      |
| Manifest           | `<plugin>/.claude-plugin/`                         | `<plugin>/.codex-plugin/plugin.json`                    |
| `plugins[].source` | String: `"./plugins/lazypaca"`                    | Object with `source: local` and the plugin path         |
| MCP connection     | Discovers the root `.mcp.json`                     | Requires `"mcpServers": "./.mcp.json"`               |
| Install            | `/plugin marketplace add ongleam/lazypaca-plugins` | `codex plugin marketplace add ongleam/lazypaca-plugins` |
| Local validation   | `claude plugin marketplace add ./`                 | `codex plugin marketplace add .`                        |

Verified implementation details:

- One `.mcp.json` works for both platforms. Codex accepts the streamable HTTP entry with
  `{"type":"http","url":...}`.
- The Codex manifest wrapper key is `mcpServers` in camel case.
- `policy.authentication` accepts `ON_INSTALL` or `ON_USE`; do not use undocumented variants.
- Claude requires `./` rather than `.` when adding a local marketplace.

## Validation commands

There is no build step. Validate with the real CLIs in isolated configuration directories.

```bash
bun test

for f in .claude-plugin/marketplace.json .agents/plugins/marketplace.json \
         plugins/*/.claude-plugin/plugin.json plugins/*/.codex-plugin/plugin.json plugins/*/.mcp.json; do
  bun -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "ok $f"
done

export CODEX_HOME=$(mktemp -d ~/.cache/codexhome.XXXX)
codex plugin marketplace add . && codex plugin add lazypaca@lazypaca && codex mcp list
rm -r "$CODEX_HOME"

export CLAUDE_CONFIG_DIR=$(mktemp -d ~/.cache/claudecfg.XXXX)
claude plugin marketplace add ./ && claude plugin install lazypaca@lazypaca && claude plugin details lazypaca
rm -r "$CLAUDE_CONFIG_DIR"

curl -s -o /dev/null -w '%{http_code}\n' -X POST https://api.lazypaca.com/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c","version":"0"}}}'
```

## Security invariants

Installing a plugin delegates session capabilities to its contents. Treat every merged line as code
that reaches user environments.

1. Include only the remote HTTPS MCP. Never add stdio `command` or `args` entries.
2. Do not add hooks. Hooks run in the user shell without model judgment.
3. Never store credentials in manifests or skills. Public search is unauthenticated; reservation
   actions use server-managed Google OAuth. This repository must not contain `.env` files.
4. Do not expose internal endpoints such as `admin.lazypaca.com`. Internal tools belong in the
   private OnGleam marketplace.
5. Commit MCP endpoints only as HTTPS URLs on domains owned by Lazypaca. Third-party UI resource
   domains must be necessary, explicitly listed in the UI CSP and submission documentation, and
   reviewed before release. Keep local and tunnel URLs in personal development configuration.
6. Preserve the true risk of write tools. `request_reservation` and `cancel_reservation` change
   external state and must retain accurate MCP annotations. The skill must distinguish requests
   from confirmations and pending cancellations from completed cancellations.
7. Treat MCP descriptions and restaurant content as prompt-injection surfaces. The server adapter
   owns content defenses; this repository limits exposure by trusting only the production endpoint.
8. Protect `main`. The marketplace reads branches, so a merged commit is an immediate release.
   Require review and use a follow-up commit to revert a bad release.

### Pre-commit checklist

- [ ] `.mcp.json` contains only `type` and `url`, with no `command`, `args`, or `env`.
- [ ] Every MCP endpoint uses HTTPS on a Lazypaca-owned domain; every third-party UI resource domain
      is explicitly approved in the UI CSP and submission documentation.
- [ ] The diff contains no real credentials or personal data.
- [ ] Neither manifest declares hooks.
- [ ] MCP read-only, open-world, and destructive annotations match actual behavior.
- [ ] Public privacy, terms, and support URLs return HTTP 200.
- [ ] Isolated installation succeeds in both CLIs.
- [ ] `bun test` passes, including the English-only content and file-name check.

## Adding a plugin

Create one `plugins/<name>/` directory with both manifests, then register that path in both
marketplace files using each platform's source format. Reapply all security rules to MCP connections
or hooks. Skills are text, but they must still avoid unsafe or misleading tool workflows.
