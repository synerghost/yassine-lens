# Yassine's Lens

Portfolio photographique de **Yassine Zennar** — Music · Hospitality · Sport.
Live : https://yassine-lens.com

## Stack
- Next.js 16 (App Router) + React 19, TypeScript
- Déploiement : Vercel
- Médias : `public/photos` (build) avec surcouche **Vercel Blob** éditable via `/admin`

## Développement
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Panneau d'administration
`/admin` — ajouter / modifier / supprimer / réordonner les photos.
Variables d'environnement (Vercel → Settings → Environment Variables) :
- `ADMIN_USER`, `ADMIN_PASSWORD` — identifiants d'accès
- `BLOB_READ_WRITE_TOKEN` — ajouté automatiquement en connectant un store Vercel Blob

## Structure
- `src/app` — pages, routes API admin, favicon, robots, sitemap
- `src/components` — Experience, DesktopCanvas, MobileFeed, InfoOverlay, Cursor, PhotoCard
- `src/lib` — categories, photos (Blob + fallback), layout (grille générative), admin (auth)
