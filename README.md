# Abdallah Melhem, portfolio

A trading desk at night, built in Three.js. You stand in the middle of the room; each wall is a section.
Drag to look around, click a screen to step up to it.

- **About** (main wall): the desk, the neon name, the whiteboard, the IEEE certificate.
- **Experiences**: three hanging badges, one per internship. Each carries a real QR code; clicking a badge runs a scanner animation and opens the internship's details. Scanning the QR with a phone opens the same badge on the live site.
- **Projects**: a bank of monitors, one per repository, and a rack of YouTube thumbnails below them. Clicking a monitor opens its details; clicking a video plays it in the side panel.
- **Competitions**: the leaderboard screen and the medals. Clicking a row opens what the competition was, the approach, and the code when it is public.

Every item is also reachable from the side panel's "Details" buttons, and by deep link: `#experiences/kinetix`, `#competitions/imc-prosperity-4`, `#projects/masef-helper`, `#projects/<youtube-id>`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

## Edit the content

Everything the room says lives in `src/data.js`: bio, education, internships, projects, competition ranks.
Move an entry from `competitions.entered` to `competitions.ranked` once you have a rank.

## Deploy

Push to `main` on GitHub with Pages set to "GitHub Actions" (repository Settings, Pages, Source).
`.github/workflows/deploy.yml` builds the site and publishes it at `https://<user>.github.io/<repo>/`.

## Layout of the code

- `src/scene/room.js` builds the four walls and their props.
- `src/scene/screens.js` paints every monitor, badge and sign onto a canvas; there are no image assets.
- `src/controls.js` turns the camera, snaps to walls, and steps up to screens.
- `src/ui.js` renders the top bar, compass and slide-in panels from `src/data.js`.
- `design/` holds the earlier design exploration.
