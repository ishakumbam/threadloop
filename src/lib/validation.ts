import { z } from "zod";

export const profileSchema = z
  .object({
    vibes: z.array(z.string()).min(1, "Pick at least one vibe"),
    categories: z.array(z.string()).default([]),
    sizes: z.array(z.string()).min(1, "Pick at least one size"),
    avoid: z.array(z.string()).default([]),
    budgetMin: z.number().int().min(0),
    budgetMax: z.number().int().min(0),
  })
  .refine((d) => d.budgetMax >= d.budgetMin, {
    message: "budgetMax must be >= budgetMin",
    path: ["budgetMax"],
  });

export type ProfilePayload = z.infer<typeof profileSchema>;
