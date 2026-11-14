"use client"

import { useState } from "react"
import { Code2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  developerLoginAction,
  loginAction,
  registerAction,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  promptMessage?: string | null
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [handle, setHandle] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loadingDev, setLoadingDev] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDeveloperLogin(devHandle: string) {
    try {
      setLoadingDev(devHandle)
      const res = await developerLoginAction(devHandle)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Failed to log in as developer")
      }
      toast.success("Signed in as @dev")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Developer login failed")
    } finally {
      setLoadingDev(null)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim()) {
      toast.error("Please enter your username")
      return
    }
    try {
      setLoading(true)
      const res = await loginAction(handle)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Sign-in failed")
      }
      toast.success(`Signed in as @${res.user.handle}`)
      onOpenChange(false)
      setHandle("")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim()) {
      toast.error("Please choose a username")
      return
    }
    try {
      setLoading(true)
      const res = await registerAction(handle, displayName)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Sign-up failed")
      }
      toast.success(`Welcome, @${res.user.handle}!`)
      onOpenChange(false)
      setHandle("")
      setDisplayName("")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-medium">
            {tab === "signin" ? "Sign In" : "Sign Up"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {tab === "signin"
              ? "Sign in to your account"
              : "Create a new account"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
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

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Or
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
            <Button
              type="button"
              variant={tab === "signin" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-full text-xs font-medium shadow-none"
              onClick={() => setTab("signin")}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={tab === "signup" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-full text-xs font-medium shadow-none"
              onClick={() => setTab("signup")}
            >
              Sign Up
            </Button>
          </div>

          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="auth-signin-handle"
                  className="text-xs font-medium"
                >
                  Username
                </label>
                <Input
                  id="auth-signin-handle"
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
                className="mt-1 min-h-10 rounded-full font-medium"
                disabled={loading || loadingDev !== null || !handle.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="auth-signup-handle"
                  className="text-xs font-medium"
                >
                  Username
                </label>
                <Input
                  id="auth-signup-handle"
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
                  htmlFor="auth-signup-name"
                  className="text-xs font-medium"
                >
                  Display Name (Optional)
                </label>
                <Input
                  id="auth-signup-name"
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading || loadingDev !== null}
                  className="h-10 rounded-2xl"
                />
              </div>

              <Button
                type="submit"
                className="mt-1 min-h-10 rounded-full font-medium"
                disabled={loading || loadingDev !== null || !handle.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
