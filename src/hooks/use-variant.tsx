import { useMemo } from "react"
import { useLocation } from "react-router-dom"

export type LandingVariant = "a" | "b"

/**
 * Reads the active A/B landing variant from the URL query string.
 *
 * Usage:
 *   /            -> variant "a" (default / control)
 *   /?variant=b  -> variant "b" (experimental hero)
 *
 * The value is derived purely from the current location, so it updates
 * reactively on client-side navigation and is trivial to force in tests
 * or share via a link. Anything other than "b" resolves to the control.
 */
export function useLandingVariant(): LandingVariant {
  const { search } = useLocation()

  return useMemo(() => {
    const raw = new URLSearchParams(search).get("variant")?.toLowerCase().trim()
    return raw === "b" ? "b" : "a"
  }, [search])
}
