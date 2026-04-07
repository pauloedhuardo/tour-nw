"use client"

import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"

import SideBarSheet from "../sidebar-sheet"

const Header = () => {
  return (
    <>
      <Card>
        <CardContent className="flex h-10 flex-row items-center justify-between p-5">
          <h1 className="text-3xl font-bold">Tour Noroeste 2026</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SideBarSheet />
          </Sheet>
        </CardContent>
      </Card>
    </>
  )
}

export default Header
