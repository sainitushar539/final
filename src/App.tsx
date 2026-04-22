import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import AgentLoginPage from "./pages/AgentLoginPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import GetStartedPage from "./pages/GetStartedPage.tsx";
import GoalAdvicePage from "./pages/GoalAdvicePage.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import DashboardLayout from "./pages/DashboardLayout.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/agent-login" element={<AgentLoginPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/advice" element={<GoalAdvicePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute redirectTo="/auth" requiredRole="admin" roleRedirectTo="/client-dashboard">
                <DashboardLayout />
              </ProtectedRoute>
            } />
            <Route path="/client-dashboard" element={
              <ProtectedRoute redirectTo="/auth" requiredRole="client" roleRedirectTo="/agent-dashboard">
                <DashboardLayout />
              </ProtectedRoute>
            } />
            <Route path="/agent-dashboard" element={
              <ProtectedRoute redirectTo="/agent-login" requiredRole="admin" roleRedirectTo="/client-dashboard">
                <DashboardLayout />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
