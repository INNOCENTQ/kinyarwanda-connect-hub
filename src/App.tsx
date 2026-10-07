import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Diagnose = lazy(() => import("./pages/Diagnose"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ChatRoom = lazy(() => import("./pages/ChatRoom"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const Weather = lazy(() => import("./pages/Weather"));
const Premium = lazy(() => import("./pages/Premium"));
const Vets = lazy(() => import("./pages/Vets"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

const Fallback = () => <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Fallback />}>
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
