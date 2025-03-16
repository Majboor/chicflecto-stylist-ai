
import { ButtonCustom } from "./ui/button-custom"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function CTASection() {
  const { user } = useAuth();
  const targetPath = user ? "/style-advice" : "/auth";
  
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-fashion-accent/5 to-fashion-accent/10 mix-blend-multiply"></div>
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fashion-accent/10 blur-3xl"></div>
      
      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="fashion-heading text-3xl sm:text-4xl mb-4">Ready to Transform Your Style?</h2>
          <p className="fashion-subheading mx-auto max-w-xl">
            Create your personalized style profile and get AI-powered fashion recommendations today
          </p>
          
          <div className="mt-10">
            <Link to={targetPath}>
              <ButtonCustom size="xl" className="group rounded-full animate-pulse" variant="accent">
                <span>Get Started Now</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonCustom>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-fashion-text/60">
            No account required. Free to use for personal styling.
          </p>
        </div>
      </div>
    </section>
  )
}
