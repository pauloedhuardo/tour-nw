import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prisma from "@/lib/prisma"

import GeneralResultsList from "./_components/general-results-list"
import InscriptionList from "./_components/inscription-list"
import RaceResultsList from "./_components/race-results-list"

export default async function Home() {
  const races = await prisma.race.findMany({
    include: {
      event: {
        select: {
          title: true,
        },
      },
      results: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
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
    results: race.results.map((result) => ({
      userId: result.userId,
      userName: result.user.name,
      type: result.type,
      position: result.position,
      points: result.points,
    })),
  }))

  const allResults = raceOptions.flatMap((race) => race.results)

  return (
    <div className="p-5">
      <Header />

      <div className="flex flex-col items-center gap-4 pt-10">
        <Tabs defaultValue="gc" className="w-full">
          <TabsList>
            <TabsTrigger value="gc">Classificação Geral</TabsTrigger>
            <TabsTrigger value="rc">Resultado Etapa</TabsTrigger>
            <TabsTrigger value="in">Inscritos</TabsTrigger>
          </TabsList>
          <TabsContent value="gc">
            <GeneralResultsList results={allResults} />
          </TabsContent>
          <TabsContent value="rc">
            <RaceResultsList races={raceOptions} />
          </TabsContent>
          <TabsContent value="in">
            <InscriptionList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
