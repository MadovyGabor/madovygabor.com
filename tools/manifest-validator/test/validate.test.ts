import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type { Issue, Severity } from "../src/types.js";
import { collectSrcs, compareWithDisk, slugify, validateManifest } from "../src/validate.js";
import { image, manifest, without, type JsonObject } from "./fixtures.js";

function has(issues: readonly Issue[], severity: Severity, rule: string): boolean {
  return issues.some((issue) => issue.severity === severity && issue.rule === rule);
}

function errorRules(issues: readonly Issue[]): string[] {
  return issues.filter((issue) => issue.severity === "error").map((issue) => issue.rule);
}

describe("validateManifest: real file", () => {
  it("accepts the committed galleryData.json (no errors)", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
    const text = readFileSync(resolve(root, "subdomains", "photography", "galleryData.json"), "utf8");
    const issues = validateManifest(JSON.parse(text));
    assert.deepEqual(errorRules(issues), []);
  });
});

describe("validateManifest: structure", () => {
  it("accepts a minimal valid manifest with no issues", () => {
    assert.deepEqual(validateManifest(manifest()), []);
  });

  it("rejects a root that is an object instead of an array", () => {
    assert.ok(has(validateManifest({ categories: [] }), "error", "root-array"));
  });

  it("rejects an empty root array", () => {
    assert.ok(has(validateManifest([]), "error", "root-array"));
  });

  it("reports a category without title", () => {
    const data = [{ id: "cat", subsections: [{ title: "Sub", id: "sub", images: [image()] }] }];
    assert.ok(has(validateManifest(data), "error", "title"));
  });

  it("reports a category without id", () => {
    const data = [{ title: "Cat", subsections: [{ title: "Sub", id: "sub", images: [image()] }] }];
    assert.ok(has(validateManifest(data), "error", "id"));
  });

  it("reports a category without subsections", () => {
    assert.ok(has(validateManifest([{ title: "Cat", id: "cat" }]), "error", "category-shape"));
  });

  it("reports a section that has both images and subsections", () => {
    const section = { title: "Sub", id: "sub", images: [image()], subsections: [{ title: "Leaf", id: "leaf", images: [image({ src: "pictures/portfolio/Cat/Sub/Leaf/b.webp" })] }] };
    assert.ok(has(validateManifest([{ title: "Cat", id: "cat", subsections: [section] }]), "error", "section-shape"));
  });

  it("reports a section with an empty images array", () => {
    assert.ok(has(validateManifest(manifest([])), "error", "section-shape"));
  });

  it("reports nesting deeper than 3 levels", () => {
    const leaf = { title: "Leaf", id: "leaf", subsections: [{ title: "Deep", id: "deep", images: [image()] }] };
    const data = [{ title: "Cat", id: "cat", subsections: [{ title: "Sub", id: "sub", subsections: [leaf] }] }];
    assert.ok(has(validateManifest(data), "error", "max-depth"));
  });

  it("reports an id that differs from the slug of the title (accented title)", () => {
    const data = [{ title: "Rendezvények", id: "rendezvenyek", subsections: [{ title: "Sub", id: "wrong", images: [image()] }] }];
    const issues = validateManifest(data);
    assert.ok(has(issues, "error", "id-slug"));
    assert.equal(issues.filter((issue) => issue.rule === "id-slug").length, 1);
  });

  it("reports a duplicate id among siblings", () => {
    const data = [{
      title: "Cat",
      id: "cat",
      subsections: [
        { title: "Sub", id: "sub", images: [image()] },
        { title: "Sub", id: "sub", images: [image({ src: "pictures/portfolio/Cat/Sub/b.webp" })] },
      ],
    }];
    assert.ok(has(validateManifest(data), "error", "id-sibling-unique"));
  });

  it("warns, but does not fail, when the same id is used under different parents", () => {
    const leaf = (src: string): JsonObject => ({ title: "Mood", id: "mood", images: [image({ src })] });
    const data = [{
      title: "Cat",
      id: "cat",
      subsections: [
        { title: "A", id: "a", subsections: [leaf("pictures/portfolio/Cat/A/Mood/1.webp")] },
        { title: "B", id: "b", subsections: [leaf("pictures/portfolio/Cat/B/Mood/1.webp")] },
      ],
    }];
    const issues = validateManifest(data);
    assert.ok(has(issues, "warning", "id-global-unique"));
    assert.deepEqual(errorRules(issues), []);
  });

  it("warns about unknown keys on sections and images", () => {
    const data = [{ title: "Cat", id: "cat", extra: 1, subsections: [{ title: "Sub", id: "sub", images: [image({ note: "x" })] }] }];
    const unknown = validateManifest(data).filter((issue) => issue.rule === "unknown-key");
    assert.equal(unknown.length, 2);
    assert.ok(unknown.every((issue) => issue.severity === "warning"));
  });
});

describe("validateManifest: images", () => {
  it("reports a bare string image entry", () => {
    assert.ok(has(validateManifest(manifest(["pictures/portfolio/Cat/Sub/a.webp"])), "error", "image-type"));
  });

  it("reports an image without alt", () => {
    assert.ok(has(validateManifest(manifest([without(image(), "alt")])), "error", "alt"));
  });

  it("reports an empty-string alt", () => {
    assert.ok(has(validateManifest(manifest([image({ alt: "" })])), "error", "alt"));
  });

  it("accepts a localized alt and title object", () => {
    const text = { en: "A", hu: "B", sk: "C" };
    assert.deepEqual(validateManifest(manifest([image({ alt: text, title: text })])), []);
  });

  it("warns when a localized alt lacks one language", () => {
    const issues = validateManifest(manifest([image({ alt: { en: "A", hu: "B" } })]));
    assert.ok(has(issues, "warning", "alt-language"));
    assert.deepEqual(errorRules(issues), []);
  });

  it("reports a localized alt with a non-string value", () => {
    assert.ok(has(validateManifest(manifest([image({ alt: { en: "A", hu: 5, sk: "C" } })])), "error", "alt-type"));
  });

  it("reports a localized alt with no usable text", () => {
    assert.ok(has(validateManifest(manifest([image({ alt: { en: "", hu: "", sk: "" } })])), "error", "alt"));
  });

  it("reports a title of the wrong type but accepts a missing title", () => {
    assert.ok(has(validateManifest(manifest([image({ title: 5 })])), "error", "title"));
    assert.deepEqual(validateManifest(manifest([without(image(), "title")])), []);
  });

  it("reports an empty src", () => {
    assert.ok(has(validateManifest(manifest([image({ src: "" })])), "error", "src"));
  });

  it("reports a missing src", () => {
    assert.ok(has(validateManifest(manifest([without(image(), "src")])), "error", "src"));
  });

  it("reports a src outside pictures/portfolio or with a bad format", () => {
    const bad = [
      "/pictures/portfolio/Cat/a.webp",
      "pictures\\portfolio\\Cat\\a.webp",
      "pictures/portfolio/../secret/a.webp",
      "https://example.com/pictures/portfolio/a.webp",
      "images/a.webp",
    ];
    for (const src of bad) {
      assert.ok(has(validateManifest(manifest([image({ src })])), "error", "src-format"), src);
    }
  });

  it("reports an unsupported file extension", () => {
    assert.ok(has(validateManifest(manifest([image({ src: "pictures/portfolio/Cat/Sub/a.gif" })])), "error", "src-extension"));
  });

  it("accepts all extensions the generator accepts, in any letter case", () => {
    for (const name of ["a.jpg", "a.JPEG", "a.png", "a.WebP"]) {
      assert.deepEqual(validateManifest(manifest([image({ src: `pictures/portfolio/Cat/Sub/${name}` })])), [], name);
    }
  });

  it("reports a duplicate src", () => {
    assert.ok(has(validateManifest(manifest([image(), image()])), "error", "src-unique"));
  });

  it("accepts a src with spaces and non-ASCII characters", () => {
    const src = "pictures/portfolio/Ingatlan & Enteriőr/AVA Chatka Motýlik/chata 1.webp";
    assert.deepEqual(validateManifest(manifest([image({ src })])), []);
  });

  it("reports a width of 0", () => {
    assert.ok(has(validateManifest(manifest([image({ width: 0 })])), "error", "image-width"));
  });

  it("reports a negative height", () => {
    assert.ok(has(validateManifest(manifest([image({ height: -4000 })])), "error", "image-height"));
  });

  it("reports a width given as a string", () => {
    assert.ok(has(validateManifest(manifest([image({ width: "6000" })])), "error", "image-width"));
  });

  it("reports a height that is not an integer", () => {
    assert.ok(has(validateManifest(manifest([image({ height: 10.5 })])), "error", "image-height"));
  });

  it("reports an aspect_ratio given as a string", () => {
    assert.ok(has(validateManifest(manifest([image({ aspect_ratio: "1.5" })])), "error", "aspect-ratio"));
  });

  it("reports an aspect_ratio of 0 or below, and a missing aspect_ratio", () => {
    assert.ok(has(validateManifest(manifest([image({ aspect_ratio: 0 })])), "error", "aspect-ratio"));
    assert.ok(has(validateManifest(manifest([image({ aspect_ratio: -1 })])), "error", "aspect-ratio"));
    assert.ok(has(validateManifest(manifest([without(image(), "aspect_ratio")])), "error", "aspect-ratio"));
  });

  it("does not compare aspect_ratio with width and height", () => {
    assert.deepEqual(validateManifest(manifest([image({ aspect_ratio: 2.5 })])), []);
  });
});

describe("slugify", () => {
  it("matches the generator for accented and spaced names", () => {
    assert.equal(slugify("Rendezvények"), "rendezvenyek");
    assert.equal(slugify("Ingatlan & Enteriőr"), "ingatlan-enterior");
    assert.equal(slugify("Hajómalom fesztivál 25"), "hajomalom-fesztival-25");
    assert.equal(slugify("AVA NIGHT 26"), "ava-night-26");
  });
});

describe("compareWithDisk", () => {
  it("reports a missing file as an error and an orphan file as info", () => {
    const entries = collectSrcs(manifest([image(), image({ src: "pictures/portfolio/Cat/Sub/b.webp" })]));
    assert.equal(entries.length, 2);
    const issues = compareWithDisk(entries, ["pictures/portfolio/Cat/Sub/a.webp", "pictures/portfolio/Cat/loose.webp"]);
    assert.ok(has(issues, "error", "file-missing"));
    assert.ok(has(issues, "info", "file-orphan"));
  });

  it("treats NFC and NFD spellings of the same name as equal", () => {
    const nfd = "pictures/portfolio/Rendezvények/a.webp".normalize("NFD");
    const entries = collectSrcs(manifest([image({ src: "pictures/portfolio/Rendezvények/a.webp" })]));
    assert.deepEqual(compareWithDisk(entries, [nfd]), []);
  });
});
