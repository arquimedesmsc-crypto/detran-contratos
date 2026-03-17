import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Wifi, WifiOff, Ban, Search, Server, Activity, Filter, X, Globe, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { formatBytes } from "@/lib/utils-instrumentos";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_MAP: Record<string, { label: string; icon: typeof Wifi; color: string; bgColor: string; dotColor: string }> = {
  conectado: { label: "Conectado", icon: Wifi, color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  desconectado: { label: "Desconectado", icon: WifiOff, color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200", dotColor: "bg-gray-400" },
  bloqueado: { label: "Bloqueado", icon: Ban, color: "text-red-700", bgColor: "bg-red-50 border-red-200", dotColor: "bg-red-500" },
};

const VPN_COLORS = ["oklch(0.50 0.14 150)", "oklch(0.65 0.02 250)", "oklch(0.55 0.22 25)"];

export default function Vpn() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [, setLocation] = useLocation();
  const { data: conexoes, isLoading } = trpc.vpn.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: stats } = trpc.vpn.stats.useQuery();

  const statusData = [
    { name: "Conectados", value: stats?.conectadas ?? 0 },
    { name: "Desconectados", value: stats?.desconectadas ?? 0 },
  ].filter((d) => d.value > 0);

  const hasActiveFilters = statusFilter !== "all" || search;

  function formatLastConn(ts: number | null) {
    if (!ts) return "Nunca";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return `${Math.floor(diff / 86400000)}d atrás`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">VPN</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[42px]">
          Monitoramento de conexões VPN (dados de demonstração)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Usuários</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5">{stats?.total ?? 0}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Server className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Conectados</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-0.5">{stats?.conectadas ?? 0}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Desconectados</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-600 mt-0.5">{stats?.desconectadas ?? 0}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <WifiOff className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Bloqueados</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-0.5">0</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <Ban className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Directory breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Status das Conexões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={VPN_COLORS[index % VPN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Conexões por Diretoria (Mockup)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ diretoria: "Identificação Civil", count: 6 }, { diretoria: "Habilitacão", count: 3 }, { diretoria: "Registro de Veículos", count: 2 }, { diretoria: "Administração", count: 1 }].map((d) => {
                const pct = ((d.count / 12) * 100);
                return (
                  <div key={d.diretoria} className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm text-muted-foreground w-32 sm:w-48 truncate shrink-0">
                      {d.diretoria}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold tabular-nums w-8 text-right shrink-0">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou matrícula..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="conectado">Conectado</SelectItem>
                      <SelectItem value="desconectado">Desconectado</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
                    <X className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Filtros:</span>
            {search && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Busca: "{search}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                {STATUS_MAP[statusFilter]?.label ?? statusFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="whitespace-nowrap">Usuário</TableHead>
                  <TableHead className="whitespace-nowrap">Matrícula</TableHead>
                  <TableHead className="whitespace-nowrap">Diretoria</TableHead>
                  <TableHead className="whitespace-nowrap">Servidor</TableHead>
                  <TableHead className="whitespace-nowrap">IP</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Última Conexão</TableHead>
                  <TableHead className="whitespace-nowrap">Tráfego</TableHead>
                  <TableHead className="whitespace-nowrap w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (conexoes ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Shield className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground">Nenhuma conexão encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (conexoes ?? []).map((c) => {
                    const st = STATUS_MAP[c.status] ?? STATUS_MAP.desconectado;
                    return (
                      <TableRow key={c.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-sm">{c.nomeUsuario}</TableCell>
                        <TableCell className="text-sm text-muted-foreground tabular-nums">{c.matricula || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(c.diretoria || "").replace("Diretoria de ", "")}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.servidor}</TableCell>
                        <TableCell className="text-xs font-mono tabular-nums">{c.ipAtribuido || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium ${st.bgColor} ${st.color} border whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor} mr-1.5 shrink-0`} />
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatLastConn(c.ultimaConexao)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {c.bytesEnviados || c.bytesRecebidos
                            ? `↑${formatBytes(c.bytesEnviados ?? 0)} ↓${formatBytes(c.bytesRecebidos ?? 0)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setLocation(`/vpn/${c.id}`)}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (conexoes ?? []).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma conexão encontrada</p>
            </CardContent>
          </Card>
        ) : (
          (conexoes ?? []).map((c) => {
            const st = STATUS_MAP[c.status] ?? STATUS_MAP.desconectado;
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3" onClick={() => setLocation(`/vpn/${c.id}`)} style={{cursor:'pointer'}}>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{c.nomeUsuario}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.matricula || "Sem matrícula"} · {(c.diretoria || "").replace("Diretoria de ", "")}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${st.bgColor} ${st.color} border`}>
                      <span className={`w-1 h-1 rounded-full ${st.dotColor} mr-1`} />
                      {st.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Servidor:</span>
                      <span className="ml-1 font-mono">{c.servidor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP:</span>
                      <span className="ml-1 font-mono tabular-nums">{c.ipAtribuido || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Última:</span>
                      <span className="ml-1">{formatLastConn(c.ultimaConexao)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tráfego:</span>
                      <span className="ml-1 tabular-nums">
                        {c.bytesEnviados || c.bytesRecebidos
                          ? `↑${formatBytes(c.bytesEnviados ?? 0)} ↓${formatBytes(c.bytesRecebidos ?? 0)}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
