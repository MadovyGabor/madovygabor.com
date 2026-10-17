# Gallery manifest validator

Checks the structure of the photography gallery manifest,
`subdomains/photography/galleryData.json`, which is written by
`subdomains/photography/utils/generate_gallery.py` and read by
`subdomains/photography/javaScript/galleryLoader.js`.

## What it does and does not do

- It validates the manifest **file** only: JSON structure, field types and value formats.
- It does **not** render the page and does not check how the gallery looks in a browser.
- It does **not** open or scan images. The content of the pictures, their real
  dimensions and their file size are never checked. The optional `--check-files`
  only compares file names with the `src` values.
- It does not change any file. It has no runtime dependencies and uses no network.

The rules come from reading the generator, the loader and the committed file;
see [PLAN.md](PLAN.md) for the evidence behind each rule.

## Usage

Requires Node 22 or newer.

```bash
cd tools/manifest-validator
npm ci
npm run build
npm test
npm run validate                       # validates subdomains/photography/galleryData.json
node dist/src/cli.js path/to/file.json # validates another file
node dist/src/cli.js --check-files     # also compares src values with the files on disk
node dist/src/cli.js --strict          # warnings fail too
```

`npm ci` needs a `package-lock.json`. The first one has to be created with
`npm install` on a machine that can reach the npm registry, then committed.

With no path argument the default file is found from the repository root (derived
from the location of the compiled `cli.js`), not from the current directory.

### Exit codes

| Code | Meaning |
|---|---|
| 0 | No errors (warnings and info lines may be printed) |
| 1 | At least one error, or at least one warning with `--strict` |
| 2 | Usage error, file not readable, invalid JSON, or `pictures/portfolio` missing with `--check-files` |

Each finding is printed as `SEVERITY rule path: message`, where `path` is a
location such as `$[1].subsections[0].images[3].src`.

## Rules

Errors:

- `root-array`: the root is a non-empty array of categories.
- `category-shape`, `section-shape`, `title`, `id`: a category has `title`, `id` and a non-empty `subsections`; a section has `title`, `id` and exactly one of a non-empty `images` or `subsections`.
- `max-depth`: at most 3 levels (category, section, sub-section); sub-sections hold only images.
- `id-slug`: `id` equals the slug of `title`, computed like `slugify` in the generator.
- `id-sibling-unique`: ids are unique among siblings.
- `image-type`: an image entry is an object (bare strings are rejected, although the page would accept them).
- `src`, `src-format`, `src-extension`, `src-unique`: a non-empty relative path with forward slashes, starting with `pictures/portfolio/`, ending in `.jpg`, `.jpeg`, `.png` or `.webp`, and unique in the file. Spaces and non-ASCII characters are allowed.
- `image-width`, `image-height`: integers greater than 0 (the generator writes 0 when it cannot read an image).
- `aspect-ratio`: a finite number greater than 0. It is **not** compared with width and height.
- `alt`, `alt-type`, `title`, `title-type`: `alt` is required; `alt` and `title` are a non-empty string or an object keyed by `en`, `hu`, `sk` with at least one non-empty text.
- `file-missing` (only with `--check-files`): a `src` has no file under the site folder.

Warnings:

- `id-global-unique`: the same id appears under different parents (the committed file has one such case; the id is used as an anchor and DOM id).
- `alt-language`, `title-language`: a language is missing or empty, or the key is not `en`, `hu`, `sk`.
- `unknown-key`: a key that the generator never writes.

Info (never fails):

- `file-orphan` (only with `--check-files`): an image under `pictures/portfolio` that is not in the manifest. The generator ignores images placed directly in a category folder, so this can be intended.

## Changing a rule

Rules live in `src/validate.ts` as small functions that return issues; the module has
no I/O. Add a test in `test/validate.test.ts`, run `npm run build && npm test`.
