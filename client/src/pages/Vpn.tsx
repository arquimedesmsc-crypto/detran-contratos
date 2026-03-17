import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Shield, Wifi, WifiOff, Ban, Search, Server, Activity } from "lucide-react";
import { useState } from "react";
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

const VPN_COLORS = ["oklch(0.60 0.18 145)", "oklch(0.65 0.02 250)", "oklch(0.55 0.22 25)"];

export default function Vpn() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: conexoes, isLoading } = trpc.vpn.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: stats } = trpc.vpn.stats.useQuery();

  const statusData = [
    { name: "Conectados", value: stats?.conectados ?? 0 },
    { name: "Desconectados", value: stats?.desconectados ?? 0 },
    { name: "Bloqueados", value: stats?.bloqueados ?? 0 },
  ].filter((d) => d.value > 0);

  function formatLastConn(ts: number | null) {
    if (!ts) return "Nunca";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return `${Math.floor(diff / 86400000)}d atrás`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          VPN
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitoramento de conexões VPN (dados de demonstração)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuários</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conectados</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats?.conectados ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Wifi className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desconectados</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">{stats?.desconectados ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bloqueados</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{stats?.bloqueados ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status das Conexões</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={VPN_COLORS[index % VPN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Conexões por Diretoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.porDiretoria ?? []).map((d) => (
                <div key={d.diretoria} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-48 truncate">{d.diretoria.replace("Diretoria de ", "")}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary rounded-full h-2.5 transition-all"
                      style={{ width: `${(d.count / (stats?.total ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="conectado">Conectado</SelectItem>
                <SelectItem value="desconectado">Desconectado</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Diretoria</TableHead>
                  <TableHead>Servidor</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Tráfego</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (conexoes ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhuma conexão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  (conexoes ?? []).map((c) => {
                    const st = STATUS_MAP[c.status] ?? STATUS_MAP.desconectado;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.nomeUsuario}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.matricula || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(c.diretoria || "").replace("Diretoria de ", "")}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.servidor}</TableCell>
                        <TableCell className="text-xs font-mono">{c.ipAtribuido || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${st.bgColor} ${st.color} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor} mr-1.5`} />
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatLastConn(c.ultimaConexao)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.bytesEnviados || c.bytesRecebidos
                            ? `↑${formatBytes(c.bytesEnviados ?? 0)} ↓${formatBytes(c.bytesRecebidos ?? 0)}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
