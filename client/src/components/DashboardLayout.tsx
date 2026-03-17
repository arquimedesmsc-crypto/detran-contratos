import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  FileText,
  Shield,
  Smartphone,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const LOGO_D_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-d_72599473.jpg";
const LOGO_FULL_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-full_ee24eb7a.jpg";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Instrumentos", path: "/instrumentos" },
  { icon: Shield, label: "VPN", path: "/vpn" },
  { icon: Smartphone, label: "Download", path: "/download" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #1A73C4 40%, #1B8A5A 100%)' }}>
        <div className="flex flex-col items-center gap-8 p-10 max-w-md w-full bg-white rounded-2xl shadow-2xl mx-4">
          <div className="flex flex-col items-center gap-5">
            <img
              src={LOGO_FULL_URL}
              alt="DETRAN.RJ"
              className="h-12 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-center" style={{ color: '#1A73C4' }}>
              Sistema de Contratos DTIC
            </h1>
            <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed">
              Departamento de Tecnologia da Informação e Comunicação
            </p>
            <div className="w-full border-t border-gray-100 my-1" />
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#1B8A5A' }}>
                Gerenciamento de Instrumentos Jurídicos
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Acesso restrito aos servidores do DETRAN-RJ
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all text-white font-semibold text-base py-6"
            style={{ background: 'linear-gradient(135deg, #1B8A5A 0%, #2E9D6A 100%)' }}
          >
            Entrar no Sistema
          </Button>
          <div className="text-center">
            <p className="text-xs text-gray-400">
              DETRAN-RJ — Departamento de Trânsito do Estado do Rio de Janeiro
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(
    (item) =>
      item.path === location ||
      (item.path !== "/" && location.startsWith(item.path))
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          {/* Header com logo */}
          <SidebarHeader className="h-16 justify-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 overflow-hidden"
                aria-label="Toggle navigation"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                {isCollapsed ? (
                  <PanelLeft className="h-4 w-4 text-sidebar-foreground/70" />
                ) : (
                  <img
                    src={LOGO_D_URL}
                    alt="DETRAN"
                    className="h-7 w-7 object-contain rounded"
                    style={{ mixBlendMode: 'screen' }}
                  />
                )}
              </button>
              {!isCollapsed ? (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight truncate text-white text-sm">
                    DETRAN-RJ
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/50 truncate">
                    Gestão de Contratos
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* Menu items */}
          <SidebarContent className="gap-0 mt-2">
            <SidebarMenu className="px-2 py-1 space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  item.path === location ||
                  (item.path !== "/" && location.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 transition-all font-normal rounded-lg ${
                        isActive
                          ? "font-semibold"
                          : ""
                      }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(26,115,196,0.3) 0%, rgba(27,138,90,0.3) 100%)',
                        borderLeft: '3px solid #1B8A5A',
                      } : {}}
                    >
                      <item.icon
                        className={`h-[18px] w-[18px] ${isActive ? "text-white" : "text-sidebar-foreground/60"}`}
                      />
                      <span className={isActive ? "text-white" : ""}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer com perfil */}
          <SidebarFooter className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Avatar className="h-9 w-9 shrink-0" style={{ border: '2px solid rgba(27,138,90,0.5)' }}>
                    <AvatarFallback className="text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #1A73C4, #1B8A5A)' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex h-14 items-center justify-between px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40" style={{ background: 'linear-gradient(90deg, #1B4F72, #1A73C4)', borderBottom: '3px solid #1B8A5A' }}>
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-white" />
              <img src={LOGO_D_URL} alt="DETRAN" className="h-7 w-7 object-contain rounded" style={{ mixBlendMode: 'screen' }} />
              <span className="tracking-tight text-white font-semibold text-sm">
                {activeMenuItem?.label ?? "Menu"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
