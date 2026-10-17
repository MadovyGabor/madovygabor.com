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

The rules come from reading the generator, the loader and the committed file.

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

## How to run

Prerequisites: Node 22 or newer (see `engines` in `package.json`) and npm. Run everything from `tools/manifest-validator`.

```bash
npm ci               # install dev dependencies (needs a package-lock.json, see Known limitations)
npm run build        # compile src/ and test/ to dist/ with tsc
npm test             # run the compiled tests: node --test "dist/test/*.test.js"
npm run validate     # node dist/src/cli.js, validates the default manifest
```

`npm test` and `npm run validate` run the compiled files, so run `npm run build` first.

- Path argument: at most one path to a manifest file; a relative path is resolved from the current directory. Without it, `subdomains/photography/galleryData.json` in this repository is used.
- `--check-files`: also checks that every `src` exists below `pictures/portfolio` next to the manifest. A missing file is an error; an image on disk that is not in the manifest is only an info line.
- `--strict`: warnings also make the command fail.
- `-h`, `--help`: prints the usage text and exits with 0.

Flags can be passed through npm after `--`, for example `npm run validate -- --check-files --strict`.

## Exit codes

- `0`: no errors. Warnings and info lines may still be printed. `--help` also exits with 0.
- `1`: at least one error, or at least one warning when `--strict` is used.
- `2`: the check could not run: unknown option, more than one path, file not readable, invalid JSON, or `pictures/portfolio` cannot be scanned with `--check-files`.

Info lines never change the exit code.

## What it does NOT check

- It validates the manifest file, not the rendered page.
- It does not open or inspect image contents, and does not check that images load in a browser.
- It is not a security scanner.
- It does not judge alt text quality; it only checks that `alt` is present and not empty.
- It does not check the Cloudflare deployment.

## Known limitations

- No `package-lock.json` is committed yet. Run `npm install` once with network access and commit the lockfile before relying on CI: the workflow runs `npm ci`, which fails without a lockfile.
- The dependency versions in `package.json` (`typescript` 7.0.2, `@types/node` 22.20.2) were not checked against the npm registry.
- The committed `galleryData.json` contains one duplicate id (`fesztival-hangulatkepek`). It is reported as a warning (`id-global-unique`), not as an error.
