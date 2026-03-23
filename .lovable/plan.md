

# Fix: Trust Strip Text Wrapping on Mobile

## Problem
On 390px mobile, the three trust metrics ("6 frameworks", "30 seconds", "10-step audit") wrap awkwardly because the text is too wide for the available space at `text-xl` with `gap-10`.

## Solution — Number-Forward Layout
Split each metric into a **large number** and a **small label** on separate lines:

| Current | New |
|---------|-----|
| "6 frameworks" | **6** (text-3xl bold) + "frameworks" (text-xs) |
| "30 seconds" | **30s** (text-3xl bold) + "to results" (text-xs) |
| "10-step audit" | **10** (text-3xl bold) + "audit steps" (text-xs) |

This prevents wrapping entirely — single short values never break. The numbers become the visual anchor (scannable), labels provide context underneath.

## Changes — `src/components/TrustStrip.tsx`
- Change metrics data to `{ icon, number, label }` format
- Render number as `text-2xl sm:text-3xl font-bold` on its own line
- Render label as `text-xs text-text-tertiary` below
- Reduce gap from `gap-10` to `gap-8` on mobile
- Keep icons at `w-5 h-5`

## Files Changed
1. **`src/components/TrustStrip.tsx`** — Split values into number + label, prevent wrapping

