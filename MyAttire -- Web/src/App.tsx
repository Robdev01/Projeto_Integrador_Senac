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
import PrivateRoute from "./pages/PrivateRoute";  // Importando o PrivateRoute
import RegisterPage from "./pages/RegisterPage"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Página inicial redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Página de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Páginas protegidas com PrivateRoute */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <DashboardAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <PrivateRoute>
                <UsuariosPage />
              </PrivateRoute>
            }
          />

        <Route
            path="/register-user"
            element={
              <PrivateRoute>
                <RegisterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/setores"
            element={
              <PrivateRoute>
                <SetoresPage />
              </PrivateRoute>
            }
          />

          {/* Páginas do funcionário protegidas com PrivateRoute */}
          <Route
            path="/funcionario/dashboard"
            element={
              <PrivateRoute>
                <DashboardFuncionario />
              </PrivateRoute>
            }
          />

          {/* Página para qualquer URL que não corresponda */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
