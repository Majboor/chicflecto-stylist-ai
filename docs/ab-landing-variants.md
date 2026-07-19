# A/B Landing Hero Variants

ChicFlecto's landing page ships two interchangeable hero treatments so we can
A/B test messaging and layout without a feature-flag service. The active
variant is chosen entirely from the URL query string, so any variant can be
linked, bookmarked, or forced in a test.

## How to switch

| URL | Variant | Hero |
| --- | --- | --- |
| `/` | **A** (control, default) | `src/components/hero-section.tsx` |
| `/?variant=b` | **B** (experimental) | `src/components/hero-section-b.tsx` |

Anything other than `variant=b` (missing, empty, or any other value) resolves
to the control. Matching is case-insensitive and whitespace-trimmed.

## What differs between A and B

| | Variant A (control) | Variant B (experimental) |
| --- | --- | --- |
| Layout | Centered, single column | Split two-column (copy left, live "Today's picks" card right on `lg`) |
| Headline | "Elevate Your Style with **AI** Fashion Expertise" | "Your wardrobe, **reimagined** by AI" |
| Sub-copy | Feature-led | Benefit-led, action-oriented |
| Primary CTA | "Get Style Recommendations" | "Style me now" |
| Secondary CTA | "Create Style Profile" | "Build my style profile" |
| Extra proof | — | 5-star social-proof trust row |

Both variants keep identical behavior below the hero (Features, Outfit
Showcase, CTA sections) and identical auth handling — unauthenticated clicks on
either CTA route to `/auth` with a toast, authenticated clicks route straight
to the target page. Premium (`isPremium`) copy and badges are honored in both.

## Implementation notes

- `src/hooks/use-variant.tsx` — `useLandingVariant()` reads `?variant` from the
  current location via `react-router`'s `useLocation`, memoized on `search`.
  Returns the `"a" | "b"` union.
- `src/pages/Index.tsx` — selects the hero with a single ternary:
  `{variant === "b" ? <HeroSectionB /> : <HeroSection />}`. No other page code
  changed, so the control path is byte-for-byte the original render.
- Variant B lives in its own component; the control hero is untouched, which
  keeps the two treatments isolated and easy to remove after the test concludes.

## Verifying locally

```bash
npm install
npm run build          # type-checks + bundles
npm run preview        # serves the production build (default :4173)
# open http://localhost:4173/            -> variant A
# open http://localhost:4173/?variant=b  -> variant B
```
