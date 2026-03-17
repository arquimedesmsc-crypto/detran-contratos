import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Instrumentos from "./pages/Instrumentos";
import InstrumentoDetalhes from "./pages/InstrumentoDetalhes";
import InstrumentoForm from "./pages/InstrumentoForm";
import Vpn from "./pages/Vpn";
import VpnDetalhes from "./pages/VpnDetalhes";
import Download from "./pages/Download";
import { useState, useCallback } from "react";

// Chave de sessão: mostra splash apenas uma vez por sessão de navegador
const SPLASH_SESSION_KEY = "detran_splash_shown";

function useSplash() {
  const alreadyShown = sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
  const [showSplash, setShowSplash] = useState(!alreadyShown);

  const handleFinish = useCallback(() => {
    sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    setShowSplash(false);
  }, []);

  return { showSplash, handleFinish };
}

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/instrumentos" component={Instrumentos} />
        <Route path="/instrumentos/novo" component={InstrumentoForm} />
        <Route path="/instrumentos/:id/editar" component={InstrumentoForm} />
        <Route path="/instrumentos/:id" component={InstrumentoDetalhes} />
        <Route path="/vpn" component={Vpn} />
        <Route path="/vpn/:id" component={VpnDetalhes} />
        <Route path="/download" component={Download} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  const { showSplash, handleFinish } = useSplash();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {showSplash && (
            <SplashScreen onFinish={handleFinish} minDuration={2400} />
          )}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
