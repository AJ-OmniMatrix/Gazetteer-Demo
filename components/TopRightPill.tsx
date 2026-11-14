"use client"

import Link from "next/link"
import {
  Compass,
  HelpCircle,
  ListCheck,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"

interface TopRightPillProps {
  user: User | null
  mode?: "tidb" | "memory"
  visitedCount: number
  onHelpOpen: () => void
  onOpenAuth: () => void
  onLogout: () => void
}

export function TopRightPill({
  user,
  visitedCount,
  onHelpOpen,
  onOpenAuth,
  onLogout,
}: TopRightPillProps) {
  const initials = user
    ? user.isDeveloper
      ? "DEV"
      : user.displayName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
    : "G"

  return (
    <div
      data-tour="profile"
      style={{ viewTransitionName: "top-right-pill" }}
      className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex items-center gap-1 rounded-full border border-border/80 bg-background/90 p-1 shadow-sm backdrop-blur-md"
    >
      {user ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            aria-label="Interactive tutorial"
            onClick={onHelpOpen}
          >
            <HelpCircle className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full p-0"
                  aria-label="Open traveler profile"
                />
              }
            >
              <Avatar className="size-8">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {user.isDeveloper ? "@dev" : user.displayName}
                    </span>
                    {user.isDeveloper && (
                      <span className="rounded bg-primary/15 px-1 py-0.5 font-mono text-[9px] font-semibold text-primary uppercase">
                        Developer
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {user.isDeveloper ? "Developer" : `@${user.handle}`} ·{" "}
                    {visitedCount} visited
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/" />}>
                <Sparkles />
                <span>Location of the Day</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/list" />}>
                <ListCheck />
                <span>Your List</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/explore" />}>
                <Compass />
                <span>Explore Cities</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-1.5 rounded-full px-3 text-xs font-medium"
          onClick={onOpenAuth}
        >
          <LogIn className="size-4 text-primary" />
          <span>Sign In</span>
        </Button>
      )}
    </div>
  )
}
