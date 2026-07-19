/**
 * Skip-to-content link for keyboard and screen-reader users.
 *
 * Visually hidden until focused, it lets people bypass the fixed header and
 * navigation and jump straight to the page's main content — a WCAG 2.4.1
 * (Bypass Blocks) requirement.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-fashion-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-elegant focus:outline-none focus:ring-2 focus:ring-fashion-accent/50 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}
