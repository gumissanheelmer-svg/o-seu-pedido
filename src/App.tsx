import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";

// Public Order Page
import PublicOrderPage from "./pages/public/PublicOrderPage";

// Admin Pages
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/registar" element={<Register />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/precos" element={<Pricing />} />
          <Route path="/demo" element={<Demo />} />
          
          {/* Public Order Page */}
          <Route path="/p/:slug" element={<PublicOrderPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="encomendas" element={<Orders />} />
            <Route path="produtos" element={<Products />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
