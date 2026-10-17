import {
  IMAGE_EXTENSIONS,
  LANGUAGES,
  MAX_DEPTH,
  SRC_PREFIX,
  type Issue,
  type Severity,
} from "./types.js";

type JsonObject = Record<string, unknown>;

/** A manifest image entry location, used by the optional disk comparison. */
export interface SrcEntry {
  src: string;
  path: string;
}

const CATEGORY_KEYS: readonly string[] = ["title", "id", "subsections"];
const SECTION_KEYS: readonly string[] = ["title", "id", "images", "subsections"];
const IMAGE_KEYS: readonly string[] = ["src", "width", "height", "aspect_ratio", "alt", "title"];

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Same algorithm as `slugify` in utils/generate_gallery.py: NFKD, drop non-ASCII,
 * drop characters other than word characters, whitespace and hyphen, strip,
 * lower-case, then collapse runs of hyphens and whitespace into one hyphen.
 */
export function slugify(text: string): string {
  const ascii = text.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const cleaned = ascii.replace(/[^\w\s-]/g, "").trim().toLowerCase();
  return cleaned.replace(/[-\s]+/g, "-");
}

class Report {
  readonly issues: Issue[] = [];

  add(severity: Severity, rule: string, path: string, message: string): void {
    this.issues.push({ severity, rule, path, message });
  }
}

interface IdRecord {
  path: string;
  parentPath: string;
}

interface Context {
  report: Report;
  seenSrc: Map<string, string>;
  ids: Map<string, IdRecord[]>;
}

/** Validates the parsed manifest. Pure: no I/O, no globals. */
export function validateManifest(data: unknown): Issue[] {
  const report = new Report();
  if (!Array.isArray(data)) {
    report.add("error", "root-array", "$", "The root must be an array of categories.");
    return report.issues;
  }
  if (data.length === 0) {
    report.add("error", "root-array", "$", "The root array must not be empty.");
    return report.issues;
  }
  const ctx: Context = { report, seenSrc: new Map(), ids: new Map() };
  checkNodes(data, 1, "$", ctx);
  checkGlobalIds(ctx);
  return report.issues;
}

function checkNodes(nodes: readonly unknown[], depth: number, path: string, ctx: Context): void {
  const siblingIds = new Map<string, string>();
  nodes.forEach((node, index) => {
    const nodePath = `${path}[${index}]`;
    if (!isObject(node)) {
      ctx.report.add("error", "node-type", nodePath, "Expected an object.");
      return;
    }
    checkNode(node, depth, nodePath, path, siblingIds, ctx);
  });
}

function checkNode(
  node: JsonObject,
  depth: number,
  path: string,
  parentPath: string,
  siblingIds: Map<string, string>,
  ctx: Context,
): void {
  const { report } = ctx;
  const allowed = depth === 1 ? CATEGORY_KEYS : SECTION_KEYS;
  const label = depth === 1 ? "category" : "section";

  for (const key of Object.keys(node)) {
    if (!allowed.includes(key)) {
      report.add("warning", "unknown-key", `${path}.${key}`, `Unknown key "${key}" on a ${label}.`);
    }
  }

  const { title, id } = node;
  if (!isNonEmptyString(title)) {
    report.add("error", "title", `${path}.title`, `A ${label} needs a non-empty string "title".`);
  }
  if (!isNonEmptyString(id)) {
    report.add("error", "id", `${path}.id`, `A ${label} needs a non-empty string "id".`);
  } else {
    const firstPath = siblingIds.get(id);
    if (firstPath !== undefined) {
      report.add("error", "id-sibling-unique", `${path}.id`, `Duplicate id "${id}" among siblings (first at ${firstPath}).`);
    } else {
      siblingIds.set(id, `${path}.id`);
    }
    const records = ctx.ids.get(id) ?? [];
    records.push({ path: `${path}.id`, parentPath });
    ctx.ids.set(id, records);
    if (isNonEmptyString(title) && id !== slugify(title)) {
      report.add("error", "id-slug", `${path}.id`, `Id "${id}" does not match the slug of the title ("${slugify(title)}").`);
    }
  }

  if (depth === 1) {
    if ("images" in node) {
      report.add("error", "category-shape", `${path}.images`, "A category must not have images; put them in a section.");
    }
    const subsections = readList(node, "subsections", path, "category-shape", ctx);
    if (subsections !== null) {
      checkNodes(subsections, depth + 1, `${path}.subsections`, ctx);
    }
    return;
  }

  const hasImages = "images" in node;
  const hasSubsections = "subsections" in node;
  if (hasImages && hasSubsections) {
    report.add("error", "section-shape", path, 'A section must have either "images" or "subsections", not both (the page ignores the images).');
  } else if (!hasImages && !hasSubsections) {
    report.add("error", "section-shape", path, 'A section needs either "images" or "subsections".');
  }

  if (hasSubsections) {
    if (depth >= MAX_DEPTH) {
      report.add("error", "max-depth", `${path}.subsections`, `Nesting deeper than ${MAX_DEPTH} levels is not supported by the page.`);
    } else {
      const subsections = readList(node, "subsections", path, "section-shape", ctx);
      if (subsections !== null) {
        checkNodes(subsections, depth + 1, `${path}.subsections`, ctx);
      }
    }
  }

  if (hasImages) {
    const images = readList(node, "images", path, "section-shape", ctx);
    if (images !== null) {
      images.forEach((image, index) => checkImage(image, `${path}.images[${index}]`, ctx));
    }
  }
}

/** Returns the array under `key`, or null (after reporting) if it is missing, not an array or empty. */
function readList(node: JsonObject, key: string, path: string, rule: string, ctx: Context): unknown[] | null {
  const value = node[key];
  if (!Array.isArray(value)) {
    ctx.report.add("error", rule, `${path}.${key}`, `"${key}" must be an array.`);
    return null;
  }
  if (value.length === 0) {
    ctx.report.add("error", rule, `${path}.${key}`, `"${key}" must not be empty.`);
    return null;
  }
  return value;
}

function checkGlobalIds(ctx: Context): void {
  for (const [id, records] of ctx.ids) {
    const parents = new Set(records.map((record) => record.parentPath));
    if (records.length > 1 && parents.size > 1) {
      const locations = records.map((record) => record.path).join(", ");
      ctx.report.add("warning", "id-global-unique", records[1]?.path ?? "$", `Id "${id}" is used more than once in the file (${locations}); anchors and DOM ids will clash.`);
    }
  }
}

function checkImage(image: unknown, path: string, ctx: Context): void {
  const { report } = ctx;
  if (!isObject(image)) {
    report.add("error", "image-type", path, "An image entry must be an object.");
    return;
  }
  for (const key of Object.keys(image)) {
    if (!IMAGE_KEYS.includes(key)) {
      report.add("warning", "unknown-key", `${path}.${key}`, `Unknown key "${key}" on an image.`);
    }
  }

  checkSrc(image["src"], `${path}.src`, ctx);
  checkDimension(image["width"], "width", `${path}.width`, report);
  checkDimension(image["height"], "height", `${path}.height`, report);
  checkAspectRatio(image["aspect_ratio"], `${path}.aspect_ratio`, report);

  if (image["alt"] === undefined) {
    report.add("error", "alt", `${path}.alt`, '"alt" is required.');
  } else {
    checkLocalizedText(image["alt"], "alt", `${path}.alt`, report);
  }
  if (image["title"] !== undefined) {
    checkLocalizedText(image["title"], "title", `${path}.title`, report);
  }
}

function checkSrc(src: unknown, path: string, ctx: Context): void {
  const { report } = ctx;
  if (typeof src !== "string") {
    report.add("error", "src", path, '"src" must be a string.');
    return;
  }
  if (src.trim() === "") {
    report.add("error", "src", path, '"src" must not be empty.');
    return;
  }

  if (src.startsWith("/")) {
    report.add("error", "src-format", path, `"${src}" must be relative (no leading "/").`);
  }
  if (src.includes("\\")) {
    report.add("error", "src-format", path, `"${src}" must use forward slashes.`);
  }
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(src)) {
    report.add("error", "src-format", path, `"${src}" must not contain a URL scheme or drive letter.`);
  }
  if (src.split("/").includes("..")) {
    report.add("error", "src-format", path, `"${src}" must not contain ".." segments.`);
  }
  if (!src.startsWith(SRC_PREFIX)) {
    report.add("error", "src-format", path, `"${src}" must start with "${SRC_PREFIX}".`);
  }

  const fileName = src.slice(src.lastIndexOf("/") + 1);
  const dot = fileName.lastIndexOf(".");
  const extension = dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
  if (!(IMAGE_EXTENSIONS as readonly string[]).includes(extension)) {
    report.add("error", "src-extension", path, `Extension "${extension}" is not one of ${IMAGE_EXTENSIONS.join(", ")}.`);
  }

  const first = ctx.seenSrc.get(src);
  if (first !== undefined) {
    report.add("error", "src-unique", path, `Duplicate src "${src}" (first at ${first}).`);
  } else {
    ctx.seenSrc.set(src, path);
  }
}

function checkDimension(value: unknown, name: "width" | "height", path: string, report: Report): void {
  const rule = `image-${name}`;
  if (value === undefined) {
    report.add("error", rule, path, `"${name}" is required.`);
  } else if (typeof value !== "number") {
    report.add("error", rule, path, `"${name}" must be a number, got ${describeType(value)}.`);
  } else if (!Number.isInteger(value)) {
    report.add("error", rule, path, `"${name}" must be an integer, got ${value}.`);
  } else if (value <= 0) {
    report.add("error", rule, path, `"${name}" must be greater than 0, got ${value}.`);
  }
}

function checkAspectRatio(value: unknown, path: string, report: Report): void {
  if (value === undefined) {
    report.add("error", "aspect-ratio", path, '"aspect_ratio" is required.');
  } else if (typeof value !== "number") {
    report.add("error", "aspect-ratio", path, `"aspect_ratio" must be a number, got ${describeType(value)}.`);
  } else if (!Number.isFinite(value) || value <= 0) {
    report.add("error", "aspect-ratio", path, `"aspect_ratio" must be a finite number greater than 0, got ${value}.`);
  }
}

/** Checks an `alt` or `title` value: a non-empty string, or an object keyed by language. */
function checkLocalizedText(value: unknown, name: "alt" | "title", path: string, report: Report): void {
  if (typeof value === "string") {
    if (value.trim() === "") {
      report.add("error", name, path, `"${name}" must not be empty.`);
    }
    return;
  }
  if (!isObject(value)) {
    report.add("error", name, path, `"${name}" must be a string or an object keyed by language, got ${describeType(value)}.`);
    return;
  }

  let usable = 0;
  for (const [key, text] of Object.entries(value)) {
    if (!(LANGUAGES as readonly string[]).includes(key)) {
      report.add("warning", `${name}-language`, `${path}.${key}`, `Unknown language key "${key}" (expected ${LANGUAGES.join(", ")}).`);
    }
    if (typeof text !== "string") {
      report.add("error", `${name}-type`, `${path}.${key}`, `"${name}.${key}" must be a string, got ${describeType(text)}.`);
    } else if (text.trim() === "") {
      report.add("warning", `${name}-language`, `${path}.${key}`, `"${name}.${key}" is empty.`);
    } else {
      usable += 1;
    }
  }
  for (const language of LANGUAGES) {
    if (!(language in value)) {
      report.add("warning", `${name}-language`, path, `"${name}" has no "${language}" text.`);
    }
  }
  if (usable === 0) {
    report.add("error", name, path, `"${name}" needs at least one non-empty text.`);
  }
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/** Lists every string `src` in the manifest with its location. Tolerates invalid structure. */
export function collectSrcs(data: unknown): SrcEntry[] {
  const entries: SrcEntry[] = [];
  const walk = (nodes: unknown, path: string): void => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node, index) => {
      if (!isObject(node)) return;
      const nodePath = `${path}[${index}]`;
      walk(node["subsections"], `${nodePath}.subsections`);
      const images = node["images"];
      if (Array.isArray(images)) {
        images.forEach((image, imageIndex) => {
          if (isObject(image) && typeof image["src"] === "string") {
            entries.push({ src: image["src"], path: `${nodePath}.images[${imageIndex}].src` });
          }
        });
      }
    });
  };
  walk(data, "$");
  return entries;
}

/**
 * Compares manifest sources with the image files found on disk (both relative,
 * with forward slashes). Pure: the caller does the file system listing.
 * A manifest entry with no file is an error; a file that is not in the manifest is info only,
 * because the generator ignores images placed directly in a category folder.
 */
export function compareWithDisk(entries: readonly SrcEntry[], diskFiles: readonly string[]): Issue[] {
  const issues: Issue[] = [];
  const onDisk = new Set(diskFiles.map((file) => file.normalize("NFC")));
  const inManifest = new Set<string>();

  for (const entry of entries) {
    const normalized = entry.src.normalize("NFC");
    inManifest.add(normalized);
    if (!onDisk.has(normalized)) {
      issues.push({ severity: "error", rule: "file-missing", path: entry.path, message: `File "${entry.src}" does not exist on disk.` });
    }
  }
  for (const file of diskFiles) {
    if (!inManifest.has(file.normalize("NFC"))) {
      issues.push({ severity: "info", rule: "file-orphan", path: "disk", message: `File "${file}" is not listed in the manifest.` });
    }
  }
  return issues;
}
