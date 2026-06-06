import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import ReportsPage from "./pages/ReportsPage";
import ManagersPage from "./pages/ManagersPage";
import ExpensesPage from "./pages/ExpensesPage";
import PrinterSettingsPage from "./pages/PrinterSettingsPage";
import SettingsPage from "./pages/SettingsPage";
import TablesPage from "./pages/TablesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
          <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
          <Route path="/waiter" element={<ProtectedRoute><WaiterPage /></ProtectedRoute>} />
          <Route path="/delivery" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
          <Route path="/instore" element={<ProtectedRoute><InstorePage /></ProtectedRoute>} />
          <Route path="/outstore" element={<ProtectedRoute><OutstorePage /></ProtectedRoute>} />
          <Route path="/checklist" element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><ShiftsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/managers" element={<ProtectedRoute><ManagersPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/printers" element={<ProtectedRoute><PrinterSettingsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
