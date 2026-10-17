export type JsonObject = Record<string, unknown>;

/** A valid image entry; `overrides` replace or add keys. */
export function image(overrides: JsonObject = {}): JsonObject {
  return {
    src: "pictures/portfolio/Cat/Sub/a.webp",
    width: 6000,
    height: 4000,
    aspect_ratio: 1.5,
    alt: "Alt text",
    ...overrides,
  };
}

/** A valid one-category manifest holding the given images in one section. */
export function manifest(images: unknown[] = [image()]): unknown[] {
  return [{ title: "Cat", id: "cat", subsections: [{ title: "Sub", id: "sub", images }] }];
}

/** Returns a shallow copy of `source` without `key`. */
export function without(source: JsonObject, key: string): JsonObject {
  const copy: JsonObject = { ...source };
  delete copy[key];
  return copy;
}
