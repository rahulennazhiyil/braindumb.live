---
name: rahul.dev
description: A cinematic, ARG-coded portfolio bridge. Instrument-grade primitives, four swappable theme materials, glass over void as the default.
colors:
  void-black: "#0a0a0f"
  hull-indigo: "#1a1a2e"
  deck-slate: "#2d2d44"
  signal-cyan: "#00f0ff"
  warning-amber: "#f59e0b"
  console-bright: "#e2e8f0"
  console-mid: "#94a3b8"
  console-dim: "#64748b"
  bulkhead: "#334155"
  glass-skin: "#ffffff0d"
  glass-edge: "#ffffff1a"
  pulse-green: "#22c55e"
  red-alert: "#ef4444"
  cat-infra: "#a78bfa"
  cat-data: "#34d399"
  cat-platform: "#f472b6"
  cat-frontend: "#60a5fa"
  cat-tools: "#fb923c"
typography:
  display:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  none: "0px"
  chip: "6px"
  card: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  scene: "96px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.void-black}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.hull-indigo}"
    textColor: "{colors.console-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "8px 16px"
  button-secondary-hover:
    textColor: "{colors.signal-cyan}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.console-mid}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.deck-slate}"
    textColor: "{colors.signal-cyan}"
  tag-chip-terminal:
    backgroundColor: "{colors.deck-slate}"
    textColor: "{colors.signal-cyan}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  tag-chip-default:
    backgroundColor: "{colors.deck-slate}"
    textColor: "{colors.console-mid}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
  glass-panel:
    backgroundColor: "{colors.glass-skin}"
    textColor: "{colors.console-bright}"
    rounded: "{rounded.card}"
    padding: "24px"
  section-heading-kicker:
    textColor: "{colors.signal-cyan}"
    typography: "{typography.label}"
  section-heading-title:
    textColor: "{colors.console-bright}"
    typography: "{typography.headline}"
  navbar:
    backgroundColor: "{colors.glass-skin}"
    textColor: "{colors.console-mid}"
    typography: "{typography.label}"
    height: "56px"
  marquee-band:
    backgroundColor: "{colors.glass-skin}"
    textColor: "{colors.console-dim}"
    typography: "{typography.label}"
    padding: "9px 0"
---

# Design System: rahul.dev

## 1. Overview: The Bridge

**Creative North Star: "The Bridge"**

The interface is the instrument panel; the work is what you are flying. Every visible
surface reads as telemetry: HUD chrome around the force graph, corner brackets on
featured panels, a marquee runtime ticker between scenes, decrypt animations on
section headings, a boot terminal that auto-types the first contact. The visitor is
not browsing a portfolio; they are stepping onto a small bridge and watching its
instruments come alive.

The system is built on glass over void. The default theme is dark, translucent, and
backlit by a single cyan signal. Three alternate theme materials snap onto the same
chrome: a high-contrast green CRT (`terminal`), a quiet ink-on-paper boss-mode
(`print`), and a saturated neon nightscape (`synthwave`). The chrome is constant
across all four; only the material changes. This is not "light mode and dark mode."
It is four physical environments the bridge can be set in, each with its own light
and weight.

Density is medium: type is generous, spacing has rhythm, scenes breathe. The site
is theatrical, but never cluttered. Cinematic touches (grain, scan-lines, decrypt,
kinetic-rise, marquee) are atmospheric layers, never decoration. They are dialed
per-theme through `--cinematic-*` custom properties, and `print` deliberately turns
all of them off so the site can be shared as a clean reference.

The system explicitly rejects: stock developer-portfolio templates (avatar + bio +
project grid + tech-icons), SaaS landing-page clichés (gradient hero + big metric
+ identical feature cards), off-the-shelf cyberpunk-neon (solid black + Matrix-rain
+ magenta glow), and the corporate-resume web. None of these are what The Bridge is.

**Key Characteristics:**

- Mono-coded primitives, glass-bodied surfaces.
- Four theme materials, one constant chrome.
- Cinematic atmosphere as a CSS-variable dial, not as decoration.
- `~$` prompt mark and `{ }` braces as the system's verbal tics.
- Hover lifts and glow trails over hard drop-shadows.
- Reduced-motion is fully honored; the boss-mode `print` theme strips the show.

## 2. Colors: The Signal Palette

The default `glass` palette is a deep night with a single cyan signal and an amber
warning. Neutrals are slate-cool, never pure grey, and never `#000` or `#fff`. The
five category colors (`cat-*`) belong to data viz only, never to UI chrome.

### Primary

- **Signal Cyan** (`#00f0ff`): The single live signal. Used on the primary button
  background, on the focus ring, on every section-heading kicker, on link hover, on
  link-active routes in the navbar, and as the selection background. **No other
  color earns the role of primary action.** On `terminal` it remaps to phosphor
  green (`#00ff41`), on `print` to near-black ink (`#0f172a`), on `synthwave` to
  hot magenta (`#ff2975`).

### Secondary

- **Warning Amber** (`#f59e0b`): The second voice. Used sparingly: warning states,
  the `~$ exit 0` prompt in the footer when paired with cyan, and the secondary
  bubble in the tech-bubbles viz. Does not appear on default UI chrome.

### Tertiary (data-viz only)

- **Cat Infra** (`#a78bfa`): infra category in the force graph and tech-bubbles.
- **Cat Data** (`#34d399`): data category.
- **Cat Platform** (`#f472b6`): platform category.
- **Cat Frontend** (`#60a5fa`): frontend category.
- **Cat Tools** (`#fb923c`): tools / tooling category.

Each remaps per-theme in `tokens.css`. Data viz never relies on hue alone; shape,
position, or label always carries the meaning so the categories survive
color-blindness without translation.

### Neutral

- **Void Black** (`#0a0a0f`): page background, button-primary text. The deepest
  surface; everything else floats over it.
- **Hull Indigo** (`#1a1a2e`): the resting surface for cards, inputs, secondary
  buttons.
- **Deck Slate** (`#2d2d44`): the elevated surface for chips and ghost-button
  hover backgrounds.
- **Console Bright** (`#e2e8f0`): primary text and headlines.
- **Console Mid** (`#94a3b8`): secondary text, navbar links at rest.
- **Console Dim** (`#64748b`): tertiary text, marquee bands, time stamps.
- **Bulkhead** (`#334155`): structural borders that need to read as "wall."
- **Glass Skin** (`rgba(255,255,255,0.05)`): translucent panel fill.
- **Glass Edge** (`rgba(255,255,255,0.1)`): the 1px hairline that holds glass
  shapes together.

### State

- **Pulse Green** (`#22c55e`): success / online indicators.
- **Red Alert** (`#ef4444`): error states only.

### The Theme-Material Rule

**The Theme-Material Rule.** Each of the four themes uses a different physics
to communicate depth: `glass` uses backdrop-filter blur and translucent fills,
`terminal` uses contrast borders only (radius 0, no glass), `print` uses ink
weight and one subtle drop-shadow, `synthwave` uses neon glow as the elevation
mechanism. **Never port a shadow recipe across themes.** Tune depth in the
material the theme is made of.

### The One-Signal Rule

**The One-Signal Rule.** The cyan accent is the live signal of the bridge. It
appears on roughly 5–10% of any visible surface. Multiplying it weakens the
signal; restraint is the point. If a screen needs more emphasis, change typeset
or composition, not color count.

## 3. Typography: The Console Pairing

**Display Font:** JetBrains Mono Variable (with `JetBrains Mono`, `ui-monospace`,
Menlo as fallbacks).
**Body Font:** Inter Variable (with `Inter`, `ui-sans-serif`, system-ui as
fallbacks).
**Label / Mono Font:** JetBrains Mono Variable, identical stack to display.

The pairing reads as a console: monospace for everything that wants to look like a
command, label, or readout, and a humanist sans for prose. The `print` theme is the
only deviation, swapping both display and body to Merriweather serif so the page
reads as a printable reference document.

**Character:** Mono headings give every section a typewriter-on-a-bridge cadence;
the variable JetBrains face stays sharp at display sizes without feeling brittle.
Inter handles long-form prose so paragraphs do not feel like terminal output. The
contrast between the two fonts is intentional and should not be smoothed away.

### Hierarchy

- **Display** (700, `clamp(2rem, 5vw, 3rem)`, 1.1, -0.02em): hero name, the boot
  terminal headline. Monospace so every character is on-grid.
- **Headline** (700, `1.875rem` at md / `2.25rem` at lg, 1.15, -0.02em): the title
  of every `app-section-heading` block.
- **Title** (700, `1.25rem` to `1.6rem`, 1.3, -0.01em): card titles
  (`featured__name`, project-card, blog-card).
- **Body** (400, `1rem` default, line-height 1.6, normal letter-spacing): prose,
  card descriptions, contact text. Cap line length at 65–75ch on long-form
  surfaces (`/feed`, `/privacy`, the about bio).
- **Label** (500, `0.75rem`, 1.4, 0.18em letter-spacing, **uppercase**): every
  monospaced UI label, kicker, button text, navbar link, marquee band, footer
  meta, time stamps.

### The `~$` Prompt Rule

**The `~$` Prompt Rule.** Every section kicker, the navbar logo, the footer
prompt, and most interactive labels lead with the literal token `~$ ` (mono,
`text-text-muted` on the `~$`, `text-accent-primary` on the term that follows).
This is the system's verbal tic; it is how the chrome speaks. New components that
need a kicker must use it. **Do not invent a different prefix.**

### The Mono-First Rule

**The Mono-First Rule.** Headings use the display (JetBrains Mono) face in three
of the four themes; only `print` swaps to serif. Sans is for prose, never for
headlines, never for buttons, never for labels.

### The 0.18em Tracking Rule

**The 0.18em Tracking Rule.** Every uppercase mono label uses
`letter-spacing: 0.18em` (Tailwind's `tracking-wider` is `0.05em` and is too
tight for this voice). Buttons, kickers, navbar links, marquee bands all share
the same loose tracking. It is the system's audio signature.

## 4. Elevation: Material, Not Weight

The system communicates depth through **material**, not through stacked drop-
shadows. Each theme has its own physics:

- **`glass`** uses `backdrop-filter: blur(12px)` with a translucent fill
  (`rgba(255,255,255,0.05)`) and a 1px `glass-edge` hairline. Surfaces look
  backlit, not lifted.
- **`terminal`** uses a single 1px-inset shadow (`0 0 0 1px rgba(0,255,65,0.15)`)
  and 0px corners. There is no "elevated" terminal surface; everything is at
  one plane, separated only by phosphor borders.
- **`print`** uses a single ambient shadow (`0 1px 3px rgba(15,23,42,0.08)`) and
  4px corners. Closest to a printed document with a thin paper shadow.
- **`synthwave`** uses a colored glow (`0 8px 32px rgba(255,41,117,0.25)`) and
  12px corners. Bloom replaces the shadow; the page reads as backlit neon, not
  paper.

There is no canonical 3-step shadow scale. Stacking surfaces beyond two layers
(page → glass panel) is unusual; the rare third layer (modal, palette) borrows
the same glass treatment with a stronger backdrop-filter rather than a heavier
shadow.

### Shadow Vocabulary

- **`shadow-glass`** (per-theme): the resting elevation for any glass panel.
  Atmospheric, not structural.
- **`shadow-glow`** (per-theme): the hover elevation. Always tinted with the
  theme's primary signal so glow reads as interactivity, not surface depth.

### The Hover-Glows-Not-Lifts Rule

**The Hover-Glows-Not-Lifts Rule.** On hover, surfaces translate `-2px` on Y and
their `box-shadow` expands to `shadow-glow` (a tinted halo). They do not gain a
heavier drop-shadow; they bloom. The lift is small enough to read as feedback,
not as theatrics.

### The Print-Mode Rule

**The Print-Mode Rule.** The `print` theme deliberately disables grain,
scan-lines, glow, and most cinematics (`--cinematic-grain-opacity: 0`,
`--cinematic-scan-opacity: 0`, `--shadow-glow: none`). It is the boss-mode
reference theme — the version of the site that gets shared in a recruiter
email. New cinematic features must check the `print` matrix before shipping;
if a feature looks broken in `print`, the right answer is usually to disable
it for that theme.

## 5. Components: Instrument-Grade

Every component is layered: the primitive itself is mono, restrained, and reads
as instrument-grade; the cinematic chrome around it (HUD borders, decrypt
headers, marquee bands, scene frames) does the theater; the transition between
states is ceremonial — exponential ease-out, never bouncy. This three-layer
pattern is the system's component philosophy. **Components do not perform alone;
the chrome around them performs.**

### Buttons

- **Shape:** small `rounded-chip` corners (6px) on `glass`, `synthwave`, and
  `print`; sharp 0px on `terminal`. Same component, different theme material.
- **Primary:** `signal-cyan` background, `void-black` text, mono uppercase label
  with 0.05em–0.18em tracking, padding `8px 16px` (md). On hover, `box-shadow`
  expands to `shadow-glow` and the button translates `-2px` on Y.
- **Secondary:** `hull-indigo` background, `console-bright` text, 1px `bulkhead`
  border. On hover, the border and text both shift to `signal-cyan`. No
  background change.
- **Ghost:** transparent background, `console-mid` text. On hover, background
  fills to `deck-slate` and text shifts to `signal-cyan`. Used for low-emphasis
  actions and theme toggles.
- **Sizes:** `sm` (`text-xs`, `px-3 py-1.5`), `md` (`text-sm`, `px-4 py-2`),
  `lg` (`text-base`, `px-6 py-3`).

### Tag Chips

- **Style (default `terminal` variant):** mono uppercase label, `signal-cyan`
  text, content wrapped between `{` and `}` braces rendered in `console-dim`
  (e.g. `{ ANGULAR }`). 6px radius. 1px `bulkhead` border. Half-tinted
  `deck-slate` fill.
- **Style (`default` variant):** sans body, no braces, `console-mid` text on
  `deck-slate` fill. Used in long-form contexts (blog cards) where the braces
  read as too theatrical.
- **State:** chips are read-only labels; selected/unselected state lives on
  filter pills in admin (not yet documented).

### The Brace Rule

**The Brace Rule.** The terminal variant of `tag-chip` wraps its content
between `{` and `}` characters in `console-dim`. This is one of the system's
two verbal tics (the other is `~$`). New chip variants in cinematic contexts
must adopt it. The default sans variant is the only chip allowed without
braces, and only in long-form prose.

### Glass Panel (Cards / Containers)

- **Corner Style:** 16px (`radius-card`) on `glass`, 12px on `synthwave`, 4px on
  `print`, 0px on `terminal`.
- **Background:** `rgba(255,255,255,0.05)` on `glass`, the equivalent in each
  theme's primary tone.
- **Backdrop-filter:** `blur(12px)` on `glass` and `synthwave`, none on
  `terminal` and `print`.
- **Border:** 1px `glass-edge` hairline.
- **Internal Padding:** `24px` (`spacing.lg`) for content cards; `16px` and
  `40px` are common rhythm variants on hero panels.
- **Hover:** `border-color` shifts toward `signal-cyan`, `transform: translateY(-2px)`,
  `box-shadow: shadow-glow`. 200ms ease-out.

### Section Heading

- **Kicker:** mono `0.75rem`, uppercase, 0.18em tracking. Lead with `~$` in
  `console-dim`, then the kicker term in `signal-cyan`. Always above the title.
- **Title:** display mono, 700 weight, `text-3xl` (1.875rem) at md /
  `text-4xl` (2.25rem) at lg, `letter-spacing: -0.02em`, `console-bright`.
  Single line preferred; clamp at two.
- **Subtitle (optional):** Inter body sans, `console-mid`, max-width `2xl` (28rem).
- **Decrypt opt-in:** the title can adopt the `[appDecryptText]` directive for
  a 600ms scramble-resolve on intersect. Reduced-motion settles to the final
  string instantly.

### Inputs / Fields

- **Style:** `hull-indigo` background, 1px `bulkhead` border, 6px corners,
  `console-bright` text in `1rem` Inter body, `12px` padding (vertical 8px
  horizontal 12px is typical).
- **Focus:** the focus ring is global — `outline: 2px solid signal-cyan;
  outline-offset: 2px`. Border itself does not change color on focus; the
  ring carries the signal.
- **Error:** `red-alert` 1px border + helper text in `red-alert` mono `0.75rem`.
- **Disabled:** `opacity: 0.4`, cursor `not-allowed`.

### Navigation (Navbar)

- **Style:** sticky top-0, `glass-skin` background with `backdrop-blur-xl`,
  `glass-edge` 1px bottom border on scroll. Height 56px (`3.5rem`).
- **Logo:** mono `~$ rahul` in `signal-cyan` 0.75rem with 0.2em tracking. The
  logo is also a long-press target (650ms) for the secret-entry easter egg.
- **Links:** mono `text-xs` uppercase, `tracking-wider`, `console-mid` at rest,
  `signal-cyan` on hover and on the `routerLinkActive` route.
- **Mobile:** hamburger via Lucide. Drawer drops below the nav with full-width
  `bg-bg-surface/95` and the same link rules.

### Footer

- **Style:** 1px `glass-edge` top border, `mt-24` separation, mono prompt
  `~$ exit 0` in `signal-cyan`, 0.2em tracking.
- **Easter egg:** an invisible 48×24 button is positioned absolutely above the
  prompt — three taps within 700ms triggers a secret event the host page can
  wire. `aria-hidden`, `tabindex="-1"`. **Never visible**.
- **Socials:** Lucide 18px icons in `console-mid`, `signal-cyan` on hover.
- **Meta:** `© year · Rahul E · privacy`. Mono, `console-dim`, 0.75rem.

### Cinematic Overlays (Signature Components)

- **Grain Overlay:** fixed full-viewport SVG turbulence filter,
  `mix-blend-mode: overlay`, `z-index: 200`. Opacity bound to
  `--cinematic-grain-opacity` per theme (0.06 / 0.10 / 0 / 0.04).
- **Scan-Line Overlay:** fixed full-viewport repeating-linear-gradient,
  `mix-blend-mode: multiply`, `z-index: 199`. Opacity bound to
  `--cinematic-scan-opacity` (0.04 / 0.07 / 0 / 0.05).
- **Marquee Band:** horizontal mono ASCII strip, 30s linear scroll, paused
  off-screen. `aria-hidden`, `pointer-events: none`. Lives between scenes
  on home / about.
- **Decrypt Text:** 600ms text-scramble-resolve on intersect. Sets
  `aria-label` to the final string at mount so screen readers see the resolved
  value, never the noise.
- **Kinetic Heading:** per-character rise (`translateY(0.4em)` →
  `translateY(0)`) with 480ms `cubic-bezier(0.2, 0.8, 0.2, 1)` ease-out. Plays
  once on intersect.
- **Boot Sequence:** full-viewport terminal panel that auto-types a scripted
  sequence before dissolving into the hero. `localStorage` flag persists
  across visits so it plays once per device. Skippable on any keypress / tap;
  auto-skipped under reduced-motion.

### The Three-Layer Component Rule

**The Three-Layer Component Rule.** Every page composition uses three layers:
(1) instrument-grade primitives (mono buttons, glass panels, sans body);
(2) cinematic chrome around them (HUD corner brackets, decrypt headers, marquee
bands, scene frames); (3) ceremonial transitions between states (kinetic-rise,
decrypt-resolve, hover-glow, scroll-snap on home/about). Removing any layer
collapses the system: just primitives feels generic; just chrome feels staged;
just transitions feels gimmicky. **All three or nothing.**

## 6. Do's and Don'ts

### Do:

- **Do** use `signal-cyan` (`#00f0ff`) for the single primary action and the
  focus ring on every public surface. The color earns its weight by being rare.
- **Do** lead every kicker, navbar logo, footer prompt, and label-style mono
  string with `~$`. It is the bridge's verbal tic.
- **Do** wrap terminal-variant `tag-chip` content between `{` and `}` braces
  rendered in `console-dim`. New cinematic chip variants must adopt the brace.
- **Do** use `letter-spacing: 0.18em` on every uppercase mono label. Buttons,
  kickers, navbar, marquee — same loose tracking.
- **Do** use mono (JetBrains Mono Variable) for headings on `glass`, `terminal`,
  and `synthwave`. `print` is the only theme allowed to swap to serif.
- **Do** glow on hover (`shadow-glow` + `translateY(-2px)`), never deepen the
  drop-shadow. Lift is feedback, not theatrics.
- **Do** dial cinematic intensity per theme via the `--cinematic-*` custom
  properties. Define values in `tokens.css` only, never hard-code opacity.
- **Do** check the `print` matrix before shipping any new cinematic feature.
  If it breaks the boss-mode reference view, gate it on `[data-theme]`.
- **Do** respect `prefers-reduced-motion: reduce` on every animation. Decrypt
  settles instantly, kinetic-rise jumps to the end, scroll-snap disables, the
  boot sequence auto-skips, the custom cursor falls back to the system cursor.
- **Do** keep brand cinematics off `/admin/*`. Productivity over performance
  on the operator's side.
- **Do** mark every decorative overlay (grain, scan-line, marquee, HUD chrome)
  with `aria-hidden="true"` and `pointer-events: none`.
- **Do** cap body line length at 65–75ch on long-form pages (`/privacy`,
  `/feed`, the about bio).

### Don't:

- **Don't** use `#000` or `#fff` directly. Reach for `void-black` (`#0a0a0f`)
  or `console-bright` (`#e2e8f0`); every neutral is tinted.
- **Don't** ship a generic developer-portfolio template (avatar + bio +
  project grid + tech-stack icons). Avoid the template even when it would be
  faster. (PRODUCT.md anti-reference.)
- **Don't** ship a SaaS landing-page cliché (gradient hero with a big metric,
  three identical feature cards, social-proof logo strip). The bridge is not
  a B2B site. (PRODUCT.md anti-reference.)
- **Don't** ship an off-the-shelf cyberpunk-neon look (solid black + magenta
  glow + Matrix-rain decoration). That is the training-data reflex; the bridge
  earns its cinematic register through composition, not through neon. (PRODUCT.md
  anti-reference.)
- **Don't** ship a corporate-resume page (beige, polite, "I am passionate
  about clean code"). Risk-averse to the point of forgettable. (PRODUCT.md
  anti-reference.)
- **Don't** use a side-stripe border (`border-left` or `border-right` greater
  than 1px as a colored accent on a card). Rewrite with full borders, a
  background tint, or a leading kicker.
- **Don't** use gradient text (`background-clip: text` over a gradient
  background). Emphasis comes from weight, scale, or color, not from the
  rainbow.
- **Don't** use glassmorphism decoratively. The `glass` class is a structural
  element with a purpose; do not blur things just because. `terminal` and
  `print` deliberately drop the blur.
- **Don't** stack a third elevated surface beyond `page → glass panel`.
  Modals and the command palette are the only allowed third layer; they
  borrow the same glass treatment.
- **Don't** invent a new theme to solve a layout problem. Four themes is the
  ceiling. Tune the existing materials.
- **Don't** carry the `~$` prompt or the `{ }` braces into `/admin/*`. The
  productive surface drops the verbal tics so the operator's eye can land on
  data, not chrome.
- **Don't** animate CSS layout properties (`width`, `height`, `top`, `left`,
  `padding`, `margin`). Use `transform` and `opacity`. The hover lift uses
  `translate3d`.
- **Don't** add a colored shadow on `print`. The print theme's `--shadow-glow`
  is `none` for a reason; do not override it.
- **Don't** preload audio assets. The ambient drone and UI sfx are off by
  default and lazy-loaded only on the first toggle.
- **Don't** rely on hue alone in data viz. Shape, position, or label must
  carry the meaning so the categories survive color-blindness.
- **Don't** use bouncy / elastic easing (`ease-out-back`, `cubic-bezier`
  with overshoot). The bridge eases out exponentially; bounce reads as
  consumer-app, not instrument.
