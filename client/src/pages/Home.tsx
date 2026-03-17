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
  TrendingUp,
  ArrowRight,
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

/* Paleta DETRAN-RJ */
const DETRAN_BLUE = "#1A73C4";
const DETRAN_GREEN = "#1B8A5A";
const DETRAN_BLUE_DARK = "#1B4F72";
const DETRAN_TEAL = "#17A2B8";
const DETRAN_GOLD = "#D4A017";

const PIE_COLORS = [
  DETRAN_BLUE,
  DETRAN_GREEN,
  DETRAN_TEAL,
  DETRAN_GOLD,
  "#7B5EA7",
  "#E67E22",
  "#34495E",
];

const STATUS_COLORS = {
  vigentes: DETRAN_GREEN,
  proximoVencimento: DETRAN_GOLD,
  vencidos: "#DC2626",
  semData: "#94A3B8",
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = trpc.instrumentos.stats.useQuery();
  const { data: alertas, isLoading: alertasLoading } = trpc.instrumentos.alertas.useQuery({ dias: 180 });
  const [, setLocation] = useLocation();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-xl p-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #1B4F72, #1A73C4, #1B8A5A)', minHeight: 100 }}>
          <div className="h-6 w-48 bg-white/20 rounded mb-2" />
          <div className="h-4 w-72 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5"><div className="h-20 bg-muted rounded-lg" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header com degradê DETRAN */}
      <div
        className="rounded-xl p-5 sm:p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #1A73C4 50%, #1B8A5A 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="h-6 w-6 text-white/80" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-sm text-white/70 ml-9">
            Visão geral dos instrumentos jurídicos do DETRAN-RJ
          </p>
        </div>
      </div>

      {/* KPI Cards com degradê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="rounded-xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A73C4 0%, #2196F3 100%)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white/80 truncate">Total</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats?.total ?? 0}</p>
              <p className="text-[10px] text-white/60 mt-1">instrumentos</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Vigentes */}
        <div className="rounded-xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B8A5A 0%, #4CAF50 100%)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white/80 truncate">Vigentes</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{vigentes}</p>
              <p className="text-[10px] text-white/60 mt-1">ativos</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Próximo Vencimento */}
        <div className="rounded-xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4A017 0%, #F59E0B 100%)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white/80 truncate">Próx. Venc.</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{proximoVencimento}</p>
              <p className="text-[10px] text-white/60 mt-1">atenção</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Vencidos */}
        <div className="rounded-xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white/80 truncate">Vencidos</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{vencidos}</p>
              <p className="text-[10px] text-white/60 mt-1">expirados</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Extra KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1A73C4 0%, #2196F3 100%)' }}>
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Prazo Médio de Vigência</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{prazoMedioAnos} anos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)' }}>
                <Calendar className="h-5 w-5 text-white" />
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
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A73C4, #1B8A5A)' }}>
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
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
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    background: 'white',
                  }}
                />
                <Bar dataKey="total" fill={DETRAN_BLUE} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Vigência */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B8A5A, #4CAF50)' }}>
                <PieChartIcon className="h-3.5 w-3.5 text-white" />
              </div>
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
                  strokeWidth={0}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #17A2B8, #20C997)' }}>
                <PieChartIcon className="h-3.5 w-3.5 text-white" />
              </div>
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
                  strokeWidth={0}
                  label={({ value }) => `${value}`}
                >
                  {(stats?.porTipo ?? []).map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Ano */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A017, #F59E0B)' }}>
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
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
                <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" name="Instrumentos" fill={DETRAN_GREEN} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {!alertasLoading && alertas && alertas.length > 0 && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.08) 0%, rgba(245,158,11,0.08) 100%)', borderBottom: '1px solid rgba(212,160,23,0.15)' }}>
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: '#B8860B' }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A017, #F59E0B)' }}>
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
              </div>
              Instrumentos Próximos do Vencimento ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2.5">
              {alertas.slice(0, 5).map((item) => {
                const status = getStatusInstrumento(item.dataTermino);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.99] group"
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
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencimento</p>
                        <p className="text-sm font-semibold tabular-nums" style={{ color: '#B8860B' }}>{formatDate(item.dataTermino)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
              {alertas.length > 5 && (
                <button
                  onClick={() => setLocation("/instrumentos")}
                  className="text-sm font-medium mt-2 flex items-center gap-1 transition-colors"
                  style={{ color: DETRAN_BLUE }}
                >
                  Ver todos os {alertas.length} alertas
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
