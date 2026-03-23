

# Plan: Fix the Logo Typography — Make the Wordmark Feel Intentional

## What’s wrong now
The new display font is loading globally, but the **logo wordmark itself is the weak point**:

- `Strat` in Playfair at `text-xl` is too delicate at nav size
- `OS` in small uppercase sans feels tacked on, not designed
- The serif/sans split works in theory, but at 20–24px it reads as two mismatched fragments instead of one premium brand
- Footer repeats the same issue, so the brand inconsistency shows up twice on every visit

This is not a font-loading problem anymore. It’s a **wordmark design problem**.

## Best direction
Instead of trying to force a magazine-style serif into a tiny logo, StratOS should use a **cleaner, more controlled premium wordmark system**:

- Keep the **app headings** premium and expressive
- Make the **logo text** tighter, simpler, and more custom-feeling
- Treat the logo like a brand mark, not like a heading

## Proposed fix

### 1. Rebuild the wordmark in `NavBar.tsx` and `Footer.tsx`
Replace the current:
- `Strat` = serif
- `OS` = small uppercase sans

with a more intentional wordmark layout:

**Option I would implement**
- `StratOS` as a single lockup
- `Strat` in a refined display serif or premium sans
- `OS` still distinguished, but not shrunken so much that it looks detached
- Tighter letter spacing, balanced baseline, slightly more spacing from the icon

This will make the logo feel like one brand instead of two text styles stitched together.

### 2. Separate “brand font” from “heading font”
Right now the same display logic is being reused too broadly.

I’d introduce a clearer system:
- **Brand wordmark font**: optimized for small sizes in nav/footer
- **Display heading font**: optimized for hero/section titles
- **Body/UI font**: Inter

That gives StratOS a more world-class identity system instead of one font doing every job.

### 3. Choose a stronger wordmark font
Playfair works better in large editorial headlines than in compact logos.

For the **logo**, I’d test a better premium candidate such as:
- **Cormorant Garamond** — more elegant, less stiff than Playfair
- **DM Serif Display** — stronger personality, cleaner at small brand sizes
- **Canela-style direction** — closest to Claude/Anthropic feel, if we can approximate with available web fonts
- If staying sans for the logo: **Manrope / Plus Jakarta / Satoshi-style direction** for a premium modern intelligence brand

My recommendation:
- **Keep a premium serif for hero headings**
- **Use a more controlled, luxury-modern font for the logo wordmark**
This usually produces a stronger brand than using the same serif everywhere.

### 4. Refine the icon + wordmark relationship
In `StratOSLogo.tsx`, the prism mark is solid, but the lockup likely needs:
- slightly smaller gap between icon and text
- slightly larger text height relative to the icon
- more vertical optical alignment
- a single visual rhythm between mark and wordmark

### 5. Apply consistently in footer and brand surfaces
Update:
- `NavBar.tsx`
- `Footer.tsx`

so the brand appears identical across the app.
If needed, I’d also check any page-level brand mentions to keep the system consistent.

## Files to change
1. `src/components/NavBar.tsx` — redesign the wordmark lockup
2. `src/components/Footer.tsx` — match the new brand lockup
3. `src/index.css` — define a clearer typography system for brand vs headings
4. `tailwind.config.ts` — add the new brand/display font families if needed
5. `src/components/StratOSLogo.tsx` — minor spacing/alignment polish if needed

## Result
After this change:
- the **hero can stay premium**
- the **logo becomes recognisable and intentional**
- the brand feels less like “a font swap” and more like a real executive-grade identity system

## Success criteria
- Logo reads clearly on mobile at nav size
- `StratOS` feels like one mark, not two mismatched text treatments
- Footer brand feels premium instead of decorative
- Typography hierarchy becomes deliberate: **brand / display / UI**

