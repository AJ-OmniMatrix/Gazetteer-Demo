"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, AlertCircle, Code2, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  developerLoginAction,
  loginAction,
  registerAction,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SignInViewProps {
  redirectPath?: string
  initialTab?: "signin" | "signup"
}

export function SignInView({
  redirectPath = "/list",
  initialTab = "signin",
}: SignInViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<"signin" | "signup">(initialTab)
  const [handle, setHandle] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loadingDev, setLoadingDev] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function completeAuth(message: string) {
    toast.success(message)
    await queryClient.invalidateQueries({ queryKey: ["catalog"] })
    await queryClient.invalidateQueries({ queryKey: ["user-visits"] })
    router.push(redirectPath)
    router.refresh()
  }

  async function handleDeveloperLogin(devHandle: string) {
    try {
      setLoadingDev(devHandle)
      const res = await developerLoginAction(devHandle)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Failed to log in as developer")
      }
      await completeAuth("Signed in as @dev")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Developer login failed")
    } finally {
      setLoadingDev(null)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    const clean = handle.trim()
    if (!clean) {
      toast.error("Please enter your username")
      return
    }
    try {
      setLoading(true)
      const res = await loginAction(clean)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Sign-in failed")
      }
      setHandle("")
      await completeAuth(`Signed in as @${res.user.handle}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed"
      toast.error(msg)
      if (msg.toLowerCase().includes("please sign up")) {
        setTab("signup")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    const clean = handle.trim()
    if (!clean) {
      toast.error("Please choose a username")
      return
    }
    try {
      setLoading(true)
      const res = await registerAction(clean, displayName)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Sign-up failed")
      }
      setHandle("")
      setDisplayName("")
      await completeAuth(`Welcome, @${res.user.handle}!`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-up failed"
      toast.error(msg)
      if (msg.toLowerCase().includes("please sign in")) {
        setTab("signin")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-md flex-col justify-center px-4 py-8 sm:px-0">
      <div className="mb-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          nativeButton={false}
          render={<Link href="/" prefetch={true} />}
        >
          <ArrowLeft className="size-4" />
          <span>Home</span>
        </Button>
      </div>

      <div className="flex flex-col gap-5 rounded-4xl border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-1.5 text-center">
          <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {tab === "signin" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {tab === "signin"
              ? "Access your personal catalogue and track your visits"
              : "Create an account to start your personal catalogue"}
          </p>
        </div>

        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="h-10 w-full justify-center gap-2 rounded-2xl"
            disabled={loadingDev !== null || loading}
            onClick={() => handleDeveloperLogin("dev")}
          >
            {loadingDev === "dev" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Code2 className="size-4 text-primary" />
            )}
            <span className="font-mono text-xs font-medium">
              Continue as @dev
            </span>
          </Button>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-center">
            <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
            <p className="font-mono text-[11px] text-amber-900/80 dark:text-amber-200/80">
              @dev data resets on session close / logging out
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Or
          </span>
        </div>

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dedicated-signin-handle"
                className="text-xs font-medium"
              >
                Username
              </label>
              <Input
                id="dedicated-signin-handle"
                placeholder="e.g. wanderer"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={loading || loadingDev !== null}
                className="h-10 rounded-2xl"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="mt-1 h-10 w-full rounded-2xl font-medium"
              disabled={loading || loadingDev !== null}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </Button>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dedicated-signup-handle"
                className="text-xs font-medium"
              >
                Username
              </label>
              <Input
                id="dedicated-signup-handle"
                placeholder="e.g. wanderer"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={loading || loadingDev !== null}
                className="h-10 rounded-2xl"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dedicated-signup-name"
                className="text-xs font-medium"
              >
                Display Name (Optional)
              </label>
              <Input
                id="dedicated-signup-name"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading || loadingDev !== null}
                className="h-10 rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="mt-1 h-10 w-full rounded-2xl font-medium"
              disabled={loading || loadingDev !== null}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Sign Up</span>
              )}
            </Button>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
