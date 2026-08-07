import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ReleaseUnit = "patch" | "minor" | "major";

const MANIFEST_PATHS = [
  "plugins/lazypaca/.claude-plugin/plugin.json",
  "plugins/lazypaca/.codex-plugin/plugin.json",
];

export function parseReleaseUnit(args: string[]): ReleaseUnit {
  if (args.length === 0) {
    return "patch";
  }
  if (args.length !== 1) {
    throw new Error("Choose exactly one release unit");
  }

  const units: Record<string, ReleaseUnit> = {
    "--patch": "patch",
    "--minor": "minor",
    "--major": "major",
  };
  const unit = units[args[0]];
  if (!unit) {
    throw new Error(`Unsupported release argument: ${args[0]}`);
  }
  return unit;
}

export function nextVersion(current: string, unit: ReleaseUnit): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) {
    throw new Error(`Invalid semantic version: ${current}`);
  }

  const [, majorText, minorText, patchText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);

  if (unit === "major") {
    return `${major + 1}.0.0`;
  }
  if (unit === "minor") {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

export function bumpManifestVersions(root: string, unit: ReleaseUnit): string {
  const manifests = MANIFEST_PATHS.map((relativePath) => {
    const path = join(root, relativePath);
    return { path, value: JSON.parse(readFileSync(path, "utf8")) };
  });
  const versions = new Set(manifests.map(({ value }) => value.version));
  if (versions.size !== 1) {
    throw new Error("Plugin manifest versions must match before a release");
  }

  const current = manifests[0].value.version;
  const version = nextVersion(current, unit);
  for (const { path, value } of manifests) {
    const updated = { ...value, version };
    writeFileSync(path, `${JSON.stringify(updated, null, 2)}\n`);
  }
  return version;
}

if (import.meta.main) {
  const unit = parseReleaseUnit(Bun.argv.slice(2));
  const version = bumpManifestVersions(process.cwd(), unit);
  console.log(`Updated plugin manifests to ${version} (${unit})`);
}
