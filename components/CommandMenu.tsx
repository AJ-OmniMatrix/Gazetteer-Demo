"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Compass,
  HelpCircle,
  ListCheck,
  MapPin,
  Search,
} from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { PrefixTrie } from "@/lib/ads/trie"
import type { PlaceSummary } from "@/lib/types"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  places: PlaceSummary[]
  visitedSet: Set<number>
  onOpenGps: () => void
  onOpenSearch: () => void
  onOpenHelp: () => void
  onCheckIn: (place: PlaceSummary) => void
}

export function CommandMenu({
  open,
  onOpenChange,
  places,
  visitedSet,
  onOpenGps,
  onOpenSearch,
  onOpenHelp,
  onCheckIn,
}: CommandMenuProps) {
  const router = useRouter()

  const trie = useMemo(
    () =>
      new PrefixTrie(
        places,
        (p) => `${p.name} ${p.cityName} ${p.countryName} ${p.categoryLabel}`
      ),
    [places]
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const closeAndRun = (fn: () => void) => {
    onOpenChange(false)
    fn()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Gazetteer Command Palette"
      description="Jump to pages or check in to a place."
    >
      <Command
        filter={(value, search) => {
          if (!search.trim()) {
            return 1
          }
          const matches = trie.search(search, 50)
          if (matches.some((p) => String(p.id) === value)) {
            return 1
          }
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
        }}
      >
        <CommandInput placeholder="Search places, cities, or actions..." />
        <CommandList>
          <CommandEmpty>No matching place or command.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              value="action-gps"
              onSelect={() => closeAndRun(onOpenGps)}
            >
              <MapPin />
              <span>Check in via GPS</span>
            </CommandItem>
            <CommandItem
              value="action-search"
              onSelect={() => closeAndRun(onOpenSearch)}
            >
              <Search />
              <span>Search location to add</span>
            </CommandItem>
            <CommandItem
              value="action-list"
              onSelect={() => closeAndRun(() => router.push("/list"))}
            >
              <ListCheck />
              <span>Open Your List</span>
              <CommandShortcut>/list</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="action-explore"
              onSelect={() => closeAndRun(() => router.push("/explore"))}
            >
              <Compass />
              <span>Explore Cities</span>
              <CommandShortcut>/explore</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="action-help"
              onSelect={() => closeAndRun(onOpenHelp)}
            >
              <HelpCircle />
              <span>Help & Shortcuts</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Places">
            {places.map((place) => {
              const visited = visitedSet.has(place.id)
              return (
                <CommandItem
                  key={place.id}
                  value={String(place.id)}
                  onSelect={() => closeAndRun(() => onCheckIn(place))}
                >
                  {visited ? <Check className="text-primary" /> : <MapPin />}
                  <span className="truncate">{place.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {place.cityName}
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
