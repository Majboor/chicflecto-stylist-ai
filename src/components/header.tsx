
import { useState, useEffect } from "react"
import { ButtonCustom } from "./ui/button-custom"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, Gem, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useSubscription } from "@/hooks/useSubscription"
import { useIsMobile } from "@/hooks/use-mobile"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Style Profile", href: "/profile" },
  { name: "My History", href: "/style-history" },
  { name: "Outfits", href: "/outfits" },
  { name: "Inspirations", href: "/inspirations" },
  { name: "Color Palette", href: "/color-palette" },
  { name: "Pricing", href: "/style-advice#pricing" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const isMobile = useIsMobile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Robustness: always close the mobile menu when the route changes so a
  // stale open panel never lingers over a newly navigated page.
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Robustness: while the mobile menu is open, close it on Escape and lock the
  // background scroll so the page underneath doesn't move under the panel.
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    
    // If it's a hash link on the same page
    if (href.includes('#') && location.pathname === href.split('#')[0]) {
      const id = href.split('#')[1]
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setIsMobileMenuOpen(false)
        return
      }
    }
    
    // Otherwise navigate to the new page
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link to="/" className="block" aria-label="ChicFlecto — home">
              {/* Brand wordmark: a link label, not a page heading, so it does not
                  compete with each page's real <h1> in the heading outline. */}
              <span aria-hidden="true" className="fashion-heading text-xl font-semibold tracking-tight">Chic<span className="text-fashion-accent">Flecto</span></span>
            </Link>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav className="hidden md:block" aria-label="Global">
              <ul className="flex items-center gap-8">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href.split('#')[0]
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        aria-current={isActive ? "page" : undefined}
                        className="link-underline text-sm font-medium text-fashion-text/80 transition hover:text-fashion-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fashion-accent focus-visible:ring-offset-2 rounded aria-[current=page]:text-fashion-accent"
                      >
                        {item.name}
                      </a>
                    </li>
                  )
                })}
                {isPremium && (
                  <li>
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                      <Gem className="h-3 w-3" />
                      <span>Premium</span>
                    </div>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                {user ? (
                  <ButtonCustom 
                    variant="subtle" 
                    className="rounded-full flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/accounts");
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span className={isMobile ? "hidden" : "block"}>Account</span>
                    {isPremium && <Gem className="h-4 w-4 text-purple-500" />}
                  </ButtonCustom>
                ) : (
                  <ButtonCustom 
                    variant="accent" 
                    className="rounded-full hidden sm:flex"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/style-advice");
                    }}
                  >
                    Get Started
                  </ButtonCustom>
                )}
              </div>

              <div className="block md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  className="inline-flex h-11 w-11 items-center justify-center rounded text-fashion-text transition hover:bg-fashion-light focus:outline-none focus-visible:ring-2 focus-visible:ring-fashion-accent focus-visible:ring-offset-2"
                >
                  {isMobileMenuOpen ? (
                    <X aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Menu aria-hidden="true" className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          {/* Backdrop: tap outside the panel to dismiss */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="fixed inset-0 top-16 z-40 h-full w-full cursor-default bg-fashion-dark/10"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav aria-label="Mobile" className="glass-effect animate-slide-down-fade relative z-50 max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-base font-medium text-fashion-text hover:bg-fashion-light"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
              </a>
            ))}
            {user && (
              <a
                href="/accounts"
                className="flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-fashion-text hover:bg-fashion-light"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/accounts");
                  setIsMobileMenuOpen(false);
                }}
              >
                <User className="h-4 w-4" />
                <span>Account</span>
                {isPremium && <Gem className="h-4 w-4 text-purple-500" />}
              </a>
            )}
            {isPremium && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-md">
                <Gem className="h-4 w-4 text-purple-500" />
                <span className="text-base font-medium text-fashion-text">Premium Account</span>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-fashion-dark/10">
              {user ? (
                <div className="flex items-center justify-center gap-2 w-full py-2">
                  {isPremium ? (
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                      <span>Premium Active</span>
                    </div>
                  ) : (
                    <ButtonCustom 
                      variant="accent" 
                      className="w-full rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/style-advice");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Upgrade to Premium
                    </ButtonCustom>
                  )}
                </div>
              ) : (
                <ButtonCustom 
                  variant="accent" 
                  className="w-full rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/style-advice");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </ButtonCustom>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
