import prisma from "./lib/prisma"

async function main() {
  const event = await prisma.event.create({
    data: {
      title: "Tour do Noroeste",
      description: "Evento de Ciclismo",
      startDate: new Date("2026-04-09"),
      endDate: new Date("2026-05-28"),
      activate: true,
    },
  })

  const races = [
    {
      date: new Date("2026-04-09"),
      eventId: event.id,
    },
    {
      date: new Date("2026-04-10"),
      eventId: event.id,
    },
    {
      date: new Date("2026-04-16"),
      eventId: event.id,
    },
    {
      date: new Date("2026-04-23"),
      eventId: event.id,
    },
    {
      date: new Date("2026-04-30"),
      eventId: event.id,
    },
    {
      date: new Date("2026-05-07"),
      eventId: event.id,
    },
    {
      date: new Date("2026-05-14"),
      eventId: event.id,
    },
    {
      date: new Date("2026-05-21"),
      eventId: event.id,
    },
    {
      date: new Date("2026-05-28"),
      eventId: event.id,
    },
  ]

  for (const race of races) {
    await prisma.race.create({
      data: {
        date: race.date,
        eventId: race.eventId,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
