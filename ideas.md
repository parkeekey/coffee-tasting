# Coffee Affective Tasting App — Design Brainstorm

<response>
<text>
## Idea 1: "Third Wave Notebook"

**Design Movement:** Artisanal Brutalism meets Field Journal

**Core Principles:**
- Raw, tactile textures evoking kraft paper and coffee stains
- Monospaced data typography for scores, paired with a warm serif for labels
- Asymmetric card layouts that feel like handwritten tasting notes
- High contrast ink-on-paper aesthetic with warm amber accents

**Color Philosophy:**
- Background: deep espresso brown (#1C0F0A) with subtle grain noise
- Cards: aged parchment (#F5EDD8) with slight sepia tint
- Accent: bright amber (#E8A020) for interactive elements and scores
- Text: near-black (#1A1008) on light, warm cream (#FFF8EE) on dark

**Layout Paradigm:**
- Stacked vertical cards with torn-edge dividers
- Sliders that look like analog dials with tick marks
- Score displayed as a large circular gauge in the top-right corner

**Signature Elements:**
- Coffee ring stain watermark behind score cards
- Handwriting-style font for sample names
- Tick-mark slider tracks with tactile thumb handles

**Interaction Philosophy:**
- Sliders snap with a subtle haptic-like bounce
- Cards slide in from bottom like flipping notebook pages
- Favorite toggle uses a coffee bean icon instead of a heart

**Animation:**
- Entrance: cards fade + slide up from 20px below
- Slider: thumb bounces slightly on release (spring physics)
- Score counter: rolls up like an odometer when values change

**Typography System:**
- Display: Playfair Display (serif, bold) for headings
- Mono: JetBrains Mono for score numbers
- Body: Source Serif 4 for labels and notes
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Idea 2: "Specialty Lab" — CHOSEN ✅

**Design Movement:** Scientific Minimalism with Warm Organic Accents

**Core Principles:**
- Clean, clinical precision for data entry balanced with warm coffee tones
- Mobile-first vertical flow optimized for one-thumb operation
- Score visualization as a real-time arc gauge with color gradient
- Compact but breathable — every pixel earns its place

**Color Philosophy:**
- Background: warm off-white (#FAFAF7) — not sterile white
- Primary surface: pure white cards with 1px warm-gray borders
- Accent: rich coffee brown (#6B3A2A) as primary interactive color
- Highlight: golden amber (#D4860A) for scores and favorites
- Muted: sage green (#7A9E7E) for "good" score ranges
- Text: dark charcoal (#1E1A17) for maximum legibility on mobile

**Layout Paradigm:**
- Fixed bottom navigation bar (3 tabs: Taste / Log / Export)
- Full-width slider rows with large touch targets (min 48px)
- Score arc gauge fixed at top of tasting form, always visible
- Metadata fields in a collapsible "Coffee Info" drawer

**Signature Elements:**
- Radial score arc that fills from 55→100 with color gradient (red→amber→green)
- Emoji-labeled slider rows with left score badge and right value
- Compact sample index badge (S-01, S-02) in coffee brown pill

**Interaction Philosophy:**
- Sliders are wide-track with large thumbs for easy mobile use
- Quick-tap ±1 buttons flanking each slider for precision
- Swipe left on log entries to reveal delete/favorite actions

**Animation:**
- Score arc animates smoothly on every slider change
- Tab transitions: horizontal slide
- New entry: scale-in from center
- Favorite: heart pulse animation

**Typography System:**
- Display: Fraunces (optical serif, variable) for app title and sample names
- UI: DM Sans (geometric, clean) for labels, buttons, navigation
- Mono: DM Mono for score numbers and sample indices
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea 3: "Dark Roast Dashboard"

**Design Movement:** Dark Mode Industrial with Neon Accents

**Core Principles:**
- Deep dark backgrounds evoking a late-night cupping session
- Neon green/teal accents for active states and scores
- Dense information layout — maximum data per screen
- Glassmorphism cards floating over dark gradient

**Color Philosophy:**
- Background: near-black (#0D0D0D) with subtle dark brown tint
- Cards: rgba(255,255,255,0.05) glass with backdrop blur
- Accent: electric teal (#00D4AA) for active sliders and scores
- Warning: warm orange (#FF8C42) for low scores
- Text: pure white (#FFFFFF) with 70% opacity for secondary

**Layout Paradigm:**
- Full-screen dark canvas with floating glass cards
- Horizontal scrolling score summary bar at top
- Compact 2-column grid for metadata fields

**Signature Elements:**
- Neon glow on active slider thumbs
- Score displayed as a segmented LED-style number
- Glass card borders with subtle gradient shimmer

**Interaction Philosophy:**
- All interactions have glow feedback
- Long-press on log entry opens context menu
- Score segments light up progressively as sliders increase

**Animation:**
- Glow pulse on active elements
- Score segments fill with a sweep animation
- Cards appear with blur-in effect

**Typography System:**
- Display: Space Grotesk (geometric, techy) for headings
- Body: IBM Plex Sans for labels
- Mono: IBM Plex Mono for all numeric values
</text>
<probability>0.06</probability>
</response>

## Selected Design: Idea 2 — "Specialty Lab"

Warm scientific minimalism. Clean white cards, coffee brown primary, amber score accents, DM Sans + Fraunces typography. Mobile-first with bottom navigation, radial score arc, and large-thumb sliders.
