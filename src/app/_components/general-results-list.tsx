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
  points: number
}

type RankingItem = {
  userId: string
  userName: string
  points: number
}

type GeneralResultsListProps = {
  results: ResultItem[]
}

const sortByScore = (a: RankingItem, b: RankingItem) => {
  if (b.points !== a.points) return b.points - a.points
  return a.userName.localeCompare(b.userName)
}

const buildRanking = (results: ResultItem[], resultTypes: ResultType[]) => {
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
        })
        return
      }

      grouped.set(result.userId, {
        ...current,
        points: current.points + result.points,
      })
    })

  return [...grouped.values()].sort(sortByScore)
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
                  Sem resultados para classificação.
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

const GeneralResultsList = ({ results }: GeneralResultsListProps) => {
  const generalRanking = buildRanking(results, [ResultType.FINISH])
  const sprintRanking = buildRanking(results, [
    ResultType.SPRINT_1,
    ResultType.SPRINT_2,
  ])
  const climbRanking = buildRanking(results, [
    ResultType.CLIMB_1,
    ResultType.CLIMB_2,
  ])

  return (
    <div className="flex flex-col gap-4">
      <RankingTable title="Classificação Geral" ranking={generalRanking} />
      <RankingTable title="Classificação Sprint" ranking={sprintRanking} />
      <RankingTable title="Classificação Subida" ranking={climbRanking} />
    </div>
  )
}

export default GeneralResultsList
