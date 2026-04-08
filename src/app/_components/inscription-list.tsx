import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import prisma from "@/lib/prisma"

const InscriptionList = async () => {
  const inscriptions = await prisma.inscription.findMany({
    where: {
      activate: true,
    },
    include: {
      user: true,
      event: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  })
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Inscrição</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscriptions.map((inscription) => (
            <TableRow key={inscription.id}>
              <TableCell>{inscription.user.name}</TableCell>
              <TableCell>{inscription.event.title}</TableCell>
              <TableCell>
                {inscription.activate ? "Ativa" : "Inativa"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default InscriptionList
