import { z } from "zod";

export const updateProfileDto = z.object({
  name: z.string().min(1).max(120).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileDto>;
