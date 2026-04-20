function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function parsePagination(query = {}, options = {}) {
  const defaultPage = options.defaultPage || 1;
  const defaultLimit = options.defaultLimit || 20;
  const maxLimit = options.maxLimit || 100;

  const page = clampNumber(query.page, defaultPage, 1, 100000);
  const limit = clampNumber(query.limit, defaultLimit, 1, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPaginationMeta(total, page, limit) {
  const safeTotal = Math.max(0, Number(total || 0));
  const safeLimit = Math.max(1, Number(limit || 1));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const safePage = Math.min(Math.max(1, Number(page || 1)), totalPages);

  return {
    total: safeTotal,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

module.exports = { parsePagination, buildPaginationMeta };
