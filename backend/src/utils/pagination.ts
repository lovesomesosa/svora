export const getPagination = (page?: string, limit?: string) => {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const safePage = parsedPage < 1 ? 1 : parsedPage;
  const safeLimit = parsedLimit < 1 ? 10 : parsedLimit > 100 ? 100 : parsedLimit;

  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
};