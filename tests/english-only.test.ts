import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { containsHangul, scanRepository } from "../scripts/check-english-only";

describe("English-only repository policy", () => {
  test("detects Hangul in content or file names", () => {
    const hangulSyllable = String.fromCodePoint(0xac00);

    expect(containsHangul(`English ${hangulSyllable}`)).toBe(true);
    expect(containsHangul(`docs/${hangulSyllable}.md`)).toBe(true);
    expect(containsHangul("English only")).toBe(false);
  });

  test("keeps repository contents and file names free of Hangul", () => {
    expect(scanRepository(import.meta.dir + "/..")).toEqual([]);
  });

  test("reports content and file-name violations while ignoring binary data", () => {
    const root = mkdtempSync(join(tmpdir(), "lazypaca-english-only-"));
    const hangulSyllable = String.fromCodePoint(0xac00);

    try {
      execFileSync("git", ["init", "--quiet"], { cwd: root });
      writeFileSync(join(root, "content.md"), `English\n${hangulSyllable}\n`);
      writeFileSync(join(root, `${hangulSyllable}.md`), "English only\n");
      writeFileSync(
        join(root, "binary.bin"),
        Buffer.concat([Buffer.from([0]), Buffer.from(hangulSyllable)]),
      );

      const violations = scanRepository(root);

      expect(violations).toContain(`content.md:2`);
      expect(violations).toContain(`${hangulSyllable}.md (file name)`);
      expect(violations.some((violation) => violation.startsWith("binary.bin"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
