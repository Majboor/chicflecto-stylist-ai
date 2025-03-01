
import { useState, useEffect } from "react"
import { ButtonCustom } from "./ui/button-custom"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Style Profile", href: "/profile" },
  { name: "Outfits", href: "/outfits" },
  { name: "Inspirations", href: "/inspirations" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
                    <Link
                      to={item.href}
                      className="text-sm font-medium text-fashion-text/80 transition hover:text-fashion-text"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex sm:gap-4">
                <ButtonCustom variant="accent" className="rounded-full">
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
              <Link
                key={item.name}
                to={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-fashion-text hover:bg-fashion-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-fashion-dark/10">
              <ButtonCustom variant="accent" className="w-full rounded-full">
                Get Started
              </ButtonCustom>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
