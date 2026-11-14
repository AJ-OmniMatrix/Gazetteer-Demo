import fs from "node:fs"
import path from "node:path"
import { encode } from "blurhash"
import sharp from "sharp"
import type { SeedPhoto } from "@/db/seed-data"

export interface ImageCandidate {
  url: string
  title?: string
  width?: number
  height?: number
}

async function searchGoogleApi(
  query: string,
  count: number
): Promise<ImageCandidate[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY
  const cx =
    process.env.GOOGLE_SEARCH_ENGINE_ID ||
    process.env.GOOGLE_CX ||
    process.env.GOOGLE_SEARCH_CX
  if (!apiKey || !cx) return []

  try {
    const url = `https://www.googleapis.com/customsearch/v1?searchType=image&key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&num=${Math.min(Math.max(count, 1), 10)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data.items)) return []
    return data.items
      .filter((item: { link?: string }) => Boolean(item.link))
      .map(
        (item: {
          link: string
          title?: string
          image?: { width?: number; height?: number }
        }) => ({
          url: item.link,
          title: item.title,
          width: item.image?.width,
          height: item.image?.height,
        })
      )
  } catch {
    return []
  }
}

async function searchDuckDuckGo(
  query: string,
  count: number
): Promise<ImageCandidate[]> {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const vqdMatch = html.match(/vqd=([\d-]+)/)
    if (!vqdMatch) return []
    const vqd = vqdMatch[1]

    const apiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`
    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://duckduckgo.com/",
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!apiRes.ok) return []
    const data = await apiRes.json()
    if (!Array.isArray(data.results)) return []
    return data.results
      .filter((r: { image?: string }) => Boolean(r.image))
      .slice(0, count)
      .map(
        (r: {
          image: string
          title?: string
          width?: number
          height?: number
        }) => ({
          url: r.image,
          title: r.title,
          width: r.width,
          height: r.height,
        })
      )
  } catch {
    return []
  }
}

async function searchWikimedia(
  query: string,
  count: number
): Promise<ImageCandidate[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${count}&piprop=original|thumbnail&pithumbsize=1200`
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "GazetteerBot/1.0 (https://gazetteer.demo; contact@gazetteer.app)",
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!data.query?.pages) return []
    const pages = Object.values(
      data.query.pages as Record<
        string,
        {
          title?: string
          original?: { source?: string; width?: number; height?: number }
          thumbnail?: { source?: string; width?: number; height?: number }
        }
      >
    )
    return pages
      .filter((p) => Boolean(p.original?.source || p.thumbnail?.source))
      .map((p) => {
        const src = p.original || p.thumbnail
        return {
          url: src!.source!,
          title: p.title,
          width: src?.width,
          height: src?.height,
        }
      })
  } catch {
    return []
  }
}

export async function searchPlaceImages(
  query: string,
  count = 4
): Promise<ImageCandidate[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const collected: ImageCandidate[] = []
  const seenUrls = new Set<string>()

  const collect = async (q: string) => {
    const googleResults = await searchGoogleApi(q, count)
    for (const item of googleResults) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url)
        collected.push(item)
      }
    }

    if (collected.length < count) {
      const ddgResults = await searchDuckDuckGo(q, count - collected.length + 2)
      for (const item of ddgResults) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url)
          collected.push(item)
        }
      }
    }

    if (collected.length < count) {
      const wikiResults = await searchWikimedia(q, count - collected.length + 2)
      for (const item of wikiResults) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url)
          collected.push(item)
        }
      }
    }
  }

  await collect(cleanQuery)

  if (collected.length === 0 && cleanQuery.includes(" ")) {
    const words = cleanQuery.split(/\s+/)
    if (words.length > 2) {
      await collect(`${words[0]} ${words[words.length - 1]}`)
    }
  }

  return collected.slice(0, count)
}

export async function downloadAndProcessImage(
  url: string,
  destFolder: string,
  destFilename: string
): Promise<SeedPhoto | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "GazetteerBot/1.0 (https://gazetteer.demo; contact@gazetteer.app) Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 1024) return null

    fs.mkdirSync(destFolder, { recursive: true })
    const fullDest = path.join(destFolder, destFilename)

    await sharp(buffer)
      .rotate()
      .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(fullDest)

    const meta = await sharp(fullDest).metadata()
    const width = meta.width ?? 1200
    const height = meta.height ?? 800

    const { data, info } = await sharp(fullDest)
      .resize(32, 32, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      3
    )

    const relPosix = path
      .relative(path.join(process.cwd(), "public"), fullDest)
      .split(path.sep)
      .join("/")

    return {
      imageUrl: `/${relPosix}`,
      blurhash,
      width,
      height,
    }
  } catch {
    return null
  }
}
