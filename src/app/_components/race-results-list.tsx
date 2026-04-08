"use client"

import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResultType } from "@/generated/prisma/enums"

type ResultItem = {
  userId: string
  userName: string
  type: ResultType
  position: number
  points: number
}

type RaceItem = {
  id: string
  dateLabel: string
  eventTitle: string
  results: ResultItem[]
}

type RankingItem = {
  userId: string
  userName: string
  points: number
  bestPosition: number
}

type RaceResultsListProps = {
  races: RaceItem[]
}

const selectClassName =
  "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm"

const sortByScore = (a: RankingItem, b: RankingItem) => {
  if (b.points !== a.points) return b.points - a.points
  if (a.bestPosition !== b.bestPosition) return a.bestPosition - b.bestPosition
  return a.userName.localeCompare(b.userName)
}

const buildRanking = (
  results: ResultItem[],
  resultTypes: ResultType[],
  usePositionTieBreak = false,
) => {
  const grouped = new Map<string, RankingItem>()

  results
    .filter((result) => resultTypes.includes(result.type))
    .forEach((result) => {
      const current = grouped.get(result.userId)
      if (!current) {
        grouped.set(result.userId, {
          userId: result.userId,
          userName: result.userName,
          points: result.points,
          bestPosition: result.position,
        })
        return
      }

      grouped.set(result.userId, {
        ...current,
        points: current.points + result.points,
        bestPosition: usePositionTieBreak
          ? Math.min(current.bestPosition, result.position)
          : 999,
      })
    })

  const values = [...grouped.values()]
  return values.sort(sortByScore)
}

const RankingTable = ({
  title,
  ranking,
}: {
  title: string
  ranking: RankingItem[]
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Atleta</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Sem resultados para esta etapa.
                </TableCell>
              </TableRow>
            ) : (
              ranking.map((item, index) => (
                <TableRow key={item.userId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell className="text-right">{item.points}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const RaceResultsList = ({ races }: RaceResultsListProps) => {
  const [selectedRaceId, setSelectedRaceId] = useState(races[0]?.id ?? "")

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId),
    [races, selectedRaceId],
  )

  const finishRanking = useMemo(() => {
    if (!selectedRace) return []
    return buildRanking(selectedRace.results, [ResultType.FINISH], true)
  }, [selectedRace])

  const sprintRanking = useMemo(() => {
    if (!selectedRace) return []
    return buildRanking(selectedRace.results, [
      ResultType.SPRINT_1,
      ResultType.SPRINT_2,
    ])
  }, [selectedRace])

  const climbRanking = useMemo(() => {
    if (!selectedRace) return []
    return buildRanking(selectedRace.results, [
      ResultType.CLIMB_1,
      ResultType.CLIMB_2,
    ])
  }, [selectedRace])

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            id="race-filter"
            className={selectClassName}
            value={selectedRaceId}
            onChange={(event) => setSelectedRaceId(event.target.value)}
            disabled={races.length === 0}
          >
            {races.length === 0 ? (
              <option value="">Nenhuma etapa cadastrada</option>
            ) : (
              races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.dateLabel} - {race.eventTitle}
                </option>
              ))
            )}
          </select>
        </CardContent>
      </Card>

      <RankingTable title="Classificação Geral" ranking={finishRanking} />
      <RankingTable title="Classificação Sprint" ranking={sprintRanking} />
      <RankingTable title="Classificação Subida" ranking={climbRanking} />
    </div>
  )
}

export default RaceResultsList
