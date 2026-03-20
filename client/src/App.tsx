import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import DashboardEmpresa from "./pages/DashboardEmpresa";
import DashboardPessoal from "./pages/DashboardPessoal";
import Receitas from "./pages/Receitas";
import CustosFixos from "./pages/CustosFixos";
import CustosVariaveis from "./pages/CustosVariaveis";
import Funcionarios from "./pages/Funcionarios";
import Fornecedores from "./pages/Fornecedores";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import ContasFixas from "./pages/ContasFixas";
import ContasVariaveis from "./pages/ContasVariaveis";
import Dividas from "./pages/Dividas";
import Investimentos from "./pages/Investimentos";
import FundoReserva from "./pages/FundoReserva";
import DRE from "./pages/DRE";
import Calendario from "./pages/Calendario";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardEmpresa} />
        <Route path="/pessoal" component={DashboardPessoal} />
        <Route path="/receitas" component={Receitas} />
        <Route path="/custos-fixos" component={CustosFixos} />
        <Route path="/custos-variaveis" component={CustosVariaveis} />
        <Route path="/funcionarios" component={Funcionarios} />
        <Route path="/fornecedores" component={Fornecedores} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/contas-fixas" component={ContasFixas} />
        <Route path="/contas-variaveis" component={ContasVariaveis} />
        <Route path="/dividas" component={Dividas} />
        <Route path="/investimentos" component={Investimentos} />
        <Route path="/fundo-reserva" component={FundoReserva} />
        <Route path="/dre" component={DRE} />
        <Route path="/calendario" component={Calendario} />
        <Route path="/configuracoes" component={Configuracoes} />
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
