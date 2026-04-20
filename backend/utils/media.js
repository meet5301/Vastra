function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function normalizePathLike(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^\/+/, "");
}

function resolveMediaUrl(value) {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  if (isDataUrl(raw) || isAbsoluteUrl(raw)) return raw;

  const relative = normalizePathLike(raw);
  const cdnBase = String(process.env.MEDIA_CDN_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!cdnBase) return relative;
  return `${cdnBase}/${relative}`;
}

function normalizeImageArray(value) {
  if (!value) return [];
  const source = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return source
    .map((item) => resolveMediaUrl(item))
    .filter(Boolean);
}

function normalizeColorImages(value) {
  if (!value) return [];
  const source = Array.isArray(value) ? value : [];

  return source
    .map((entry) => ({
      color: String(entry?.color || "").trim(),
      image: resolveMediaUrl(String(entry?.image || "").trim()),
    }))
    .filter((entry) => entry.color && entry.image);
}

module.exports = {
  resolveMediaUrl,
  normalizeImageArray,
  normalizeColorImages,
};