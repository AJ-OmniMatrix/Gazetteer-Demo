import { ViewTransition } from "react"
import { redirect } from "next/navigation"
import { getUserVisitsAction } from "@/app/actions"
import { ListView } from "@/components/ListView"
import { getSessionUser } from "@/lib/auth"

export default async function ListPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect("/signin")
  }
  const visits = await getUserVisitsAction()

  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <ListView initialVisits={visits} />
    </ViewTransition>
  )
}
