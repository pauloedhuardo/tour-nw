import Header from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import InscriptionList from "./_components/inscription-list"

export default function Home() {
  return (
    <div className="p-5">
      <Header />

      <div className="flex flex-col items-center gap-4 pt-10">
        <Tabs defaultValue="in" className="w-full">
          <TabsList>
            <TabsTrigger value="gc">Classificação Geral</TabsTrigger>
            <TabsTrigger value="rc">Resultado Race</TabsTrigger>
            <TabsTrigger value="in">Inscritos</TabsTrigger>
          </TabsList>
          <TabsContent value="gc">Em breve</TabsContent>
          <TabsContent value="rc">Em breve</TabsContent>
          <TabsContent value="in">
            <InscriptionList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
