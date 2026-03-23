

# Font Rating & Upgrade Plan

## Current Rating: 6.5/10

Instrument Serif is rendering correctly but it's **too thin, too decorative, and lacks authority**. On mobile especially, "Audit any decision." looks like a wedding invitation, not a strategic intelligence platform. The letterforms are wispy — they don't command attention or convey power.

### What's wrong specifically:
- **Too light** — weight 400 reads as delicate, not authoritative
- **Too curly** — the italic/decorative nature feels literary, not executive
- **No contrast** — the thin serif against thin Inter body text creates no visual hierarchy punch
- **Lowercase feels casual** — "Audit any decision." in this font reads soft

## The 10/10 Font: **Playfair Display**

Playfair Display is the font used by premium brands like The Economist, high-end consulting decks, and luxury SaaS platforms. It has:
- **High stroke contrast** (thick/thin variation) — instantly premium
- **Bold weight available** (700) — commands the page unlike Instrument Serif's 400-only
- **Wider letterforms** — fills space with authority on mobile
- **Google Fonts** — free, fast CDN, no licensing issues

Alternative considered: **DM Serif Display** (sharper, more modern) — but Playfair has better weight range and more refined feel at large sizes.

## Changes

### 1. `src/index.css`
- Replace `Instrument+Serif` import with `Playfair+Display:wght@400;700`
- Update the `h1, h2, h3` rule to use `'Playfair Display'` with `font-weight: 700` for h1, `400` for h2/h3
- Letter-spacing tightened to `-0.04em` for h1 (tighter = more premium at large sizes)

### 2. `tailwind.config.ts`
- Change `font-serif` from `["Instrument Serif", ...]` to `["Playfair Display", "Georgia", "serif"]`

### 3. `src/components/HomepageLanding.tsx`
- Hero headline: add `font-bold` — Playfair at 700 weight is where the magic happens
- The larger stroke contrast will make "Audit any decision." feel like a Bloomberg terminal headline

### 4. `src/components/NavBar.tsx` + `src/components/Footer.tsx`
- Wordmark "Strat" in Playfair Display 400 (elegant) + "OS" stays Inter semibold uppercase
- The thicker strokes of Playfair make the wordmark more distinctive at nav size (20px)

### 5. All section headings (already using `font-serif` class)
- `SystemSections.tsx`, `MidPageCTA.tsx`, `TestimonialWall.tsx`, `FAQAccordion.tsx`, `PricingPage.tsx` — automatically pick up the new font via the Tailwind `font-serif` utility. No code changes needed in these files

## Files Changed
1. `src/index.css` — Swap font import, update heading rules
2. `tailwind.config.ts` — Update serif family
3. `src/components/HomepageLanding.tsx` — Add font-bold to hero headline
4. `src/components/NavBar.tsx` — Wordmark uses Playfair
5. `src/components/Footer.tsx` — Wordmark uses Playfair

## What Doesn't Change
- Body text stays Inter
- All layouts, components, functionality unchanged
- Just the display font swap + weight adjustment

