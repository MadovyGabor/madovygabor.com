/** Severity of a validation finding. Only "error" fails the CLI by default. */
export type Severity = "error" | "warning" | "info";

/** One finding produced by the validator. */
export interface Issue {
  severity: Severity;
  /** Short stable rule identifier, for example "image-width". */
  rule: string;
  /** Location in the manifest, for example "$[1].subsections[0].images[3].src". */
  path: string;
  message: string;
}

/** Language keys used by localized `alt` and `title` objects. */
export const LANGUAGES = ["en", "hu", "sk"] as const;

/** Image extensions the generator accepts (lower case, with the dot). */
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Every `src` must start with this folder (relative to the photography site root). */
export const SRC_PREFIX = "pictures/portfolio/";

/** Maximum nesting depth: category (1), section (2), sub-section (3). */
export const MAX_DEPTH = 3;
