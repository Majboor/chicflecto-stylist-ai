import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/scroll-to-top";
import { SkipLink } from "./components/skip-link";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Route-level code splitting keeps the initial bundle lean; each page
// is fetched only when the visitor actually navigates to it.
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Outfits = lazy(() => import("./pages/Outfits"));
const Inspirations = lazy(() => import("./pages/Inspirations"));
const StyleAdvice = lazy(() => import("./pages/StyleAdvice"));
const StyleHistory = lazy(() => import("./pages/StyleHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const Accounts = lazy(() => import("./pages/Accounts"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));

function PageLoader() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-4 py-32" role="status" aria-label="Loading">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-fashion-accent/20 border-t-fashion-accent" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-fashion-gold/20 border-b-fashion-gold [animation-direction:reverse] [animation-duration:1.4s]" />
      </div>
      <span className="fashion-heading text-sm tracking-wide text-fashion-text/60">
        Chic<span className="text-fashion-accent">Flecto</span>
      </span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <SkipLink />
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          {/*
            Each routed page renders its own <main> landmark, so this wrapper is
            a plain container (not a second, nested <main>). It carries the
            skip-link target and is focusable so keyboard users land here.
          */}
          <div
            id="main-content"
            tabIndex={-1}
            className="flex-grow w-full flex flex-col outline-none"
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/color-palette" element={<ColorPalette />} />
                <Route path="/style-advice" element={
                  <ProtectedRoute>
                    <StyleAdvice />
                  </ProtectedRoute>
                } />
                <Route path="/style-history" element={
                  <ProtectedRoute>
                    <StyleHistory />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/outfits" element={
                  <ProtectedRoute>
                    <Outfits />
                  </ProtectedRoute>
                } />
                <Route path="/inspirations" element={
                  <ProtectedRoute>
                    <Inspirations />
                  </ProtectedRoute>
                } />
                <Route path="/accounts" element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                } />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
