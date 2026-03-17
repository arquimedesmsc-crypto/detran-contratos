import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Instrumentos from "./pages/Instrumentos";
import InstrumentoDetalhes from "./pages/InstrumentoDetalhes";
import InstrumentoForm from "./pages/InstrumentoForm";
import Vpn from "./pages/Vpn";
import VpnDetalhes from "./pages/VpnDetalhes";

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
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
