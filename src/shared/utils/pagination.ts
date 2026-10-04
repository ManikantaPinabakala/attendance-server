import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const pageResult = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
) => ({
  items,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
