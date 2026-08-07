import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HANGUL_PATTERN = /\p{Script=Hangul}/u;

export function containsHangul(value: string): boolean {
  return HANGUL_PATTERN.test(value);
}

export function scanRepository(root: string): string[] {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root },
  ).toString("utf8");
  const paths = output.split("\0").filter(Boolean);
  const violations: string[] = [];

  for (const path of paths) {
    if (containsHangul(path)) {
      violations.push(`${path} (file name)`);
    }

    const content = readFileSync(join(root, path));
    if (content.includes(0)) {
      continue;
    }

    content.toString("utf8").split(/\r?\n/).forEach((line, index) => {
      if (containsHangul(line)) {
        violations.push(`${path}:${index + 1}`);
      }
    });
  }

  return violations;
}
