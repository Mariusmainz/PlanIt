# PlanIt

A tactile Gantt chart editor built with React. Create tasks, set milestones, mark key dates, and drag to rearrange your project timeline — all in the browser.

## Features

### Gantt Chart
- **Drag & drop** — grab a task bar to move it, or drag the left/right handles to resize
- **View modes** — toggle between Day, Week, and Month zoom levels
- **Sections** — group tasks under color-coded sections (Research, Writing, Review, etc.)
- **Scrollable timeline** — horizontal scroll when the date range is wide, with each day guaranteed at least 40px

### Milestones
- Single-date checkpoints rendered as diamond markers on the timeline
- Assigned to sections just like tasks
- Click to open a detail panel for editing name, date, and section

### Day Markers
- Mark specific dates (project start, deadline, etc.) with a colored vertical strip across the full timeline height
- Small indicator dots appear in the timeline header
- A legend below the chart shows each marker's label and date
- Choose from six preset colors via the swatch picker

### Schedule
- Mark individual off days or set recurring weekly off days (e.g. every Saturday)
- Off days are highlighted with an amber tint on the timeline

### Export
- **JSON** — full project data including tasks, milestones, and markers
- **CSV / TSV** — task list in tabular format
- **PDF (print)** — opens a formatted print-ready view in a new window

## Getting Started

```
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

To build for production:

```
npm run build
npm run preview
```

## Tech Stack

- [React 18](https://react.dev) — UI
- [Vite](https://vite.dev) — build tool
- Vanilla CSS with CSS custom properties
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) + [Fraunces](https://fonts.google.com/specimen/Fraunces) — typography
