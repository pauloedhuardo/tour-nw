import { z } from "zod"

const positionSchema = z.number().int().min(1).optional()

export const raceResultAthleteSchema = z.object({
  userId: z.string().uuid(),
  finishPosition: positionSchema,
  sprintPosition1: positionSchema,
  sprintPosition2: positionSchema,
  climbPosition1: positionSchema,
  climbPosition2: positionSchema,
})

const validateDuplicatedPositions = (
  values: Array<z.infer<typeof raceResultAthleteSchema>>,
  key:
    | "finishPosition"
    | "sprintPosition1"
    | "sprintPosition2"
    | "climbPosition1"
    | "climbPosition2",
  label: string,
  ctx: z.RefinementCtx,
) => {
  const positions = new Map<number, number[]>()

  values.forEach((athlete, index) => {
    const position = athlete[key]
    if (!position) return

    const indexes = positions.get(position) ?? []
    positions.set(position, [...indexes, index])
  })

  positions.forEach((indexes, position) => {
    if (indexes.length < 2) return

    indexes.forEach((athleteIndex) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["athletes", athleteIndex, key],
        message: `${label}: posição ${position} duplicada.`,
      })
    })
  })
}

export const raceResultsSchema = z
  .object({
    raceId: z.string().uuid(),
    athletes: z.array(raceResultAthleteSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const uniqueUserIds = new Set(
      data.athletes.map((athlete) => athlete.userId),
    )
    if (uniqueUserIds.size !== data.athletes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["athletes"],
        message: "Lista de atletas inválida.",
      })
    }

    validateDuplicatedPositions(data.athletes, "finishPosition", "Chegada", ctx)
    validateDuplicatedPositions(
      data.athletes,
      "sprintPosition1",
      "Sprint 1",
      ctx,
    )
    validateDuplicatedPositions(
      data.athletes,
      "sprintPosition2",
      "Sprint 2",
      ctx,
    )
    validateDuplicatedPositions(
      data.athletes,
      "climbPosition1",
      "Subida 1",
      ctx,
    )
    validateDuplicatedPositions(
      data.athletes,
      "climbPosition2",
      "Subida 2",
      ctx,
    )
  })

export type RaceResultsSchema = z.infer<typeof raceResultsSchema>
