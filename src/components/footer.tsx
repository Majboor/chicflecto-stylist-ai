import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-fashion-light/30 py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h2 className="fashion-heading text-xl font-semibold tracking-tight">Chic<span className="text-fashion-accent">Flecto</span></h2>
            <p className="mt-4 text-sm text-fashion-text/70">
              Elevating your personal style with AI-powered fashion recommendations.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Features</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/profile" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Style Profile</Link></li>
              <li><Link to="/style-advice" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Outfit Recommendations</Link></li>
              <li><Link to="/style-advice" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Color Analysis</Link></li>
              <li><Link to="/outfits" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Wardrobe Organization</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/inspirations" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Inspirations</Link></li>
              <li><Link to="/style-advice#pricing" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Pricing</Link></li>
              <li><Link to="/accounts" className="text-sm text-fashion-text/70 hover:text-fashion-accent">My Account</Link></li>
              <li><Link to="/auth" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer noopener" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Instagram</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noreferrer noopener" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Pinterest</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer noopener" className="text-sm text-fashion-text/70 hover:text-fashion-accent">Twitter</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-fashion-dark/10 pt-6">
          <p className="text-center text-xs text-fashion-text/60">
            © {new Date().getFullYear()} ChicFlecto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
