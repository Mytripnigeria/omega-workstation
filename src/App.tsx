import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POSPage from "./pages/POSPage";
import KitchenPage from "./pages/KitchenPage";
import WaiterPage from "./pages/WaiterPage";
import DeliveryPage from "./pages/DeliveryPage";
import LobbyPage from "./pages/LobbyPage";
import InstorePage from "./pages/InstorePage";
import OutstorePage from "./pages/OutstorePage";
import ChecklistPage from "./pages/ChecklistPage";
import ShiftsPage from "./pages/ShiftsPage";
import ProfilePage from "./pages/ProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/waiter" element={<WaiterPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/instore" element={<InstorePage />} />
          <Route path="/outstore" element={<OutstorePage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tables" element={<PlaceholderPage />} />
          <Route path="/reports" element={<PlaceholderPage />} />
          <Route path="/settings" element={<PlaceholderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
