"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

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
import Header from "@/components/ui/header"
import { Input } from "@/components/ui/input"

import { upsertInscription } from "./_action/upsert-inscription"
import { inscriptionSchema } from "./schema"

const InscriptionPage = () => {
  const form = useForm<z.infer<typeof inscriptionSchema>>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const upsertInscriptionAction = useAction(upsertInscription, {
    onSuccess: () => {
      toast.success("Inscrição realizada com sucesso.")
    },
    onError: () => {
      toast.error("Erro na transação!.")
    },
  })

  const onSubmit = (values: z.infer<typeof inscriptionSchema>) => {
    try {
      upsertInscriptionAction.execute({
        ...values,
        id: values.id || undefined,
      })
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="p-5">
      <Header />

      <Card className="mt-10 w-full">
        <CardHeader className="flex justify-between">
          <CardTitle>Inscrição</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="inscription-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="flex flex-col gap-6">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Seu nome"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      placeholder="Seu email"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="inscription-form"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Enviar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InscriptionPage
