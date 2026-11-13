# Gazetteer-Demo

Personal travel catalogue and location tracker built with Next.js, TiDB Cloud, Tailwind CSS, and shadcn/ui.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Adding Locations & Images

Images are stored directly in the repository under `public/images/places/<slug>/` and served statically.

When adding a location, image dimensions (`width`, `height`) and `blurhash` placeholders are automatically generated via `sharp` and `blurhash`.

### Option 1: Interactive CLI (Recommended)

Run the location addition wizard:

```bash
npm run location:add
```

Follow the interactive prompts:

1. **Location name** (e.g., `Senso-ji`)
2. **City name** (e.g., `Tokyo`)
3. **Country name** & **2-letter code** (e.g., `Japan`, `JP`)
4. **Category** (`landmark`, `national_park`, `museum`, `cafe`, `mall`)
5. **Coordinates** (`lat`, `lng`)
6. **Description**
7. **Image file paths**: Paste one or more local image paths separated by commas (e.g., `C:\Photos\sensoji1.jpg, C:\Photos\sensoji2.jpg`), or press Enter if already placed in `public/images/places/<slug>/`.

The script will:

- Copy images to `public/images/places/<slug>/photo-<n>.<ext>`.
- Read image dimensions and calculate compact BlurHash strings.
- Compute the 7-character geohash.
- Update `RAW_PLACES` in `db/seed-data.ts`.
- Automatically synchronize with TiDB Cloud if `DATABASE_URL` is configured.

### Option 2: CLI with Flags

You can also pass all parameters in a single command:

```bash
npm run location:add -- --name "Senso-ji" --city "Tokyo" --country "Japan" --code "JP" --category "landmark" --lat 35.714765 --lng 139.796655 --desc "Ancient Buddhist temple located in Asakusa." --images "C:/path/to/img1.jpg,C:/path/to/img2.jpg"
```

### Option 3: Manual Addition

1. Create a directory for your place:
   ```bash
   mkdir -p public/images/places/<place-slug>
   ```
2. Copy your image files into `public/images/places/<place-slug>/` (e.g., `photo-1.jpg`, `photo-2.jpg`).
3. Add the place entry into `RAW_PLACES` in `db/seed-data.ts` with image paths, dimensions, and blurhash.
4. Sync the database:
   ```bash
   npm run db:setup
   ```

## Database Setup

To reset or sync the database with the seed catalogue:

```bash
npm run db:setup
```

## Scripts

- `npm run dev`: Start Next.js development server
- `npm run build`: Build production Next.js application
- `npm run db:setup`: Initialize TiDB database schema and sync seed data
- `npm run location:add`: Interactive wizard to add a new location with automatic image and blurhash processing
- `npm run typecheck`: Run TypeScript type checking
- `npm run lint`: Run ESLint checks
- `npm test`: Run ADS (Algorithms & Data Structures) test suite
