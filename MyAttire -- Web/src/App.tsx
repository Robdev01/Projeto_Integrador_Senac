import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardFuncionario from "./pages/DashboardFuncionario";
import UsuariosPage from "./pages/UsuariosPage";
import SetoresPage from "./pages/SetoresPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
            <Route path="/admin/setores" element={<SetoresPage />} />
            <Route path="/funcionario/dashboard" element={<DashboardFuncionario />} />
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
   
  </QueryClientProvider>
);

export default App;
