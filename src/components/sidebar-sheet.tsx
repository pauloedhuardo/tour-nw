"use client"

import { HomeIcon, UserPlus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const SideBarSheet = () => {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-2 border-b border-solid">
        <SheetClose asChild>
          <Link href="/">
            <Button className="justify-start gap-2" variant="ghost">
              <HomeIcon size={18} />
              Início
            </Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link href="/inscription">
            <Button className="justify-start gap-2" variant="ghost">
              <UserPlus size={18} />
              Inscrição
            </Button>
          </Link>
        </SheetClose>
      </div>
    </SheetContent>
  )
}

export default SideBarSheet
