import { z } from "zod"

export const inscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
})

export type InscriptionSchema = z.infer<typeof inscriptionSchema>
