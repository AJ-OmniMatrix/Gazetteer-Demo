"use client"

import { useState } from "react"
import {
  RiCodeSSlashLine,
  RiFlashlightLine,
  RiLoader4Line,
  RiUserFollowLine,
  RiUserLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { developerLoginAction, loginOrRegisterAction } from "@/app/actions"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  promptMessage?: string | null
}

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
  promptMessage,
}: AuthDialogProps) {
  const [handle, setHandle] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loadingDev, setLoadingDev] = useState<string | null>(null)
  const [loadingCustom, setLoadingCustom] = useState(false)

  async function handleDeveloperLogin(devHandle: string) {
    try {
      setLoadingDev(devHandle)
      const res = await developerLoginAction(devHandle)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Failed to log in as developer")
      }
      toast.success(`Welcome back, ${res.user.displayName}!`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Developer login failed")
    } finally {
      setLoadingDev(null)
    }
  }

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim()) {
      toast.error("Please enter a username or handle")
      return
    }
    try {
      setLoadingCustom(true)
      const res = await loginOrRegisterAction(handle, displayName)
      if (!res.ok || !res.user) {
        throw new Error(res.error ?? "Failed to sign in")
      }
      toast.success(`Signed in as @${res.user.handle}`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed")
    } finally {
      setLoadingCustom(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <RiUserLine className="size-5" />
            <span className="font-mono text-xs tracking-wider uppercase">
              Authentication
            </span>
          </div>
          <DialogTitle className="font-heading text-2xl font-medium">
            Sign In to Gazetteer
          </DialogTitle>
          <DialogDescription className="text-balance">
            {promptMessage ??
              "Track your visited locations, save places to your list, and unlock your personal travel stats."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2.5 rounded-3xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <RiFlashlightLine className="size-4" />
              <span>Instant Test Logins</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select a pre-seeded account to test personal list isolation
              without passwords:
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start gap-2 rounded-2xl bg-background/80"
                disabled={loadingDev !== null || loadingCustom}
                onClick={() => handleDeveloperLogin("aarav")}
              >
                {loadingDev === "aarav" ? (
                  <RiLoader4Line className="size-4 animate-spin" />
                ) : (
                  <RiCodeSSlashLine className="size-4 text-primary" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium">Aarav Sen</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    @aarav (Dev)
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 rounded-2xl bg-background/80"
                disabled={loadingDev !== null || loadingCustom}
                onClick={() => handleDeveloperLogin("maya")}
              >
                {loadingDev === "maya" ? (
                  <RiLoader4Line className="size-4 animate-spin" />
                ) : (
                  <RiUserFollowLine className="size-4 text-amber-600" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium">Maya Lin</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    @maya (Tester)
                  </span>
                </div>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Or Custom Account
            </span>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-handle"
                className="text-xs font-medium text-foreground"
              >
                Handle / Username
              </label>
              <Input
                id="auth-handle"
                placeholder="e.g. travel_lover"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={loadingCustom || loadingDev !== null}
                className="rounded-2xl"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-display-name"
                className="text-xs font-medium text-foreground"
              >
                Display Name (Optional)
              </label>
              <Input
                id="auth-display-name"
                placeholder="e.g. Alex River"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loadingCustom || loadingDev !== null}
                className="rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="mt-1 min-h-11 rounded-full font-medium"
              disabled={loadingCustom || loadingDev !== null || !handle.trim()}
            >
              {loadingCustom ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Continue to Gazetteer</span>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
