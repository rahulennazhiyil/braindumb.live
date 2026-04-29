# Product

## Register

brand

## Users

The site serves three audiences in priority order.

1. **Senior-role hiring managers and tech leads.** Decision-makers who pull
   the link from a recruiter, a referral, or a portfolio mention. They
   evaluate taste, judgment, and the ability to ship something distinctive.
   Typical context: 2 minutes between meetings on a laptop, sometimes a
   second pass on a phone in the evening.
2. **Curious developers and peers.** Engineers who arrive from dev
   Twitter, a conference talk, or a "look at this" link. They look at the
   work, the easter eggs, the architectural choices, and the source.
   Typical context: late-night browsing, willing to scroll, willing to play.
3. **Recruiters and sourcers.** Skim-readers who decide in 10 seconds
   whether to send the profile up the chain. They need bio, current role,
   and a contact route without effort.

The site is also home to a small product-register sub-surface at
`/admin/*` (CMS, visitor insights, finance analyzer). That sub-surface
serves only Rahul as the operator; its design rules are productivity
first, theatrics off.

## Product Purpose

A personal site that earns one outcome above all others: the senior
hiring manager closes the tab and writes Rahul a message. Memorability
and substance are the means; intent-to-contact is the goal.

It is also the visible proof-of-work for the skills the bio claims.
Every public surface is a demonstration of the discipline it represents:
the force graph is the D3 proof, the cinematic chrome is the UX proof,
the playground demos are the visualization proof, the finance analyzer
is the privacy-engineering proof. The site is the resume.

Beneath the brand surface sits the operator's tooling: a small CMS for
the feed and projects, an analytics dashboard for self-hosted visitor
insights, and a finance analyzer that runs entirely in the browser.
These exist to keep the brand surface fresh without external services
and to demonstrate full-stack judgment without leaking user data.

## Brand Personality

**Cinematic, rigorous, ARG-coded.**

Voice is calm, technical, slightly dry; the work does the talking and
the chrome around it sets the stage. Tone is closer to a film opening
than a sales page: things get introduced, not announced. The site
rewards the visitor who looks closer with a layered ARG (terminal
overlay, secret node in the force graph, `sudo su` keyboard trap,
shake-to-admin on mobile, replay-intro in the footer) without ever
asking the casual visitor to play to read the bio.

Emotional goals, in order of priority:

1. **Memorability.** The visitor remembers this site distinctly. They
   describe it to someone else within a week.
2. **Credibility.** Every cinematic flourish is backed by a real
   technical decision the visitor can verify by reading the code or
   exploring the playground.
3. **Delight.** The deeper layer (easter eggs, theme switching,
   view-source mode) earns a quiet smile from the visitor who finds it.

## Anti-references

What this site must explicitly NOT look or feel like:

- **Generic developer-portfolio template.** Avatar + bio + project grid
  + tech-stack icons + "Resume" button is the most common shape on the
  internet and signals nothing. Avoid the template even when it would
  be faster.
- **SaaS landing-page cliche.** Gradient hero with a big metric, three
  identical feature cards, social-proof logo strip. This is for B2B
  startups; it reads as "person who follows trends," not "person you
  would hire to set them."
- **Off-the-shelf cyberpunk-neon template.** Solid black + magenta/cyan
  glow + Matrix-rain decoration is the training-data reflex for
  "cinematic developer portfolio" and defeats the whole point of the
  ARG register. The site is cinematic; it is not a Cyberpunk 2077 fan
  page.
- **Corporate resume on the web.** Beige, polite, "I am passionate
  about clean code." Risk-averse to the point of forgettable.
  Recruiters might skim it; nobody remembers it.

## Design Principles

1. **Show, don't tell.** The site demonstrates every skill it claims.
   The hero is a real D3 simulation, not a screenshot. The cinematics
   are real intersection observers and CSS transforms, not a video
   loop. The privacy story is verifiable in source. Anything that
   could be a static asset must instead be the live thing.
2. **Reward the closer look.** Every surface is readable to a 10-second
   skimmer and rewarding to a 10-minute explorer. Easter eggs, theme
   switches, decrypt animations, the playground, the secret entry,
   the view-source toggle — all layered, none gating, none required.
3. **Cinematic with intent, never decorative.** Every effect has a
   job. The HUD chrome reads as instrumentation, not garnish. The
   decrypt animation marks scene transitions, not random labels. The
   marquee bands carry information (scene number, runtime, build
   number). If an effect would read as "vibe," it gets cut.
4. **Restraint in the productive places.** The brand surface is
   theatrical. The admin surface, forms, error states, and any place
   where the visitor or operator is trying to get something done are
   quiet. Speed and clarity beat drama there. The "print" theme
   exists as the boss-mode reference view; it disables the cinematics
   on purpose.
5. **Privacy by architecture, not by footer.** Visitor hashing rotates
   daily and never leaves the browser. The finance analyzer runs
   entirely client-side. No third-party trackers, no chat widgets, no
   marketing pixels. Privacy is a structural commitment that the
   visitor can verify by viewing source, not a paragraph at the bottom
   of the page.

## Accessibility & Inclusion

- **Target: WCAG 2.2 AA across all public pages and all four themes.**
  Contrast, keyboard navigation, focus rings, and skip links are
  non-negotiable on the brand surface; the admin surface meets the
  same bar.
- **`prefers-reduced-motion` is fully respected.** Reduced-motion
  replaces every cinematic with an instant-resolve or static fallback:
  decrypt-text settles immediately to its final string, kinetic
  reveals jump to their end state, scroll-snap is disabled, the boot
  sequence is auto-skipped, the custom cursor falls back to the
  system cursor, and ambient/UI audio remain off.
- **Audio is opt-in and off by default**, with persistent controls in
  the navigation. No autoplay, no permission prompts on first paint.
- **Decorative overlays** (grain, scan-lines, marquee bands, HUD
  chrome) are `aria-hidden="true"` and `pointer-events: none`. Screen
  readers see the underlying content uncluttered.
- **Decrypt-text** sets the final string on `aria-label` so screen
  readers announce the resolved value once, not the scrambling
  intermediate frames.
- **Scroll-locked scenes** have a hard fallback: below 768px the
  scroll-snap is disabled and the page becomes a normal scroll. No
  scrolljacking on touch.
- **Keyboard parity for every easter egg.** Triple-click, long-press,
  shake, and palette all have keyboard equivalents (`sudo su`
  keystroke trap is the canonical one).
- **Color-blind safety.** Category palettes are tested for the three
  most common color-vision conditions; data viz never relies on hue
  alone (shape, position, or label always carries the meaning).
