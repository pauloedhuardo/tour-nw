"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useMemo, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { upsertRaceResults } from "../_action/upsert-race-results"
import { raceResultsSchema } from "../schema"

type RaceResultType = "FINISH" | "SPRINT_1" | "SPRINT_2" | "CLIMB_1" | "CLIMB_2"

type RaceData = {
  id: string
  dateLabel: string
  eventTitle: string
  athletes: Array<{
    userId: string
    name: string
  }>
  results: Array<{
    userId: string
    type: RaceResultType
    position: number
  }>
}

type RaceResultsFormProps = {
  races: RaceData[]
}

type FormValues = z.infer<typeof raceResultsSchema>

const selectClassName =
  "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm"

const getAthleteDefaultPositions = (race: RaceData) => {
  const getPositionByType = (userId: string, type: RaceResultType) =>
    race.results.find(
      (result) => result.userId === userId && result.type === type,
    )?.position || undefined

  return race.athletes.map((athlete) => {
    return {
      userId: athlete.userId,
      finishPosition: getPositionByType(athlete.userId, "FINISH"),
      sprintPosition1: getPositionByType(athlete.userId, "SPRINT_1"),
      sprintPosition2: getPositionByType(athlete.userId, "SPRINT_2"),
      climbPosition1: getPositionByType(athlete.userId, "CLIMB_1"),
      climbPosition2: getPositionByType(athlete.userId, "CLIMB_2"),
    }
  })
}

const RaceResultsForm = ({ races }: RaceResultsFormProps) => {
  const initialRaceId = races[0]?.id ?? ""
  const [selectedRaceId, setSelectedRaceId] = useState(initialRaceId)

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId),
    [races, selectedRaceId],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(raceResultsSchema),
    defaultValues: {
      raceId: selectedRaceId,
      athletes: selectedRace ? getAthleteDefaultPositions(selectedRace) : [],
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "athletes",
  })

  useEffect(() => {
    if (!selectedRace) {
      replace([])
      form.setValue("raceId", "")
      return
    }

    replace(getAthleteDefaultPositions(selectedRace))
    form.setValue("raceId", selectedRace.id)
  }, [form, replace, selectedRace])

  const upsertRaceResultsAction = useAction(upsertRaceResults, {
    onSuccess: () => {
      toast.success("Resultados salvos com sucesso.")
      form.reset()
    },
    onError: () => {
      toast.error("Erro ao salvar os resultados.")
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await upsertRaceResultsAction.executeAsync(values)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="mt-10 w-full">
      <CardHeader>
        <CardTitle>Resultado da Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="race-results-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
            <Field data-invalid={!!form.formState.errors.raceId}>
              <FieldLabel htmlFor="raceId">Etapa</FieldLabel>
              <select
                id="raceId"
                className={cn(selectClassName)}
                value={selectedRaceId}
                onChange={(event) => setSelectedRaceId(event.target.value)}
                disabled={races.length === 0}
                aria-invalid={!!form.formState.errors.raceId}
              >
                {races.length === 0 ? (
                  <option value="">Nenhuma etapa disponível</option>
                ) : (
                  races.map((race) => (
                    <option key={race.id} value={race.id}>
                      {race.dateLabel} - {race.eventTitle}
                    </option>
                  ))
                )}
              </select>
              <FieldError errors={[form.formState.errors.raceId]} />
            </Field>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Chegada</TableHead>
                    <TableHead>Sprint 1</TableHead>
                    <TableHead>Sprint 2</TableHead>
                    <TableHead>Subida 1</TableHead>
                    <TableHead>Subida 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        Nenhum atleta inscrito para esta etapa.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          {selectedRace?.athletes[index]?.name ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`athletes.${index}.finishPosition`}
                            render={({ field: positionField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="-"
                                  value={positionField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    positionField.onChange(
                                      value === "" ? undefined : Number(value),
                                    )
                                  }}
                                  aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`athletes.${index}.sprintPosition1`}
                            render={({ field: positionField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="-"
                                  value={positionField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    positionField.onChange(
                                      value === "" ? undefined : Number(value),
                                    )
                                  }}
                                  aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`athletes.${index}.sprintPosition2`}
                            render={({ field: positionField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="-"
                                  value={positionField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    positionField.onChange(
                                      value === "" ? undefined : Number(value),
                                    )
                                  }}
                                  aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`athletes.${index}.climbPosition1`}
                            render={({ field: positionField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="-"
                                  value={positionField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    positionField.onChange(
                                      value === "" ? undefined : Number(value),
                                    )
                                  }}
                                  aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`athletes.${index}.climbPosition2`}
                            render={({ field: positionField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="-"
                                  value={positionField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    positionField.onChange(
                                      value === "" ? undefined : Number(value),
                                    )
                                  }}
                                  aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="race-results-form"
          className="w-full"
          disabled={form.formState.isSubmitting || races.length === 0}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Salvar resultados"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default RaceResultsForm
