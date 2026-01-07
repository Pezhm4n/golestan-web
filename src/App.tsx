import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourProvider, useTour } from "@/contexts/TourContext";
import GuidedTour from "@/components/GuidedTour";
import Index from "./pages/Index";
import Donate from "./pages/Donate";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const TourHost = () => {
  const { isTourOpen, endTour } = useTour();
  return <GuidedTour isOpen={isTourOpen} onClose={endTour} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TourProvider>
              <Routes>
                {/* Home page is publicly accessible; schedule grid and sidebar handle auth gating themselves */}
                <Route path="/" element={<Index />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/about" element={<About />} />
                {/* Auth page (login / signup) remains public */}
                <Route path="/auth" element={<AuthPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Guided tour lives at the app root so it persists across sheets/sidebars */}
              <TourHost />
            </TourProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
