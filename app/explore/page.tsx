import { ViewTransition } from "react"
import { ExploreView } from "@/components/ExploreView"

export default function ExplorePage() {
  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <ExploreView />
    </ViewTransition>
  )
}

