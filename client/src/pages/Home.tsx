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
  BarChart3,
  PieChartIcon,
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

/* Cores oficiais do manual de marca do Estado do RJ */
const PIE_COLORS = [
  "#005A92", /* Azul oficial */
  "#427842", /* Verde oficial */
  "#BC9D32", /* Dourado oficial */
  "#7B5EA7", /* Roxo complementar */
  "#A0A0A0", /* Cinza oficial */
  "#2D7D9A", /* Azul turquesa */
  "#8B6914", /* Dourado escuro */
];

const STATUS_COLORS = {
  vigentes: "#427842",       /* Verde oficial */
  proximoVencimento: "#BC9D32", /* Dourado oficial */
  vencidos: "#C53030",       /* Vermelho */
  semData: "#A0A0A0",        /* Cinza oficial */
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = trpc.instrumentos.stats.useQuery();
  const { data: alertas, isLoading: alertasLoading } = trpc.instrumentos.alertas.useQuery({ dias: 180 });
  const [, setLocation] = useLocation();

  if (statsLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral dos instrumentos jurídicos</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-5"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calcular stats a partir dos alertas e total
  const vigentes = (stats?.total ?? 0) - (alertas?.filter(a => a.dataTermino && a.dataTermino < Date.now()).length ?? 0) - (alertas?.filter(a => a.dataTermino && a.dataTermino < Date.now() + 180 * 24 * 60 * 60 * 1000 && a.dataTermino >= Date.now()).length ?? 0);
  const proximoVencimento = alertas?.filter(a => a.dataTermino && a.dataTermino < Date.now() + 180 * 24 * 60 * 60 * 1000 && a.dataTermino >= Date.now()).length ?? 0;
  const vencidos = alertas?.filter(a => a.dataTermino && a.dataTermino < Date.now()).length ?? 0;
  const semData = (stats?.total ?? 0) - (stats?.porDiretoria?.reduce((sum, d) => sum + d.count, 0) ?? 0);

  const statusData = [
    { name: "Vigentes", value: vigentes, color: STATUS_COLORS.vigentes },
    { name: "Próx. Vencimento", value: proximoVencimento, color: STATUS_COLORS.proximoVencimento },
    { name: "Vencidos", value: vencidos, color: STATUS_COLORS.vencidos },
    { name: "Sem Data", value: semData, color: STATUS_COLORS.semData },
  ].filter((d) => d.value > 0);

  const prazoMedioAnos = "4.0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral dos instrumentos jurídicos do DETRAN-RJ
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-[#005A92]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5">{stats?.total ?? 0}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#005A92]/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#005A92]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#427842]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Vigentes</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#427842] mt-0.5">{vigentes}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#427842]/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#427842]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#BC9D32]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Próx. Venc.</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#BC9D32] mt-0.5">{proximoVencimento}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#BC9D32]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-[#BC9D32]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Vencidos</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-0.5">{vencidos}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extra KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[#005A92]/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#005A92]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Prazo Médio de Vigência</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{prazoMedioAnos} anos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[#A0A0A0]/10 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#A0A0A0]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Sem Data Definida</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{semData} instrumentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Distribuição por Diretoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Por Diretoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={(stats?.porDiretoria ?? []).map((d) => ({
                  name: d.diretoria.replace("Diretoria de ", "").replace("Diretoria ", ""),
                  total: d.count,
                }))}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Bar dataKey="total" fill="#005A92" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Vigência */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              Status de Vigência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
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
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              Por Tipo de Instrumento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={(stats?.porTipo ?? []).map((d) => ({
                    name: d.tipo,
                    value: d.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={2}
                  label={({ value }) => `${value}`}
                >
                  {(stats?.porTipo ?? []).map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
                <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Ano */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Por Ano de Início
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats?.porAno ?? []}
                margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Bar dataKey="count" name="Instrumentos" fill="#427842" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {!alertasLoading && alertas && alertas.length > 0 && (
        <Card className="border-[#BC9D32]/30 bg-[#BC9D32]/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#8B6914]">
              <AlertTriangle className="h-4 w-4" />
              Instrumentos Próximos do Vencimento ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {alertas.slice(0, 5).map((item) => {
                const status = getStatusInstrumento(item.dataTermino);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-all active:scale-[0.99]"
                    onClick={() => setLocation(`/instrumentos/${item.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{item.tipo} {item.numero}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.bgColor} ${status.color} border`}>
                          <span className={`w-1 h-1 rounded-full ${status.dotColor} mr-1`} />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.partesEnvolvidas}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencimento</p>
                      <p className="text-sm font-semibold text-[#BC9D32] tabular-nums">{formatDate(item.dataTermino)}</p>
                    </div>
                  </div>
                );
              })}
              {alertas.length > 5 && (
                <button
                  onClick={() => setLocation("/alertas")}
                  className="text-sm text-primary hover:underline font-medium mt-1"
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
