import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Diagnose from "./pages/Diagnose";
import Marketplace from "./pages/Marketplace";
import ChatRoom from "./pages/ChatRoom";
import ChatPage from "./pages/ChatPage";
import Weather from "./pages/Weather";
import Premium from "./pages/Premium";
import Vets from "./pages/Vets";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/chat-room/:roomId" element={<ChatRoom />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/vets" element={<Vets />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
