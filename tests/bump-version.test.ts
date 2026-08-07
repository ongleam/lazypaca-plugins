import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  bumpManifestVersions,
  nextVersion,
  parseReleaseUnit,
} from "../scripts/bump-version";

describe("release version policy", () => {
  test("defaults to a patch release", () => {
    expect(parseReleaseUnit([])).toBe("patch");
    expect(parseReleaseUnit(["--patch"])).toBe("patch");
    expect(nextVersion("0.2.0", "patch")).toBe("0.2.1");
  });

  test("requires an explicit flag for minor or major releases", () => {
    expect(parseReleaseUnit(["--minor"])).toBe("minor");
    expect(parseReleaseUnit(["--major"])).toBe("major");
    expect(nextVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(nextVersion("1.2.3", "major")).toBe("2.0.0");
  });

  test("rejects unsupported release arguments", () => {
    expect(() => parseReleaseUnit(["minor"])).toThrow("Unsupported release argument");
    expect(() => parseReleaseUnit(["--patch", "--minor"])).toThrow(
      "Choose exactly one release unit",
    );
  });

  test("updates both plugin manifests together", () => {
    const root = mkdtempSync(join(tmpdir(), "lazypaca-version-"));
    const pluginRoot = join(root, "plugins", "lazypaca");
    const manifestPaths = [
      join(pluginRoot, ".claude-plugin", "plugin.json"),
      join(pluginRoot, ".codex-plugin", "plugin.json"),
    ];

    try {
      for (const path of manifestPaths) {
        mkdirSync(join(path, ".."), { recursive: true });
        writeFileSync(path, JSON.stringify({ name: "lazypaca", version: "0.2.0" }));
      }

      expect(bumpManifestVersions(root, "patch")).toBe("0.2.1");
      for (const path of manifestPaths) {
        expect(JSON.parse(readFileSync(path, "utf8")).version).toBe("0.2.1");
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
