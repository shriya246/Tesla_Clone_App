export function formatSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) =>
      segment.length <= 1
        ? segment.toUpperCase()
        : `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`,
    )
    .join(" ");
}

export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
