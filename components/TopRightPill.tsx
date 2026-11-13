"use client"

import Link from "next/link"
import {
  Compass,
  HelpCircle,
  ListCheck,
  LogIn,
  LogOut,
  Search,
  User as UserIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import type { User } from "@/lib/types"

interface TopRightPillProps {
  user: User | null
  mode: "tidb" | "memory"
  visitedCount: number
  helpOpen: boolean
  onHelpOpenChange: (open: boolean) => void
  onOpenCommand: () => void
  onOpenAuth: () => void
  onLogout: () => void
}

export function TopRightPill({
  user,
  mode,
  visitedCount,
  helpOpen,
  onHelpOpenChange,
  onOpenCommand,
  onOpenAuth,
  onLogout,
}: TopRightPillProps) {
  const initials = user
    ? user.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "G"

  return (
    <>
      <div
        style={{ viewTransitionName: "top-right-pill" }}
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex items-center gap-1 rounded-full border border-border/80 bg-background/90 p-1 shadow-sm backdrop-blur-md"
      >
        {user ? (
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
                      {user.displayName}
                    </span>
                    {user.isDeveloper && (
                      <span className="py-0.2 rounded bg-primary/15 px-1 font-mono text-[9px] font-semibold text-primary uppercase">
                        Dev
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    @{user.handle} · {visitedCount} visited
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/list" />}>
                <ListCheck />
                <span>Your List</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/explore" />}>
                <Compass />
                <span>Explore Cities</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenCommand}>
                <Search />
                <span>Command Palette</span>
                <DropdownMenuShortcut>Ctrl K</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon />
                <span>
                  {mode === "tidb" ? "TiDB Connected" : "In-Memory Demo"}
                </span>
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

        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          aria-label="Help and keyboard shortcuts"
          onClick={() => onHelpOpenChange(true)}
        >
          <HelpCircle className="size-5" />
        </Button>
      </div>

      <Dialog open={helpOpen} onOpenChange={onHelpOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Using Gazetteer
            </DialogTitle>
            <DialogDescription className="text-balance">
              Track places you visit across cities and discover a featured
              destination every day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 rounded-2xl border bg-muted/40 p-3">
              <div>
                <p className="font-medium">Location of the Day</p>
                <p className="text-muted-foreground">
                  Open maps or tap + to add today&apos;s featured spot directly.
                </p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-2xl border bg-muted/40 p-3">
              <div>
                <p className="font-medium">Quick Check-In Dock</p>
                <p className="text-muted-foreground">
                  Tap the bottom + button to log via GPS coordinates or name
                  search.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border bg-muted/40 p-3">
              <span className="font-medium">Command Menu</span>
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
