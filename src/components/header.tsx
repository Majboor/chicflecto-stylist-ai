
import { useState, useEffect } from "react"
import { ButtonCustom } from "./ui/button-custom"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, Gem } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Style Profile", href: "/profile" },
  { name: "Outfits", href: "/outfits" },
  { name: "Inspirations", href: "/inspirations" },
  { name: "Pricing", href: "/style-advice#pricing" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, subscriptionStatus } = useAuth()
  
  const isPremium = subscriptionStatus === "active"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            <Link to="/" className="block">
              <span className="sr-only">Home</span>
              <h1 className="fashion-heading text-xl font-semibold tracking-tight">STYLIST<span className="text-fashion-accent">AI</span></h1>
            </Link>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav className="hidden md:block" aria-label="Global">
              <ul className="flex items-center gap-8">
                {NAV_ITEMS.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="text-sm font-medium text-fashion-text/80 transition hover:text-fashion-text"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
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
              <div className="hidden sm:flex sm:gap-4">
                {isPremium ? (
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-fashion-text/80">Premium Active</span>
                    <Gem className="h-4 w-4 text-purple-500" />
                  </div>
                ) : (
                  <ButtonCustom 
                    variant="accent" 
                    className="rounded-full"
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
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded p-2 text-fashion-text transition hover:bg-fashion-light"
                >
                  <span className="sr-only">Toggle menu</span>
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="glass-effect animate-slide-down-fade space-y-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-fashion-text hover:bg-fashion-light"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
              </a>
            ))}
            {isPremium && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-md">
                <Gem className="h-4 w-4 text-purple-500" />
                <span className="text-base font-medium text-fashion-text">Premium Account</span>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-fashion-dark/10">
              {isPremium ? (
                <div className="flex items-center justify-center gap-2 w-full py-2">
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                    <span>Premium Active</span>
                  </div>
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
          </div>
        </div>
      )}
    </header>
  )
}
