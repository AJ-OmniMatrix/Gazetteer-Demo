# Gazetteer

A personal travel catalogue for discovering places and keeping a record of the destinations you have visited.

**Live demo:** https://gazetteer-demo.vercel.app/

## What you can do

- **Discover a place:** Browse the featured Location of the Day or explore the catalogue by city and category.
- **Find places:** Search by place name, city, country, or category.
- **Check nearby places:** Allow browser location access to see catalogue locations nearest to your current position.
- **Save your visits:** Sign in and add places to your personal travel list. You can also remove a saved visit.
- **Track your travels:** View saved places, filter them by city or category, and see a few travel statistics.
- **Open directions:** Open a place directly in Google Maps.

## How to use Gazetteer

1. Open the [live demo](https://gazetteer-demo.vercel.app/).
2. Browse the featured location, or open **Explore** to see all catalogued places.
3. Use search or the city/category filters to find somewhere.
4. Select **Add** or the check-in action to save a place. For GPS suggestions, allow location permission when your browser asks.
5. Open **List** to see your saved places and travel statistics.

To save visits, sign in from the app. The demo also provides pre-seeded test accounts (**Aarav Sen** and **Maya Lin**) so you can try the personal-list experience quickly. The custom sign-in flow uses a handle and display name; it is a demo identity flow, not password-based account security. Do not enter sensitive personal information.

## Where the data comes from

The places shown in the demo come from a curated catalogue maintained in `db/seed-data.ts`. Each entry contains details such as its name, city, country, category, description, coordinates, and image references.

Place photos are stored in the repository under `public/images/places/` and served by the application. The app generates a Google Maps link from each place's coordinates.

Gazetteer does **not** currently fetch its catalogue from a live travel or maps API. The search, nearby-place suggestions, and visit tracking operate on the catalogue included in the project.

## Run locally

You need Node.js and npm.

```bash
git clone https://github.com/AJ-OmniMatrix/Gazetteer-Demo.git
cd Gazetteer-Demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (optional for local preview)

Without a database connection, Gazetteer uses an in-memory fallback so you can run and explore the seeded catalogue locally. Visit data in this mode is temporary and can be lost when the server process restarts.

For persistent data, create a compatible TiDB/MySQL database, copy the example environment file, and add your connection string:

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local`, then initialize and seed the database:

```bash
npm run db:setup
npm run dev
```

**Note:** `npm run db:setup` synchronizes the database with the project's seed catalogue. Review `db/setup.ts` before running it against a database that contains data you need to keep; the sync removes place records that are not present in the seed list.

## Add a place

Run the interactive location wizard:

```bash
npm run location:add
```

Follow the prompts for the place name, city, country, category, coordinates, description, and image paths. The tool copies images into `public/images/places/`, creates image dimensions and BlurHash placeholders, generates a geohash, and updates `db/seed-data.ts`. If `DATABASE_URL` is configured, it also syncs the new place to the database.

The supported categories are currently `landmark`, `national_park`, `museum`, `cafe`, and `mall`.

## Built with

- **Application:** Next.js, React, and TypeScript
- **Styling and UI:** Tailwind CSS and shadcn/ui
- **Database:** TiDB Cloud / MySQL through `mysql2`
- **Client-side data:** TanStack Query
- **Images:** Sharp and BlurHash
- **Motion:** Motion and GSAP

The project also uses a few focused data structures and algorithms for prefix search, nearby-place lookup, and visit statistics. Their implementation is documented separately in **[ADS-Report.md](./ADS-Report.md)**.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Run the production build |
| `npm run db:setup` | Initialize and sync the database with seed data |
| `npm run location:add` | Add a place using the interactive wizard |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm test` | Run the data-structure and algorithm tests |

---

Made as a simple way to catalogue places and keep a personal record of travel.
