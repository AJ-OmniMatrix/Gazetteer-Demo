import { ViewTransition } from "react"
import { getUserVisitsAction } from "@/app/actions"
import { ListView } from "@/components/ListView"

export default async function ListPage() {
  const visits = await getUserVisitsAction()

  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <ListView initialVisits={visits} />
    </ViewTransition>
  )
}
