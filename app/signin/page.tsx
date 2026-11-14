import { ViewTransition } from "react"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { SignInView } from "@/components/SignInView"

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>
}) {
  const user = await getSessionUser()
  if (user) {
    redirect("/list")
  }

  const params = searchParams ? await searchParams : undefined
  const redirectPath = params?.redirect || "/list"

  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <SignInView redirectPath={redirectPath} />
    </ViewTransition>
  )
}
