import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { IMAGE_EXTENSIONS, type Issue } from "./types.js";
import { collectSrcs, compareWithDisk, validateManifest } from "./validate.js";

const EXIT_OK = 0;
const EXIT_INVALID = 1;
const EXIT_FAILURE = 2;

const USAGE = `Usage: node dist/src/cli.js [path-to-galleryData.json] [--check-files] [--strict]

Validates the gallery manifest FILE. It does not render the page and does not look at image content.

Without a path, subdomains/photography/galleryData.json in this repository is used.

  --check-files  also check that every src exists under pictures/portfolio next to the manifest
  --strict       treat warnings as failures
  -h, --help     show this text

Exit codes: 0 = no errors, 1 = validation errors (or warnings with --strict), 2 = usage or read/parse failure.`;

interface Options {
  path: string | null;
  checkFiles: boolean;
  strict: boolean;
  help: boolean;
}

function parseArgs(args: readonly string[]): Options | string {
  const options: Options = { path: null, checkFiles: false, strict: false, help: false };
  for (const arg of args) {
    if (arg === "--check-files") options.checkFiles = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("-")) return `Unknown option: ${arg}`;
    else if (options.path !== null) return "Only one path argument is allowed.";
    else options.path = arg;
  }
  return options;
}

/** The repository root, derived from this file's location: <root>/tools/manifest-validator/dist/src/cli.js. */
function repositoryRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "..", "..");
}

/** Lists image files below `directory`, as paths relative to `base` with forward slashes. */
function listImageFiles(directory: string, base: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...listImageFiles(full, base));
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if ((IMAGE_EXTENSIONS as readonly string[]).some((extension) => lower.endsWith(extension))) {
        found.push(full.slice(base.length + 1).split("\\").join("/"));
      }
    }
  }
  return found.sort();
}

function formatIssue(issue: Issue): string {
  return `${issue.severity.toUpperCase().padEnd(7)} ${issue.rule} ${issue.path}: ${issue.message}`;
}

function fail(message: string): number {
  process.stderr.write(`${message}\n`);
  return EXIT_FAILURE;
}

function main(args: readonly string[]): number {
  const parsed = parseArgs(args);
  if (typeof parsed === "string") {
    return fail(`${parsed}\n\n${USAGE}`);
  }
  if (parsed.help) {
    process.stdout.write(`${USAGE}\n`);
    return EXIT_OK;
  }

  const manifestPath = resolve(parsed.path ?? join(repositoryRoot(), "subdomains", "photography", "galleryData.json"));

  let text: string;
  try {
    text = readFileSync(manifestPath, "utf8");
  } catch (error) {
    return fail(`Cannot read ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return fail(`Invalid JSON in ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const issues: Issue[] = validateManifest(data);

  if (parsed.checkFiles) {
    const siteRoot = dirname(manifestPath);
    const portfolio = join(siteRoot, "pictures", "portfolio");
    let diskFiles: string[];
    try {
      diskFiles = listImageFiles(portfolio, siteRoot);
    } catch (error) {
      return fail(`Cannot scan ${portfolio}: ${error instanceof Error ? error.message : String(error)}`);
    }
    issues.push(...compareWithDisk(collectSrcs(data), diskFiles));
  }

  for (const issue of issues) {
    process.stdout.write(`${formatIssue(issue)}\n`);
  }
  const count = (severity: Issue["severity"]): number => issues.filter((issue) => issue.severity === severity).length;
  const errors = count("error");
  const warnings = count("warning");
  process.stdout.write(`${manifestPath}: ${errors} error(s), ${warnings} warning(s), ${count("info")} info\n`);

  if (errors > 0 || (parsed.strict && warnings > 0)) {
    return EXIT_INVALID;
  }
  return EXIT_OK;
}

process.exitCode = main(process.argv.slice(2));
