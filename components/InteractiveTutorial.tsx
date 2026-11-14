"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  ListCheck,
  MapPin,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DURATION_ENTER, EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface InteractiveTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_PLACES = [
  { name: "Fushimi Inari-taisha", city: "Kyoto", cat: "Shrine" },
  { name: "Louvre Museum", city: "Paris", cat: "Museum" },
  { name: "Kinkaku-ji", city: "Kyoto", cat: "Temple" },
  { name: "Eiffel Tower", city: "Paris", cat: "Landmark" },
  { name: "Senso-ji", city: "Tokyo", cat: "Temple" },
]

export function InteractiveTutorial({
  open,
  onOpenChange,
}: InteractiveTutorialProps) {
  const [step, setStep] = useState(0)
  const [visitedDemo, setVisitedDemo] = useState(false)
  const [dockExpanded, setDockExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sheetPulled, setSheetPulled] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const markStepDone = (stepIdx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.add(stepIdx)
      return next
    })
  }

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1)
    } else {
      onOpenChange(false)
      setStep(0)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }

  const filteredPlaces = SAMPLE_PLACES.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="gap-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Interactive Tutorial ·{" "}
              {step < 4 ? `Step ${step + 1} of 4` : "Complete"}
            </span>
            {completedSteps.has(step) && step < 4 && (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 font-mono text-[10px] text-primary"
              >
                <Check className="mr-1 size-3" /> Step Tested
              </Badge>
            )}
          </div>
          <DialogTitle className="font-heading text-2xl font-semibold tracking-tight">
            {step === 0 && "1. Daily Destinations & Check-In"}
            {step === 1 && "2. Floating Dock Navigation"}
            {step === 2 && "3. Instant Prefix Search"}
            {step === 3 && "4. Kinetic Bottom Reveal"}
            {step === 4 && "You're All Set!"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
            {step === 0 &&
              "Every day showcases a curated destination. Try checking in right here in the sandbox."}
            {step === 1 &&
              "Your bottom dock is the primary control centre. Try expanding it to reveal action tools."}
            {step === 2 &&
              "Instant search indexes cities, categories, and place names in a pure TypeScript Prefix Trie."}
            {step === 3 &&
              "Pulling up from the bottom triggers a spring-loaded kinetic wordmark reveal."}
            {step === 4 &&
              "You now know all the superpowers of Gazetteer. Ready to start cataloguing?"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 py-1">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-200",
                step === i
                  ? "bg-primary"
                  : completedSteps.has(i)
                    ? "bg-primary/40"
                    : "bg-muted"
              )}
              aria-label={`Jump to tutorial step ${i + 1}`}
            />
          ))}
        </div>

        <div className="min-h-[17rem] py-2">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col gap-4 rounded-3xl border bg-card/60 p-4 shadow-2xs sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Shrine
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Kyoto, Japan
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-medium tracking-tight text-foreground">
                      Fushimi Inari-taisha
                    </h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      Famous Shinto shrine celebrated for its thousands of
                      vermilion torii gates winding through Mount Inari.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <Button
                      variant={visitedDemo ? "default" : "outline"}
                      className="h-10 rounded-full px-4 text-xs font-medium transition-all"
                      onClick={() => {
                        setVisitedDemo(!visitedDemo)
                        markStepDone(0)
                      }}
                    >
                      {visitedDemo ? (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>In Your List</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-4 text-primary" />
                          <span>Add to List</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <span>
                    {visitedDemo
                      ? "Awesome! The location has been recorded. Tap again anytime to toggle or undo."
                      : "Tap 'Add to List' above to experience optimistic check-in with Sonner feedback."}
                  </span>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col items-center justify-center gap-5 rounded-3xl border bg-card/60 p-5 shadow-2xs"
              >
                <p className="text-center text-xs text-muted-foreground">
                  Tap the central plus button to toggle actions:
                </p>

                <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background p-1.5 shadow-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full"
                    aria-label="List"
                  >
                    <ListCheck className="size-4" />
                  </Button>

                  <Button
                    variant={dockExpanded ? "ghost" : "default"}
                    size="icon"
                    className="size-10 rounded-full shadow-xs"
                    onClick={() => {
                      setDockExpanded(!dockExpanded)
                      markStepDone(1)
                    }}
                    aria-label="Expand dock"
                  >
                    <motion.div
                      animate={{ rotate: dockExpanded ? 45 : 0 }}
                      transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                    >
                      <Plus className="size-4" />
                    </motion.div>
                  </Button>

                  <AnimatePresence>
                    {dockExpanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0, scale: 0.8 }}
                        animate={{ opacity: 1, width: "auto", scale: 1 }}
                        exit={{ opacity: 0, width: 0, scale: 0.8 }}
                        transition={{
                          duration: DURATION_ENTER,
                          ease: EASE_OUT,
                        }}
                        className="flex items-center gap-1 overflow-hidden"
                      >
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-10 rounded-full"
                          aria-label="GPS Near Me"
                        >
                          <MapPin className="size-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-10 rounded-full"
                          aria-label="Quick Search"
                        >
                          <Search className="size-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full"
                    aria-label="Explore"
                  >
                    <Compass className="size-4" />
                  </Button>
                </div>

                <div className="flex w-full items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <span>
                    {dockExpanded
                      ? "Great! The GPS coordinates scanner and instant search tools are now visible."
                      : "The middle button triggers smooth rotation and expands secondary GPS & search shortcuts."}
                  </span>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col gap-3 rounded-3xl border bg-card/60 p-4 shadow-2xs sm:p-5"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search places, cities, categories..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      markStepDone(2)
                    }}
                    className="h-10 rounded-2xl pl-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Quick test:
                  </span>
                  {["Kyoto", "Paris", "Temple", "Museum"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag)
                        markStepDone(2)
                      }}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors",
                        searchQuery.toLowerCase() === tag.toLowerCase()
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="rounded-full px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-28 divide-y divide-border/60 overflow-y-auto rounded-2xl border bg-background/50">
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {p.name}
                          </span>
                          <span className="text-muted-foreground">
                            ({p.city})
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {p.cat}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No matching destinations found
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col items-center justify-center gap-4 rounded-3xl border bg-card/60 p-5 shadow-2xs"
              >
                <div className="relative flex h-28 w-full flex-col justify-end overflow-hidden rounded-2xl border bg-accent/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-3xl font-bold tracking-widest text-primary uppercase opacity-80 select-none sm:text-4xl">
                      GAZETTEER
                    </span>
                  </div>

                  <motion.div
                    animate={{ y: sheetPulled ? -48 : 0 }}
                    transition={{ type: "spring", damping: 18, stiffness: 220 }}
                    className="relative z-10 flex h-24 cursor-pointer items-center justify-center rounded-2xl border-t bg-background px-4 text-center shadow-md"
                    onClick={() => {
                      setSheetPulled(!sheetPulled)
                      markStepDone(3)
                    }}
                  >
                    <p className="text-xs font-medium text-foreground">
                      {sheetPulled
                        ? "Kinetic reveal active! Tap to snap back."
                        : "Tap here to simulate pulling the sheet upward."}
                    </p>
                  </motion.div>
                </div>

                <div className="flex w-full items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <span>
                    On every page, dragging or scrolling past the bottom reveals
                    the brand wordmark with spring physics.
                  </span>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col items-center justify-center gap-4 rounded-3xl border bg-card/60 p-6 text-center shadow-2xs"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                    Tutorial Completed!
                  </h3>
                  <p className="max-w-xs text-xs text-muted-foreground sm:text-sm">
                    You have mastered location check-ins, dock tools, prefix
                    search, and the kinetic gravity reveal.
                  </p>
                </div>
                <Button
                  className="h-11 rounded-full px-6 text-xs font-medium"
                  onClick={() => {
                    onOpenChange(false)
                    setStep(0)
                  }}
                >
                  <Sparkles className="size-4" />
                  <span>Start Exploring Gazetteer</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          {step > 0 && step < 4 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1 rounded-full px-3 text-xs"
              onClick={handleBack}
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-3 text-xs text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              Skip
            </Button>
          )}

          {step < 4 && (
            <Button
              size="sm"
              className="h-9 gap-1 rounded-full px-4 text-xs font-medium"
              onClick={handleNext}
            >
              <span>{step === 3 ? "Review" : "Next"}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
