import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  Wifi,
  WifiOff,
  Ban,
  Server,
  User,
  Building2,
  Globe,
  Activity,
  Clock,
  Hash,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Network,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { formatBytes } from "@/lib/utils-instrumentos";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    icon: typeof Wifi;
    color: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    gradientFrom: string;
  }
> = {
  conectado: {
    label: "Conectado",
    icon: Wifi,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    gradientFrom: "from-emerald-50",
  },
  desconectado: {
    label: "Desconectado",
    icon: WifiOff,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    dotColor: "bg-gray-400",
    gradientFrom: "from-gray-50",
  },
  bloqueado: {
    label: "Bloqueado",
    icon: Ban,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    gradientFrom: "from-red-50",
  },
};

function formatLastConn(ts: number | null) {
  if (!ts) return "Nunca conectado";
  const diff = Date.now() - ts;
  if (diff < 60000) return "Agora mesmo";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutos atrás`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} horas atrás`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "Ontem";
  return `${days} dias atrás`;
}

function formatDateFull(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VpnDetalhes() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();

  const { data: conexoes, isLoading } = trpc.vpn.list.useQuery({});

  const conexao = conexoes?.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-80 bg-muted rounded-xl animate-pulse" />
          <div className="h-80 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!conexao) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/vpn")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="p-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Conexão não encontrada
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              O registro de VPN solicitado não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const st = STATUS_MAP[conexao.status] ?? STATUS_MAP.desconectado;
  const StatusIcon = st.icon;

  const totalBytes = (conexao.bytesEnviados ?? 0) + (conexao.bytesRecebidos ?? 0);
  const uploadPct =
    totalBytes > 0
      ? Math.round(((conexao.bytesEnviados ?? 0) / totalBytes) * 100)
      : 50;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 mt-0.5 rounded-lg"
            onClick={() => setLocation("/vpn")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {conexao.nomeUsuario}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${st.bgColor} ${st.color} ${st.borderColor} px-2.5 py-0.5`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${st.dotColor} mr-1.5 animate-${conexao.status === "conectado" ? "pulse" : "none"}`}
                />
                {st.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {conexao.diretoria || "Diretoria não informada"}
            </p>
          </div>
        </div>
      </div>

      {/* Banner de Status */}
      <Card
        className={`border-0 shadow-sm bg-gradient-to-r ${st.gradientFrom} to-transparent`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className={`h-14 w-14 rounded-2xl ${st.bgColor} border ${st.borderColor} flex items-center justify-center shrink-0`}
            >
              <StatusIcon className={`h-7 w-7 ${st.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Status da Conexão VPN
              </p>
              <p className={`text-2xl font-bold mt-0.5 ${st.color}`}>
                {st.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Última atividade: {formatLastConn(conexao.ultimaConexao)}
              </p>
            </div>
            <div className="text-sm text-muted-foreground sm:text-right">
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1">
                Última Conexão
              </p>
              <p className="font-mono text-xs text-foreground">
                {formatDateFull(conexao.ultimaConexao)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Informações do Usuário + Rede */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dados do Usuário */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Dados do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoField
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Nome Completo"
                  value={conexao.nomeUsuario}
                />
                <InfoField
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label="Matrícula"
                  value={conexao.matricula || "Não informada"}
                  mono
                />
                <InfoField
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="Diretoria"
                  value={conexao.diretoria || "Não informada"}
                />
                <InfoField
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Última Conexão"
                  value={formatLastConn(conexao.ultimaConexao)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados de Rede */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <Network className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Dados de Rede
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoField
                  icon={<Server className="h-3.5 w-3.5" />}
                  label="Servidor VPN"
                  value={conexao.servidor}
                  mono
                />
                <InfoField
                  icon={<Globe className="h-3.5 w-3.5" />}
                  label="IP Atribuído"
                  value={conexao.ipAtribuido || "Não atribuído"}
                  mono
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Tráfego */}
        <div className="space-y-5">
          {/* Card de Tráfego */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Tráfego de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {/* Total */}
                <div className="text-center p-3 bg-muted/40 rounded-xl">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                    Total Transferido
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatBytes(totalBytes)}
                  </p>
                </div>

                <Separator />

                {/* Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className="h-3.5 w-3.5 text-[#005A92]" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Enviado (Upload)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {formatBytes(conexao.bytesEnviados ?? 0)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005A92] rounded-full"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                </div>

                {/* Download */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Recebido (Download)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {formatBytes(conexao.bytesRecebidos ?? 0)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${100 - uploadPct}%` }}
                    />
                  </div>
                </div>

                {totalBytes === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Nenhum tráfego registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Resumo */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <ArrowUpDown className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ${st.bgColor} ${st.color} ${st.borderColor}`}
                  >
                    {st.label}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Servidor</span>
                  <span className="text-xs font-mono font-medium">
                    {conexao.servidor}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">IP</span>
                  <span className="text-xs font-mono font-medium">
                    {conexao.ipAtribuido || "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Última atividade</span>
                  <span className="text-xs font-medium">
                    {formatLastConn(conexao.ultimaConexao)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nota de dados mockup */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <Shield className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Dados de demonstração:</strong> Esta seção exibe dados mockup. Os dados reais de VPN serão integrados quando disponíveis.
        </p>
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground/70">{icon}</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
