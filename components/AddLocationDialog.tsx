"use client"

import { useState } from "react"
import { Crosshair, Loader2, MapPin, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { addPlaceAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AddLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = [
  { slug: "landmark", label: "Landmark" },
  { slug: "museum", label: "Museum" },
  { slug: "national_park", label: "Park" },
  { slug: "cafe", label: "Cafe" },
  { slug: "mall", label: "Mall" },
]

export function AddLocationDialog({
  open,
  onOpenChange,
}: AddLocationDialogProps) {
  const [name, setName] = useState("")
  const [cityName, setCityName] = useState("")
  const [categorySlug, setCategorySlug] = useState("landmark")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.")
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setLat(latitude.toFixed(6))
        setLng(longitude.toFixed(6))
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          if (res.ok) {
            const data = await res.json()
            const foundCity =
              data.city || data.locality || data.principalSubdivision
            if (foundCity && !cityName) {
              setCityName(foundCity)
            }
          }
        } catch {}
        setGpsLoading(false)
        toast.success("Location coordinates captured.")
      },
      () => {
        setGpsLoading(false)
        toast.error("Could not obtain GPS location.")
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !cityName.trim() || !lat.trim() || !lng.trim()) {
      toast.error("Please fill in name, city, latitude, and longitude.")
      return
    }
    const latitude = Number(lat)
    const longitude = Number(lng)
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Latitude and longitude must be valid numbers.")
      return
    }

    setLoading(true)
    try {
      const res = await addPlaceAction({
        name: name.trim(),
        cityName: cityName.trim(),
        categorySlug,
        lat: latitude,
        lng: longitude,
        description: description.trim(),
      })

      if (res.ok) {
        toast.success(
          `Added "${name}"! Automatically pulled ${res.photoCount ?? 0} photos.`
        )
        setName("")
        setCityName("")
        setLat("")
        setLng("")
        setDescription("")
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to add location.")
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add location."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <DialogTitle className="text-lg font-semibold">
              Add New Location
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Save a spot to the catalog. High-resolution images and BlurHash
            previews are fetched automatically from the web.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Location Name
            </label>
            <Input
              required
              placeholder="e.g. Hawa Mahal, Taj Mahal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                City
              </label>
              <Input
                required
                placeholder="e.g. Jaipur, Delhi"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Category
              </label>
              <div className="flex gap-1 overflow-x-auto py-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setCategorySlug(cat.slug)}
                    disabled={loading}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      categorySlug === cat.slug
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Coordinates
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDetectGps}
                disabled={loading || gpsLoading}
                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {gpsLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Crosshair className="size-3" />
                )}
                Use GPS
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                required
                type="number"
                step="any"
                placeholder="Latitude (e.g. 26.9239)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={loading}
                className="font-mono text-xs"
              />
              <Input
                required
                type="number"
                step="any"
                placeholder="Longitude (e.g. 75.8267)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                disabled={loading}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Description (Optional)
            </label>
            <Input
              placeholder="Short blurb describing this destination..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Pulling Images & Saving...
                </>
              ) : (
                <>
                  <MapPin className="size-4" />
                  Add Location
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
