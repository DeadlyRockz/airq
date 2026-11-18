# 09 - UI / UX Design

General rules for interfaces that look balanced, feel effortless and pass review the first time. This file is the union of every project's rule 09 and design-system file; where projects disagreed the DEFAULT is stated and "the project profile may override" marks what a `projects/<profile>.md` design section may change. Values (the primary hue, fonts, exact tokens) live in the token layer, see `../stacks/design-tokens-and-theming.md`. How a screen adapts between devices is `../stacks/responsive-adaptive-ux.md`, which wins over this file on layout, density adaptation, overlay choice and phone patterns.
Applies to: every screen, component and style file in every project - web (Tailwind v4 / shadcn), native (through the token mirror, `../stacks/expo-react-native.md`), WordPress / Shopify themes where a rule can apply, marketing pages included.

## 9.0 The rules that override taste

| #   | Rule                                                                                                                     | Breaking it      |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1   | Every spacing, padding, margin, gap and size is on the **spacing ladder** (§9.2).                                        | review rejection |
| 2   | Every font size is on the **type scale** (§9.3); **14px is the floor** for text a user reads (12px only where the profile admits it). | review rejection |
| 3   | Every colour is a **token** (§9.4). No raw palette class, no hex, no `bg-white`, no `text-white`.                        | review rejection |
| 4   | **No arbitrary bracket values** in a class name (§9.11).                                                                 | review rejection |
| 5   | Text meets **WCAG 2.2 AA 4.5:1**; large text, icons, control boundaries and focus rings **3:1**, in **both** themes.     | blocking comment |
| 6   | Colour is never the only carrier of meaning: pair it with an icon, text or shape.                                        | blocking comment |
| 7   | Every state is designed: default, hover, pressed, focus-visible, disabled, loading, empty, error (§9.8).                 | blocking comment |
| 8   | Reuse the shared UI package and the app's shared components (§9.9). Never hand-roll a second one.                        | blocking comment |
| 9   | Light and dark ship together; a screen that exists in one theme is incomplete (§9.4).                                    | blocking comment |
| 10  | One focal point and one primary action per screen (§9.5).                                                                | blocking comment |

## 9.1 Proportion and the golden ratio (φ ≈ 1.618)

- **SHOULD** use φ as the default ratio for relating two layout sizes: columns, hero-vs-body, card image-vs-content, list-vs-detail panes, image aspect, hero height.
- **SHOULD** size a two-pane layout so the wider pane ≈ 1.618× the narrower one (content `62%` / sidebar `38%`), built from Tailwind's own grid spans: `grid-cols-8` + `col-span-5` / `col-span-3`, or `grid-cols-12` + `col-span-7` / `col-span-5` (a `grid-cols-[1.618fr_1fr]` template is the one bracket form allowed, §9.11).
- **MAY** approximate φ with adjacent Fibonacci numbers (8, 13, 21, 34, 55, 89) for layout sizing, rounded to the ladder.
- **MAY** pick a marketing display ladder from φ (expressive, editorial) or 1.25 (dense), always from Tailwind's built-in text steps: `text-base → text-2xl → text-4xl → text-6xl → text-8xl` is the nearest φ-like ladder, `text-base → text-xl → text-2xl → text-3xl` the softer one. App headings may follow √φ ≈ 1.27 (14 → 16 → 20) as role classes.
- **MUST NOT** derive the product type scale from φ: it is fixed and density-driven (§9.3). φ governs proportion, not font size.
- **MUST NOT** apply φ mechanically at the cost of usability. It is a starting heuristic, not a law - round to the spacing scale, respect touch targets, and let content and accessibility win when they conflict.

## 9.2 Spacing - the 8-point ladder with half-steps

```
4                        half-step: inner gaps only (icon-label, badge padding, chip insets)
8 12 16 24 32 40 48 64   the ladder (12 = dense half-step: table cells, list rows)
80 96 128                hero / landing only
```

Tailwind `--spacing: 0.25rem`, so the class number is px / 4: `-1 -2 -3 -4 -6 -8 -10 -12 -16`.

- **MUST** put every spacing, padding, margin, gap and size on the ladder - the Tailwind scale on web, the `spacing` token map on native - never an ad-hoc pixel value.
- **MUST NOT** use the in-between steps `-0.5 -1.5 -2.5 -3.5 -5 -7 -9 -11 -14 -18` (2, 6, 10, 14, 20, 28, 36, 44, 56, 72px) for spacing or size. Tailwind generates them; review rejects them. There is always a neighbouring legal value.
- Allowed exceptions: `h-0.5` / `w-0.5` (2px) for hairlines, rules and underlines (a line thickness, not rhythm); `h-11` / `size-11` / `min-h-11` (44px) only where it carries the touch-target minimum (§9.7).
- **MUST** keep sizes on the ladder too: icons `size-4` inline, `size-6` standalone, 32 / 40 for feature icons; dots `size-2` / `size-3`; control heights 32 / 40 / 48 (`h-8` / `h-10` / `h-12`) through the control-height tokens, never a literal height on a primitive (§9.10).
- **MUST** use the responsive padding steps on marketing pages: containers `px-4 sm:px-6 lg:px-8 xl:px-12`; sections `py-8 sm:py-12 md:py-16 lg:py-24`; cards `p-4 sm:p-6 lg:p-8`. Directory and profile pages stay compact at `py-8 md:py-10 lg:py-12`.
- **MUST** use ONE surface padding step on product screens: `p-4` inside every card, panel, sheet header and sheet body, `gap-4` (or `space-y-4`) between blocks and grid cells; no `p-5` / `p-6` / `p-8` and no `sm:` / `lg:` padding bumps on a surface. Tighter steps (`p-2`, `p-3`, `gap-2`, `gap-3`) are for the inside of a control or a list row. The project profile may override the surface step (for example `p-5`).
- **MUST NOT** add padding to a card's header / content / footer parts: the Card primitive owns its inset through a CSS-variable hook, and a `p-4`, `pt-*` or `pb-*` on a part stacks on top and doubles it. Adjust the whole card with its `size` prop or the hook, never per part.
- **SHOULD** group by proximity: related items 8–12 apart, unrelated 24+; section gap 48–64; card padding 16–24. Whitespace scales with its container - a hero breathes at 96, a table row at 12. Prefer space to a divider.
- **SHOULD** give marketing content room to breathe - generous whitespace reads as quality; do not fill every pixel on large screens. Product screens aim for information efficiency without crowding.

## 9.3 Typography

Tailwind's default scale is the scale, unchanged: `text-xs` 12 · `text-sm` 14 · `text-base` 16 · `text-lg` 18 · `text-xl` 20 · `text-2xl` 24 · `text-3xl` 30 · `text-4xl` 36 · `text-5xl` 48; `text-6xl` (60) and `text-7xl` (72) are hero-only.

- **MUST** keep **14px (`text-sm`) as the floor** for any text a user is expected to read; caption and meta text is 14, separated from body by colour (`text-muted-foreground`), not size. The project profile may admit 12px (`text-xs`) for meta, badges, captions, pager and table meta only - never body, labels or anything the user acts on. Nothing is ever below 12px; the only exceptions are SVG chart tick labels and a fixed-size cell the profile names.
- **MUST** use the fixed product type roles (density-driven, not fluid; the same role gets the same class on every screen and breakpoint):

  | Role                                       | Class                                                                                  |
  | ------------------------------------------ | -------------------------------------------------------------------------------------- |
  | Page title (one per screen, dashboards too) | `text-xl font-bold leading-tight`                                                     |
  | Stat / KPI value                           | `text-2xl font-semibold tabular-nums`                                                  |
  | Card / section title                       | `text-base font-semibold`                                                              |
  | Sheet / dialog / alert title               | set by the primitive (`text-lg font-semibold leading-tight`) - never override it       |
  | Form-section heading, small-card title     | `text-sm font-semibold`                                                                |
  | Body, table cells, labels, buttons         | `text-sm` (inputs `text-base md:text-sm`)                                              |
  | Meta, captions, pager, page description    | `text-sm text-muted-foreground` (`text-xs` only where the profile admits 12px)         |
  | Marketing body / lead                      | `text-base` / `text-lg`                                                                |

- **MUST** scale marketing-page typography across breakpoints as below; product screens keep the fixed roles and never use these sizes:

  | Element        | Mobile `<640` | Tablet `640–1024` | Desktop `1024+` | Classes                              |
  | -------------- | ------------- | ----------------- | --------------- | ------------------------------------ |
  | Display / hero | 36            | 48                | 64–72           | `text-4xl sm:text-5xl lg:text-7xl`   |
  | H1             | 30            | 36                | 48              | `text-3xl sm:text-4xl lg:text-5xl`   |
  | H2             | 24            | 30                | 36              | `text-2xl sm:text-3xl lg:text-4xl`   |
  | H3             | 18            | 20                | 24              | `text-lg sm:text-xl lg:text-2xl`     |
  | Body           | 16            | 16                | 16–18           | `text-base lg:text-lg`               |
  | Caption        | 14            | 14                | 14              | `text-sm` (`text-xs sm:text-sm` only with a 12px admission) |

- **MUST** limit a project to one sans family for UI and data plus one mono for scores, seeds, times, IDs, keys and payloads; the profile may add one display face for page titles and above. No fourth family, no display face in body copy, mono never for prose.
- **MUST** keep bold rare: `font-bold` (700) only on the one page title per screen; `font-semibold` (600) only on card / section titles, dialog titles and stat values; `font-medium` (500) on labels, buttons, tabs, badges and table heads; everything else `font-normal` (400). Never bold for emphasis inside body text, table cells, list rows, links, descriptions or values; emphasis comes from colour (`text-foreground` vs `text-muted-foreground`) or size. Nothing heavier than 700 (`font-extrabold`, `font-black` banned). Native uses the same map through the token mirror (it picks the static family per weight; it does not synthesise). (Superseded 2026-11-10: 700 allowed for "emphasis".)
- **MUST** rank hierarchy by size, then weight, then colour (`text-foreground` → `text-muted-foreground`), then space; jump at least two scale steps between levels (16 → 20 reads as an accident, 16 → 24 as a decision). If everything is bold, nothing is.
- **MUST** keep text inputs `text-base md:text-sm` (≥ 16px on touch so iOS does not zoom on focus); 16 on native.
- **MUST** use `tabular-nums` and right alignment on money, quantities and every numeric column (formatting itself is `../core/11-cross-cutting-standards.md`).
- **MUST** use only the named line-height steps (`leading-none|tight|snug|normal|relaxed`): headings `leading-tight` (~1.1–1.2), body keeps the size's default (~1.4–1.6) with no `leading-*` added.
- **MUST NOT** set letter-spacing or kerning anywhere: no `tracking-*` class (named or bracket), no `letterSpacing` style or RN prop, no `font-kerning` / `font-feature-settings` override, no tracking inside a type token. Text keeps the font's own spacing. (Superseded 2026-11-10: `tracking-tight` on display headings and `tracking-wide` on uppercase labels.)
- **MUST NOT** uppercase text for styling: no `uppercase` class, `text-transform: uppercase` or `textTransform: 'uppercase'` on eyebrows, labels, table heads, badges, tabs or buttons; write sentence case. Uppercase appears only when the content itself is uppercase (acronyms such as QR or GST, codes, licence keys, token numbers), typed that way in the string.
- **MUST** take font colour and size only from the global stylesheet through Tailwind: colour from the semantic tokens in `globals.css` (`text-foreground`, `text-muted-foreground`), size from the §9.3 roles; never an inline `style`, a hex, a raw palette class or a bracket size (§9.4, §9.11).
- **SHOULD** cap body copy at 60–75 characters (`max-w-prose`; a max-content-width constant on native).
- **SHOULD** let the OS font-size setting scale text rather than locking it (native up to 130%, web 200% zoom).

## 9.4 Colour and contrast

- **MUST** support both light and dark themes on every screen through semantic tokens (`../stacks/design-tokens-and-theming.md`). Light is the default, the user switches in the header (system / light / dark), both are verified before review, and a PR that changes UI carries a screenshot of each.
- **MUST** use the project's own `primary` token as the only brand and interactive accent - primary buttons, the active nav row, focus rings, selected rows, links. The primary hue is a **profile value** (`projects/<profile>.md`); this file only constrains how it is used. Primary is reserved for the one thing to click.
- **MUST NOT** use random, uncurated or arbitrary colours for buttons, active states, focus rings or brand accents, and **MUST NOT** use Tailwind's default palette scales as a stand-in. Decorative brand hues the profile lists (gradients, illustration, per-product accents) carry no text, action or focus and stay in the brand moments the profile names.
- **MUST** meet WCAG 2.2 AA: ≥ 4.5:1 for normal text; ≥ 3:1 for large text (≥ 24px, or ≥ 19px bold), meaningful icons, control boundaries and focus rings. Decorative dividers and card edges are exempt; the boundary of a control the user operates is not (the `input` token, 3:1). **SHOULD** reach ≥ 7:1 for body text in dark mode. Never ship grey on light grey.
- **MUST NOT** use colour as the only means of conveying information: pair it with an icon, label, dot, shape or pattern. A status badge is icon (or dot) + text with its tone from a token.
- **MUST** keep the semantic meanings fixed: `primary` action / active / link (and positive / success where the primary hue is itself positive); `success` confirmed / paid / won (when the profile adds it); `warning` pending / needs attention; `destructive` failure / delete / live danger; `muted` off / secondary; `accent` tinted surface; `overlay` modal backdrop; `rating` stars (the one hue that does not follow the brand); `chart-1 … chart-5` data series.
- **MUST NOT** write a colour in code. A raw palette class (`text-emerald-600`, `bg-amber-500/10`, `text-gray-500`, `text-white`, `bg-black/60`, `bg-white`), a hex (`bg-[#030914]`, `fill="#157E3C"`) or `style={{ color }}` is a review rejection. `bg-white` is a bug almost everywhere: it does not flip in dark mode.
- Sanctioned exceptions, each with a comment naming the token it mirrors: code that cannot read CSS (canvas, PDF / print output, email, spreadsheet exports, a payment SDK dialog) reads the token at runtime or carries its hex; a light plate behind uploaded transparent logos and photos (needed in both modes); domain-fixed data encodings (team colours, confetti); a scanner-constrained white field (QR). Chart series come from the chart tokens, not from this list.
- **MUST** wrap an always-dark band (photo hero, scrim, footer, auth showcase) in `dark` and use `background` / `foreground` like any other surface, so it is the dark theme, not a third palette.
- **MUST** put text on a tint on `bg-accent` (an opaque surface) so its contrast is fixed; a `/10` tint is the worst case - measure it.
- **MUST** draw chart series from `chart-1 … chart-5` in the fixed slot order the profile lists (`chart-1` is the primary hue), never cycled: the order keeps neighbouring marks apart for colour-blind readers and was validated in both modes, including a donut's wrap-around pair. Slot 5 needs visible labels on a light surface; a single-series chart uses `primary`.
- **SHOULD** follow 60 / 30 / 10: surfaces 60 (`background`, `card`), structure 30 (`muted`, `secondary`, `border`), accent 10 (`primary`, `destructive`). If a screen looks bland, the fix is hierarchy and space, not more accent; if it reads accent-heavy, the accent has escaped its budget.
- **MUST** build the dark set to the dark-theme rules Material, Apple's HIG and WCAG agree on, not by inverting the light set:
  - **one neutral ramp** in OKLCH for both modes (one hue, default 260, chroma ≤ 0.012) - only lightness moves between steps; no second ramp, no HSL;
  - a **dark grey canvas, never near-black** (`--background` L ≈ 0.19), with raised surfaces stepping **up** in lightness (card L 0.23, popover L 0.26, hover above that) and borders, not shadows, drawing the edges;
  - a **lighter, slightly desaturated primary** in dark mode (L ≈ 0.72) with dark on-primary text - a darker primary under white text fails 4.5:1 as link text and 3:1 as the active nav row on a dark surface; every saturated token (`destructive`, `warning`) lightens the same way and takes dark on-colour text;
  - **off-white body text** (L 0.93) and L 0.70 secondary text, never pure white; pure white is reserved for on-gradient and on-light-primary;
  - light mode **darkens** on interaction (hover, pressed), dark mode **lightens**;
  - `color-scheme` declared on `:root` and `.dark`, so native controls, scrollbars and date pickers follow;
  - no zebra striping in dark tables - hover and selection carry the wayfinding; every raised panel (popover, menu, dialog, sheet, toast) sits one lightness step above the surface beneath it with a lighter border.
- **MUST** keep the contrast table green: the token test asserts every text and UI pair in both modes (`../stacks/design-tokens-and-theming.md` §11). A new token is a new row; re-measure whenever a colour changes; check tints at 50% display brightness.

## 9.5 Layout, hierarchy and the shape of a screen

- **MUST** design mobile-first: base styles target the smallest screen and are enhanced upward. Breakpoints: mobile `< 640`, tablet `sm` / `md`, laptop `lg` / `xl`, wide `2xl` with content capped (`max-w-7xl` or `max-w-screen-2xl`; the profile picks). Components change where their content breaks, not at one shared set of device widths - test widths, per-device layouts, navigation, tables, forms, overlays and density adaptation are `../stacks/responsive-adaptive-ux.md`.
- **MUST** give each screen one focal point and one primary action, one secondary, everything else tertiary (the density budget). Dashboards, lists and articles read in an F-pattern (most important data top-left; never bury status in a right-hand column); landing pages in a Z-pattern; hero and image compositions follow the rule of thirds.
- **MUST** make the primary action large and close to the thumb or cursor (Fitts): full-width primary buttons on mobile; never a 24px icon button as the main action.
- **SHOULD** cap top-level navigation at ~5 items (Hick), chunk long settings into groups of 5–7 (Miller), and put advanced options behind progressive disclosure (basic → advanced → expert; a multi-step wizard beats one dense page). Navigation mirrors the user's mental model, not the database schema; depth over breadth.
- **SHOULD** group without borders (Gestalt): proximity (8–12 related, 24+ unrelated), similarity (same treatment ⇒ same kind of thing), continuity (shared edges - a ragged left edge reads as broken), closure (implied containers beat drawn boxes). Fewer lines, more space. Remove before rearranging: for every element ask "can this go?".
- **SHOULD** align to the grid and signal importance with size, contrast and position (top-left in LTR); use logical properties (`ps-` / `pe-`, `ms-` / `me-`) so RTL needs no overrides.

## 9.6 Radius, borders and elevation

- **MUST** use one radius on every surface: buttons, inputs, selects, badges, chips, cards, dropdowns, popovers, dialogs, sheets, drawers and images all read the single `--radius` token from the global stylesheet, written as the one class the project maps to it (shadcn on Tailwind 4: `rounded-lg`, which resolves to `var(--radius)`; native: the one `radius` value in the token mirror). No other `rounded-*` step, no breakpoint bumps, no per-call-site override; the value changes only in `globals.css`. (Superseded 2026-11-10: radius scaled with surface size, and the nested-radius rule.)
- The only other radii: `rounded-full` for true circles and bars (avatars, status dots, progress tracks, switches) and `rounded-none` for a surface flush with the screen edge. A surface inside another uses the same token; media flush with a card's edge is clipped by the card (`overflow-hidden`).
- **MUST NOT** mix radius steps within one component - a card, its header strip and its footer share one outer radius.
- Compact density (§9.10) does not change the radius; the one token already applies, and a chip uses it too, not a pill.
- **MUST** draw every border the same way: the plain `border` utility (1px) in the `border` token colour; side borders use the same width (`border-b`, `border-t`, `border-l`, `border-r`).
- **MUST NOT** use any other width or colour - no `border-2`, `border-4`, `border-[1.5px]`, `border-gray-200`, `border-[#e5e7eb]`, or `divide-*` in another colour. A state border is a token only: `border-primary` (selected / active), `border-destructive` (error), `border-input` (form controls, set by the primitive). Hairlines (`h-0.5` / `w-0.5`: tab underline, active-nav indicator, progress rule) are line thicknesses, not borders.
- **MUST** draw focus with the shared `ring` token the primitives already apply (`focus-visible:ring-2 ring-ring`) - never a custom ring width or colour at a call site. An input's focus shows two signals: border and ring.
- **MUST** follow "borders divide, shadows float": a 1px border separates adjacent surfaces (chrome ↔ canvas, table rows, card edges); shadows are only for things that genuinely float (popovers, menus, dialogs, dragged rows). `shadow-xs … shadow-lg` only, tinted from the darkest neutral, one light source, never pure black in light mode. Dark mode expresses elevation as a lighter surface step, not a shadow.
- **MUST NOT** nest a card inside a card; use `border-t` dividers inside one card. Depth comes from the three-layer surface model (chrome on `card` → canvas on `background` → data card on `card` + border + `shadow-sm`), not from arbitrary tints.

## 9.7 Accessibility (non-negotiable)

- **MUST** use semantic HTML on web and the accessibility props on native (`accessible`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`), with full keyboard operation and a logical focus / screen-reader order.
- **MUST** show a visible `:focus-visible` state in both themes; never remove an outline without a replacement.
- **MUST** label every input, and give every icon-only control an accessible name (`aria-label` / `accessibilityLabel`) plus, on web, a tooltip. An unlabelled icon button is a blocking review comment.
- **MUST** give `alt` text to meaningful images and `alt=""` / `accessibilityElementsHidden` to decorative ones.
- **MUST** keep interactive targets ≥ 44×44 on coarse pointers (the token layer expands hit areas; opt out only where controls sit closer than 44px apart) and ≥ 40×40 on fine pointers (WCAG 2.2 floor 24×24), with ≥ 8px between adjacent targets. A 36px compact control keeps its visual size and expands its pressable area (padding, `hitSlop`).
- **MUST** respect `prefers-reduced-motion` (web) and Reduce Motion (native): shimmer, carousels and decorative transitions turn off; state changes stay instant.
- **MUST** survive 200% text zoom on web and OS font scaling up to 130% on native, and announce async results with `aria-live` / `accessibilityLiveRegion`.
- **MUST** verify contrast and focus in both themes, not just the one you developed in.

## 9.8 States, feedback and motion

- **MUST** ship every component with every state designed: default, hover, pressed / active, focus-visible, disabled, loading, empty, error. Every data view shows loading, empty, error and populated (`../core/11-cross-cutting-standards.md`).
- **MUST** render loading as a skeleton that mirrors the loaded component's geometry and radius (no layout shift), not a spinner block, wired to the framework's own primitives (`loading.tsx` / `error.tsx` per route segment on Next.js, `../stacks/nextjs.md`; expo-router's `ErrorBoundary` on native).
- **MUST** design the empty state as a first-class screen: what is missing → why it matters → the one action that fills it. Never an empty table with no invitation.
- **MUST** write errors as what happened and what to do next - never a raw exception string. Field errors use `aria-invalid` + `aria-describedby` with the message under the field; optional markers are muted text, never red asterisks.
- **MUST** give feedback for every mutation: press feedback within one frame, then the outcome of every write as a toast (one action max, stack limit 3, auto-dismiss 5s except progress toasts, `role="status"` / `role="alert"` for errors). Toasts are for outcomes that survive navigation.
- **MUST** confirm destructive actions in an alert dialog that names the action ("Delete workspace", never "OK"), and make them reversible where possible.
- **SHOULD** use optimistic UI for user-initiated writes that can be rolled back.
- **SHOULD** keep motion subtle and purposeful - it clarifies a state change, never decorates: 150ms micro (hover, toggle), 250ms standard (expand, sheet), 400ms max (page transition); `ease-out` entering, `ease-in` exiting; animate `transform` and `opacity` only, never `width` / `height` / `top`. Decorative motion is deleted. The project profile may override the durations.

## 9.9 Consistency and shared components

- **MUST** reuse the shared UI package (`@repo/ui` or equivalent: shadcn primitives + tokens) and the app's shared components (page header, stat card, data table, table skeleton and load error, empty state, status badge, form sheet frame, detail list) rather than reinventing a pattern. A component that exists there is the component: extend it with variants (`cva` merged through `cn()`); forking it is a future inconsistency.
- **MUST** keep one recipe per meaning across the product: the selected / "on" state, the focus ring, the active-nav indicator, the status badge. If two screens express the same idea differently, one of them is a bug.
- **MUST** keep the same component the same on phone and desktop - same name, same behaviour, same spacing. A "Card" feels identical in both.
- **MUST** keep a single place (tokens, theme, component library) that defines the look, and change that place, not the call site. New shadcn components install into the shared package, never into a `components/ui` folder inside an app (`../stacks/monorepo-pnpm-turborepo.md`).
- **SHOULD** use one tab style per screen (pill tabs for ≤ 4 settings views, underline tabs for record sub-views, never both), tooltips for labels only, popovers for click-triggered interactive content, hover cards for read-only previews that never contain actions.

## 9.10 Density modes

Two density modes exist, chosen per app in the project profile and applied by one attribute on `<html>` (`data-density="compact"` by convention, `../stacks/design-tokens-and-theming.md` §5) so call sites never change:

- **Touch (default):** controls 36 / 40 / **44** / 48 for `xs` / `sm` / default / `lg` and the one §9.6 radius - every default control already clears the 44px target.
- **Compact:** dense tools used all day on a laptop (admin dashboards, back offices): controls 28 / 32 / **36** / 40, one radius on every surface, one surface step (`p-4`, `gap-4`), the fixed §9.3 roles with no heading above `text-2xl` outside sheet, dialog and alert titles. It overrides §9.2's responsive padding and the §9.3 marketing sizes.
- **MUST** take control heights from the `--control-h*` tokens the primitives read; pick a `Button` `size`. **Never** override `h-*`, `size-*`, `text-*`, `px-*` or `rounded-*` on a `Button`, `Input` or `SelectTrigger` at a call site. A link that acts as a button is `<Button asChild>`.
- **MUST** keep the page scrolling inside the app shell (`h-dvh overflow-hidden`, one scroll area) so the sidebar, page header and sticky save bar stay put; which overlay a form opens in, how lists render per device and how the shell folds are `../stacks/responsive-adaptive-ux.md`.
- **SHOULD** make every scrollbar look alike (`scrollbar-thin` on native scroll boxes, the shared scroll area for large regions).
- Marketing, public directory and auth pages are expressive rather than dense: §9.2's responsive steps, the §9.3 marketing scale and card grids apply there; §9.0, §9.4, §9.6, §9.7 and §9.11 still do.

## 9.11 No arbitrary values (every app and package, marketing included)

- **MUST NOT** put a hand-written value in square brackets in any class name: `w-[400px]`, `p-[3px]`, `mt-[13px]`, `text-[13px]`, `text-[0.95rem]`, `leading-[1.2]`, `tracking-[0.2em]`, `rounded-[10px]`, `shadow-[0_2px_8px_…]`, `z-[999]`, `bg-[#…]`, `max-w-[70ch]` (use `max-w-prose`). Pick the nearest standard step; sizes, spacing, colours, radii, borders, shadows, z-index, font sizes and line-heights all have one; letter-spacing is never set (§9.3).
- **MUST** use Tailwind's own built-in scale for every size: spacing (`p-4`, `gap-6`), widths and heights (`w-64`, `max-w-md`, `h-10`, `size-4`), font size (`text-sm`), radius (the one `--radius` class, §9.6), shadow (`shadow-sm`), z-index (`z-10`, `z-50`), grid (`grid-cols-8`, `col-span-5`). Named sizes (`w-sm`, `max-w-xs`) and whole / half steps (`p-1`, `min-h-72`) are fine; odd fractions (`p-0.75`) are not.
- **MUST NOT** use `style={{ fontSize | lineHeight | letterSpacing | color | padding }}`, or create `@theme` size tokens / `@utility` classes to stand in for a hand-picked value (a `--step-1: 1.618rem`, a `text-hero` at 26px). Colour tokens and the primitive tokens (`--radius*`, `--control-h*`, `--card-spacing`) are the only theme variables; a profile MAY add role utilities (page title, heading, subheading) whose every value is already a scale step.
- The only brackets allowed: a `calc()` / `min()` / `max()` / `clamp()` no step can express; `var(--x)` and the CSS-variable hooks the primitives define (`[--card-spacing:…]`, `[--print-scale:…]`); `env(safe-area-inset-*)`; `url(…)`; grid templates (`grid-cols-[1.618fr_1fr]`, no px); data / aria / child-selector variants (`data-[state=open]:`, `[&_svg]:size-4`); SVG chart tick labels.
- A bracket value, raw colour or wide border outside those exceptions is a review rejection, and the lint rule in `../templates/design-enforcement/README.md` fails the build on it; a file may only warn while it sits in the app's `design-backlog.json`, and that list only shrinks.

```tsx
// ✗ Rejected
<h2 className="text-[18px] leading-[1.2] tracking-[-0.01em] border-2 border-gray-300 rounded-[10px] text-gray-500">
// ✓ Accepted
<h2 className="text-base font-semibold leading-tight text-muted-foreground">
<div className="rounded-lg border">
```

## 9.12 Native screens

React Native cannot read `globals.css` or Tailwind classes, so the native app applies this rule's intent through a token mirror (`../stacks/expo-react-native.md`; mirror mechanics in `../stacks/design-tokens-and-theming.md` §10):

- **MUST** take every colour, spacing, font size, line height, radius and the touch-target minimum from the mirror file (hex, each value commented with the token it mirrors); change the CSS first, then the mirror, in the same commit. The only literal numbers are hairlines (`1`, `StyleSheet.hairlineWidth`) and device-derived metrics (safe-area insets, `Dimensions`).
- **MUST** follow the system light / dark setting through those tokens, keep WCAG AA, show status with icon + text, keep targets ≥ 44pt with ≥ 8 between, keep body text ≥ 16, support font scaling to 130%, respect Reduce Motion, and pass explicit line heights (RN does not derive them).
- Web patterns map to native ones: a right-side sheet becomes a screen or bottom sheet, a data table becomes a list, the sidebar becomes bottom tabs (`../stacks/responsive-adaptive-ux.md`).

## 9.13 Review checklist

- [ ] Spacing and sizes on the ladder; no banned steps (§9.2)
- [ ] Font sizes on the scale; nothing under the floor (§9.3)
- [ ] Tokens only; checked in light **and** dark; both screenshots attached (§9.4)
- [ ] Hierarchy readable in one second; one primary action (§9.5)
- [ ] One radius token on every surface, `border` only, no nested cards (§9.6)
- [ ] No `uppercase` styling, no `tracking-*` / letter-spacing / kerning; colour and size from `globals.css` tokens via Tailwind (§9.3)
- [ ] Focus, keyboard, labels, 44px targets, reduced motion (§9.7)
- [ ] Loading, empty, error states; every write toasts; destructive actions confirmed (§9.8)
- [ ] Reused the shared component instead of a new one (§9.9)
- [ ] Control sizes via tokens; density attribute untouched at call sites (§9.10)
- [ ] No bracket values; lint green; `design-backlog.json` did not grow (§9.11)

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/09-ui-ux-design.md
- private/git-repo/claredesk/billing/engineering-rules/09-ui-ux-design.md
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/engineering-rules/09-ui-ux-design.md
- private/git-repo/claredesk/booking/engineering-rules/09-ui-ux-design.md
- private/git-repo/claredesk/billing/claredesk-billing/apps/app/engineering-rules/09-ui-ux-design.md
- private/git-repo/claredesk/billing/claredesk-billing/apps/app/engineering-rules/10-design-system.md
- development-team/git-repo/s22-internal-projects/tournament/DESIGN.md
- development-team/git-repo/s22-internal-projects/tournament/dropin-tournament-app/CLAUDE.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/docs/adr/0002-shared-ui-package-and-design-tokens.md
- private/git-repo/claredesk/booking/docs/adr/0046-dark-theme-token-scale.md
- Consolidated 2026-11-08
