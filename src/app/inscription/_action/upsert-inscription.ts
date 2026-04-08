"use server"

import { revalidatePath } from "next/cache"

import { actionClient } from "@/lib/next-safe-action"
import prisma from "@/lib/prisma"

import { inscriptionSchema } from "../schema"

export const upsertInscription = actionClient
  .inputSchema(inscriptionSchema)
  .action(async ({ parsedInput }) => {
    const event = await prisma.event.findFirst({
      where: {
        activate: true,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    if (!event) {
      throw new Error("Evento não encontrado")
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedInput.email,
      },
    })

    let userId: string

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          name: parsedInput.name,
          email: parsedInput.email,
          password: parsedInput.password || "",
        },
      })
      userId = user.id
    } else {
      userId = existingUser.id
    }

    await prisma.inscription.create({
      data: {
        activate: true,
        userId: userId,
        eventId: event.id,
      },
    })
    revalidatePath("/")
  })
