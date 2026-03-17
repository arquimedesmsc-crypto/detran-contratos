import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";
import { useLocation } from "wouter";

const PIE_COLORS = [
  "oklch(0.55 0.15 250)",
  "oklch(0.65 0.18 160)",
  "oklch(0.72 0.16 80)",
  "oklch(0.58 0.20 310)",
  "oklch(0.60 0.15 30)",
  "oklch(0.50 0.12 200)",
  "oklch(0.68 0.14 120)",
];

const STATUS_COLORS = {
  vigentes: "oklch(0.60 0.18 145)",
  proximoVencimento: "oklch(0.75 0.16 80)",
  vencidos: "oklch(0.55 0.22 25)",
  semData: "oklch(0.65 0.02 250)",
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = trpc.instrumentos.stats.useQuery();
  const { data: alertas, isLoading: alertasLoading } = trpc.instrumentos.alertas.useQuery({ dias: 180 });
  const [, setLocation] = useLocation();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral dos instrumentos jurídicos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Vigentes", value: stats?.vigentes ?? 0, color: STATUS_COLORS.vigentes },
    { name: "Próx. Vencimento", value: stats?.proximoVencimento ?? 0, color: STATUS_COLORS.proximoVencimento },
    { name: "Vencidos", value: stats?.vencidos ?? 0, color: STATUS_COLORS.vencidos },
    { name: "Sem Data", value: stats?.semData ?? 0, color: STATUS_COLORS.semData },
  ].filter((d) => d.value > 0);

  const prazoMedioAnos = stats?.prazoMedioDias ? (stats.prazoMedioDias / 365).toFixed(1) : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral dos instrumentos jurídicos do DETRAN-RJ
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Instrumentos</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vigentes</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats?.vigentes ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próx. Vencimento</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{stats?.proximoVencimento ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{stats?.vencidos ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extra KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prazo Médio de Vigência</p>
                <p className="text-xl font-bold text-foreground">{prazoMedioAnos} anos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sem Data Definida</p>
                <p className="text-xl font-bold text-foreground">{stats?.semData ?? 0} instrumentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Diretoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Diretoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(stats?.porDiretoria ?? []).map((d) => ({
                  name: d.diretoria.replace("Diretoria de ", "").replace("Diretoria ", ""),
                  total: d.count,
                }))}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.01 250)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.90 0.01 250)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="total" fill="oklch(0.45 0.12 250)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Vigência */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status de Vigência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Tipo de Instrumento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(stats?.porTipo ?? []).map((d) => ({
                    name: d.tipo,
                    value: d.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  {(stats?.porTipo ?? []).map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Ano */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Por Ano de Início</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.porAno ?? []}
                margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.01 250)" />
                <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.90 0.01 250)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="count" name="Instrumentos" fill="oklch(0.65 0.18 160)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {!alertasLoading && alertas && alertas.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Instrumentos Próximos do Vencimento ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.slice(0, 5).map((item) => {
                const status = getStatusInstrumento(item.dataTermino);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => setLocation(`/instrumentos/${item.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{item.tipo} {item.numero}</span>
                        <Badge variant="outline" className={`text-xs ${status.bgColor} ${status.color} border`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.partesEnvolvidas}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs text-muted-foreground">Vencimento</p>
                      <p className="text-sm font-medium text-amber-700">{formatDate(item.dataTermino)}</p>
                    </div>
                  </div>
                );
              })}
              {alertas.length > 5 && (
                <button
                  onClick={() => setLocation("/alertas")}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ver todos os {alertas.length} alertas →
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
