
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Outfits from "./pages/Outfits";
import Inspirations from "./pages/Inspirations";
import StyleAdvice from "./pages/StyleAdvice";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/PaymentCallback";
import Accounts from "./pages/Accounts";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/style-advice" element={<StyleAdvice />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/outfits" element={<Outfits />} />
            <Route path="/inspirations" element={<Inspirations />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
