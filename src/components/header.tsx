import { useState, useEffect } from "react"
import { ButtonCustom } from "./ui/button-custom"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"

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
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex sm:gap-4">
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
            <div className="mt-4 pt-4 border-t border-fashion-dark/10">
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
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
