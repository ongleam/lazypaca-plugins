# AGENTS.md

## Language policy

Keep every repository file and file name in English. This repository targets an international
audience, so do not add Hangul to documentation, manifests, skills, prompts, tests, comments, sample
data, or paths.

When an MCP tool requires localized enum values, rely on the tool schema at runtime instead of
copying those values into this repository.

## Required validation

Run this command before committing:

```bash
bun test
```

The English-only test scans tracked and untracked, non-ignored files. It must fail when Hangul is
present in either text content or a file name. Do not disable, bypass, or weaken this check.

Follow the security, platform compatibility, and release rules in [CLAUDE.md](./CLAUDE.md).
