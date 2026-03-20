import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  type LucideIcon,
  PiggyBank,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { CSSProperties, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

const SIDEBAR_STYLE = {
  "--sidebar-width": "17.5rem",
  "--sidebar-width-icon": "3.75rem",
  "--sidebar": "oklch(0.985 0.003 260)",
  "--sidebar-foreground": "oklch(0.32 0.01 260)",
  "--sidebar-primary": "oklch(0.18 0.01 260)",
  "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.95 0.004 260)",
  "--sidebar-accent-foreground": "oklch(0.18 0.01 260)",
  "--sidebar-border": "oklch(0.92 0.004 260)",
  "--sidebar-ring": "oklch(0.58 0.02 260)",
} as CSSProperties;

const sidebarSections: SidebarSection[] = [
  {
    label: "Dashboards",
    items: [
      { icon: LayoutDashboard, label: "Dashboard Empresa", path: "/" },
      { icon: User, label: "Dashboard Pessoal", path: "/pessoal" },
    ],
  },
  {
    label: "Empresa",
    items: [
      { icon: DollarSign, label: "Receitas", path: "/receitas" },
      { icon: Building2, label: "Custos Fixos", path: "/custos-fixos" },
      { icon: Receipt, label: "Custos Variáveis", path: "/custos-variaveis" },
      { icon: Users, label: "Funcionários", path: "/funcionarios" },
      { icon: Truck, label: "Fornecedores", path: "/fornecedores" },
      { icon: UserCheck, label: "Clientes", path: "/clientes" },
      { icon: Briefcase, label: "Serviços", path: "/servicos" },
    ],
  },
  {
    label: "Pessoal",
    items: [
      { icon: Wallet, label: "Contas Fixas", path: "/contas-fixas" },
      { icon: Receipt, label: "Contas Variáveis", path: "/contas-variaveis" },
      { icon: TrendingDown, label: "Dívidas", path: "/dividas" },
      { icon: TrendingUp, label: "Investimentos", path: "/investimentos" },
      { icon: PiggyBank, label: "Fundo de Reserva", path: "/fundo-reserva" },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { icon: FileText, label: "DRE", path: "/dre" },
      { icon: CalendarDays, label: "Calendário", path: "/calendario" },
      { icon: Settings, label: "Configurações", path: "/configuracoes" },
    ],
  },
];

const allSidebarItems = sidebarSections.flatMap(section => section.items);

function getInitialSidebarOpen() {
  if (typeof document === "undefined") return false;

  const cookie = document.cookie
    .split("; ")
    .find(entry => entry.startsWith("sidebar_state="));

  if (!cookie) return false;

  return cookie.split("=").slice(1).join("=") !== "false";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarDefaultOpen] = useState(getInitialSidebarOpen);
  const { loading, user } = useAuth();

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Sistema Financeiro
            </h1>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Controle completo das finanças da sua empresa e vida pessoal. Faça
              login para continuar.
            </p>
          </div>
          <Button
            onClick={() => {
              const loginUrl = getLoginUrl();
              if (!loginUrl) return;
              window.location.href = loginUrl;
            }}
            size="lg"
            className="w-full shadow-lg transition-all hover:shadow-xl"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen}
      style={SIDEBAR_STYLE}
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const activeMenuItem = useMemo(
    () => allSidebarItems.find(item => item.path === location),
    [location]
  );

  return (
    <>
      <DashboardSidebar
        location={location}
        onNavigate={setLocation}
        onLogout={logout}
        userName={user?.name ?? "Usuário"}
        userEmail={user?.email ?? ""}
      />

      <SidebarInset className="bg-[#f4f4f2]">
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <span className="text-sm font-medium tracking-tight text-foreground">
                {activeMenuItem?.label ?? "Menu"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6 lg:p-8 text-zinc-900">{children}</main>
      </SidebarInset>
    </>
  );
}

function DashboardSidebar({
  location,
  onNavigate,
  onLogout,
  userName,
  userEmail,
}: {
  location: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="border-0 bg-transparent"
    >
      <SidebarHeader className="px-3 pt-3 pb-2">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-[24px] border border-zinc-200 bg-white px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all",
            "group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:shadow-none"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white shadow-[0_10px_24px_rgba(249,115,22,0.28)]">
            <DollarSign className="size-4" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              FinancePro
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              Dashboard financeiro
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="size-8 rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        {sidebarSections.map(section => (
          <SidebarGroup key={section.label} className="px-0 py-2">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400 group-data-[collapsible=icon]:hidden">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map(item => {
                  const isActive = location === item.path;

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={() => {
                          onNavigate(item.path);
                          if (isMobile) {
                            toggleSidebar();
                          }
                        }}
                        className={cn(
                          "h-10 rounded-full px-3.5 text-sm font-medium text-zinc-500 transition-all",
                          "hover:bg-zinc-100 hover:text-zinc-900",
                          "data-[active=true]:bg-zinc-900 data-[active=true]:text-white data-[active=true]:shadow-[0_14px_32px_rgba(15,23,42,0.18)]",
                          "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-0"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-white" : "text-zinc-500"
                          )}
                        />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 pt-2">
        <div
          className={cn(
            "rounded-[24px] border border-zinc-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.06)]",
            "group-data-[collapsible=icon]:px-2"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2"
            )}
          >
            <Avatar className="size-9 border border-zinc-200 group-data-[collapsible=icon]:hidden">
              <AvatarFallback className="bg-zinc-100 text-xs font-semibold text-zinc-700">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-zinc-900">
                {userName}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {userEmail || " "}
              </p>
            </div>

            <div
              className={cn(
                "flex items-center gap-1",
                "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2"
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onNavigate("/configuracoes");
                  if (isMobile) {
                    toggleSidebar();
                  }
                }}
                className="size-8 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Abrir configurações"
                title="Configurações"
              >
                <Settings className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onLogout();
                  if (isMobile) {
                    toggleSidebar();
                  }
                }}
                className="size-8 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Sair da conta"
                title="Sair"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail className="after:bg-zinc-200 hover:after:bg-zinc-400" />
    </Sidebar>
  );
}
