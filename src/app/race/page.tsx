import Header from "@/components/header"
import prisma from "@/lib/prisma"

import RaceResultsForm from "./_components/race-results-form"

const RacePage = async () => {
  const races = await prisma.race.findMany({
    include: {
      event: {
        select: {
          title: true,
          inscriptions: {
            where: {
              activate: true,
            },
            orderBy: {
              user: {
                name: "asc",
              },
            },
            select: {
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      results: {
        select: {
          userId: true,
          type: true,
          position: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  const raceOptions = races.map((race) => ({
    id: race.id,
    dateLabel: race.date.toLocaleDateString("pt-BR"),
    eventTitle: race.event.title,
    athletes: race.event.inscriptions.map((inscription) => ({
      userId: inscription.userId,
      name: inscription.user.name,
    })),
    results: race.results.map((result) => ({
      userId: result.userId,
      type: result.type,
      position: result.position,
    })),
  }))

  return (
    <div className="p-5">
      <Header />
      <RaceResultsForm races={raceOptions} />
    </div>
  )
}

export default RacePage
