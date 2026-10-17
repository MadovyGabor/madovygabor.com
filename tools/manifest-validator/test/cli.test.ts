import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { image, manifest } from "./fixtures.js";

const cliPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src", "cli.js");
const workDir = mkdtempSync(join(tmpdir(), "gallery-validator-"));

after(() => {
  rmSync(workDir, { recursive: true, force: true });
});

let counter = 0;

/** Creates a photography-site-like folder with a manifest; returns the manifest path and the site folder. */
function makeSite(data: unknown, files: string[] = []): { manifestPath: string; site: string } {
  counter += 1;
  const site = join(workDir, `site-${counter}`);
  mkdirSync(site, { recursive: true });
  const manifestPath = join(site, "galleryData.json");
  writeFileSync(manifestPath, typeof data === "string" ? data : JSON.stringify(data), "utf8");
  for (const file of files) {
    const target = join(site, ...file.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "x");
  }
  return { manifestPath, site };
}

function run(...args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [cliPath, ...args], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("CLI", () => {
  it("exits 0 for a valid file and prints only the summary", () => {
    const { manifestPath } = makeSite(manifest());
    const result = run(manifestPath);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim().split("\n").length, 1);
    assert.match(result.stdout, /0 error\(s\), 0 warning\(s\)/);
  });

  it("exits 1 for a file with an error and prints the location", () => {
    const { manifestPath } = makeSite(manifest([image({ width: 0 })]));
    const result = run(manifestPath);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /image-width \$\[0\]\.subsections\[0\]\.images\[0\]\.width/);
  });

  it("exits 0 for warnings only, and 1 with --strict", () => {
    const { manifestPath } = makeSite(manifest([image({ note: "x" })]));
    assert.equal(run(manifestPath).status, 0);
    assert.equal(run(manifestPath, "--strict").status, 1);
  });

  it("exits 2 for a missing file", () => {
    const result = run(join(workDir, "does-not-exist.json"));
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Cannot read/);
  });

  it("exits 2 for invalid JSON", () => {
    const { manifestPath } = makeSite("{ not json");
    const result = run(manifestPath);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Invalid JSON/);
  });

  it("exits 2 for an unknown option and 0 for --help", () => {
    assert.equal(run("--nope").status, 2);
    assert.equal(run("--help").status, 0);
  });

  it("--check-files exits 1 when an image file is missing", () => {
    const { manifestPath } = makeSite(manifest(), ["pictures/portfolio/Cat/Sub/other.webp"]);
    const result = run(manifestPath, "--check-files");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /file-missing/);
  });

  it("--check-files reports an orphan file as info and still exits 0", () => {
    const { manifestPath } = makeSite(manifest(), ["pictures/portfolio/Cat/Sub/a.webp", "pictures/portfolio/Cat/loose.webp"]);
    const result = run(manifestPath, "--check-files");
    assert.equal(result.status, 0);
    assert.match(result.stdout, /file-orphan/);
  });

  it("--check-files exits 2 when pictures/portfolio does not exist", () => {
    const { manifestPath } = makeSite(manifest());
    assert.equal(run(manifestPath, "--check-files").status, 2);
  });
});
