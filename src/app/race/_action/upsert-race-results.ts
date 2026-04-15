"use server"

import { revalidatePath } from "next/cache"

import { ResultType } from "@/generated/prisma/enums"
import { actionClient } from "@/lib/next-safe-action"
import prisma from "@/lib/prisma"

import { raceResultsSchema } from "../schema"

const FINISH_POINTS: Record<number, number> = {
  1: 10,
  2: 7,
  3: 5,
  4: 3,
  5: 1,
}

const SPRINT_POINTS: Record<number, number> = {
  1: 5,
  2: 3,
  3: 1,
}

const CLIMB_POINTS: Record<number, number> = {
  1: 5,
  2: 3,
  3: 1,
}

const PARTICIPATION_BONUS = 1

const getScore = (
  position: number | undefined,
  table: Record<number, number>,
) => {
  if (!position) return 0
  return table[position] ?? 0
}

export const upsertRaceResults = actionClient
  .inputSchema(raceResultsSchema)
  .action(async ({ parsedInput }) => {
    const race = await prisma.race.findUnique({
      where: {
        id: parsedInput.raceId,
      },
      include: {
        event: {
          include: {
            inscriptions: {
              where: {
                activate: true,
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!race) {
      throw new Error("Race não encontrada.")
    }

    const allowedUserIds = new Set(
      race.event.inscriptions.map(({ userId }) => userId),
    )
    const hasInvalidAthletes = parsedInput.athletes.some(
      ({ userId }) => !allowedUserIds.has(userId),
    )

    if (hasInvalidAthletes) {
      throw new Error("Existem atletas inválidos para esta race.")
    }

    const operations = parsedInput.athletes.flatMap((athlete) => {
      const finishPosition = athlete.finishPosition ?? 0
      const sprintPosition1 = athlete.sprintPosition1 ?? 0
      const sprintPosition2 = athlete.sprintPosition2 ?? 0
      const climbPosition1 = athlete.climbPosition1 ?? 0
      const climbPosition2 = athlete.climbPosition2 ?? 0

      let finishPoints: number

      if (finishPosition > 0) {
        finishPoints =
          getScore(athlete.finishPosition, FINISH_POINTS) + PARTICIPATION_BONUS
      } else {
        finishPoints = 0
      }

      const sprintPoints1 = getScore(athlete.sprintPosition1, SPRINT_POINTS)
      const sprintPoints2 = getScore(athlete.sprintPosition2, SPRINT_POINTS)
      const climbPoints1 = getScore(athlete.climbPosition1, CLIMB_POINTS)
      const climbPoints2 = getScore(athlete.climbPosition2, CLIMB_POINTS)

      return [
        prisma.result.upsert({
          where: {
            raceId_userId_type: {
              raceId: parsedInput.raceId,
              userId: athlete.userId,
              type: ResultType.FINISH,
            },
          },
          create: {
            raceId: parsedInput.raceId,
            userId: athlete.userId,
            type: ResultType.FINISH,
            position: finishPosition,
            points: finishPoints,
          },
          update: {
            position: finishPosition,
            points: finishPoints,
          },
        }),
        prisma.result.upsert({
          where: {
            raceId_userId_type: {
              raceId: parsedInput.raceId,
              userId: athlete.userId,
              type: ResultType.SPRINT_1,
            },
          },
          create: {
            raceId: parsedInput.raceId,
            userId: athlete.userId,
            type: ResultType.SPRINT_1,
            position: sprintPosition1,
            points: sprintPoints1,
          },
          update: {
            position: sprintPosition1,
            points: sprintPoints1,
          },
        }),
        prisma.result.upsert({
          where: {
            raceId_userId_type: {
              raceId: parsedInput.raceId,
              userId: athlete.userId,
              type: ResultType.SPRINT_2,
            },
          },
          create: {
            raceId: parsedInput.raceId,
            userId: athlete.userId,
            type: ResultType.SPRINT_2,
            position: sprintPosition2,
            points: sprintPoints2,
          },
          update: {
            position: sprintPosition2,
            points: sprintPoints2,
          },
        }),
        prisma.result.upsert({
          where: {
            raceId_userId_type: {
              raceId: parsedInput.raceId,
              userId: athlete.userId,
              type: ResultType.CLIMB_1,
            },
          },
          create: {
            raceId: parsedInput.raceId,
            userId: athlete.userId,
            type: ResultType.CLIMB_1,
            position: climbPosition1,
            points: climbPoints1,
          },
          update: {
            position: climbPosition1,
            points: climbPoints1,
          },
        }),
        prisma.result.upsert({
          where: {
            raceId_userId_type: {
              raceId: parsedInput.raceId,
              userId: athlete.userId,
              type: ResultType.CLIMB_2,
            },
          },
          create: {
            raceId: parsedInput.raceId,
            userId: athlete.userId,
            type: ResultType.CLIMB_2,
            position: climbPosition2,
            points: climbPoints2,
          },
          update: {
            position: climbPosition2,
            points: climbPoints2,
          },
        }),
      ]
    })

    await prisma.$transaction(operations)

    revalidatePath("/")
    revalidatePath("/race")
  })
