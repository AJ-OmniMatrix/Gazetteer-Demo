import { ViewTransition } from "react"
import { ListView } from "@/components/ListView"

export default function ListPage() {
  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <ListView />
    </ViewTransition>
  )
}
