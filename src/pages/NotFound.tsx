
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center px-6">
          <p className="text-sm font-medium text-fashion-accent mb-3">404 Error</p>
          <h1 className="fashion-heading text-4xl md:text-5xl mb-4">Page Not Found</h1>
          <p className="fashion-subheading mb-8 max-w-md mx-auto">
            We couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>
          <Link to="/">
            <ButtonCustom variant="accent" className="rounded-full">
              Return to Home
            </ButtonCustom>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
