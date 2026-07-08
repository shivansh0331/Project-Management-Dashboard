import Fuse from "fuse.js";

/**
 * Performs fuzzy search on a list of objects using Fuse.js.
 */
export function fuzzySearch<T>(list: T[], pattern: string, keys: string[]): T[] {
  if (!pattern || pattern.trim() === "") {
    return list;
  }

  const options = {
    keys,
    threshold: 0.4, // Threshold for fuzzy match (0.0 is perfect match, 1.0 matches anything)
    distance: 100,
    ignoreLocation: true,
  };

  const fuse = new Fuse(list, options);
  const results = fuse.search(pattern);
  return results.map((result) => result.item);
}
