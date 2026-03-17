import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Building2,
  Calendar,
  Hash,
  Users,
  ScrollText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CalendarClock,
  FileSearch,
  Landmark,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";
import { toast } from "sonner";

export default function InstrumentoDetalhes() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: instrumento, isLoading } = trpc.instrumentos.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );
  const { data: termos, isLoading: termosLoading } =
    trpc.termos.byInstrumento.useQuery(
      { instrumentoId: id },
      { enabled: id > 0 }
    );
  const utils = trpc.useUtils();

  const deleteMutation = trpc.instrumentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Instrumento excluído com sucesso");
      setLocation("/instrumentos");
    },
    onError: () => toast.error("Erro ao excluir instrumento"),
  });

  const deleteTermoMutation = trpc.termos.delete.useMutation({
    onSuccess: () => {
      toast.success("Termo aditivo removido");
      utils.termos.byInstrumento.invalidate({ instrumentoId: id });
    },
    onError: () => toast.error("Erro ao remover termo aditivo"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!instrumento) {
    return (
      <div className="space-y-5 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/instrumentos")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="p-16 text-center">
            <FileSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Instrumento não encontrado
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              O instrumento solicitado não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatusInstrumento(instrumento.dataTermino);

  // Calcular progresso de vigência
  let progressPercent = 0;
  let diasRestantes: number | null = null;
  let duracaoTotal: number | null = null;

  if (instrumento.dataInicio && instrumento.dataTermino) {
    const inicio = instrumento.dataInicio;
    const termino = instrumento.dataTermino;
    const agora = Date.now();
    duracaoTotal = Math.round((termino - inicio) / (1000 * 60 * 60 * 24));
    const diasDecorridos = Math.round((agora - inicio) / (1000 * 60 * 60 * 24));
    progressPercent = Math.min(100, Math.max(0, Math.round((diasDecorridos / duracaoTotal) * 100)));
    if (termino > agora) {
      diasRestantes = Math.ceil((termino - agora) / (1000 * 60 * 60 * 24));
    }
  }

  const StatusIcon =
    status.label === "Vigente"
      ? CheckCircle2
      : status.label === "Próx. Vencimento"
        ? AlertTriangle
        : XCircle;

  const statusColorMap: Record<string, string> = {
    Vigente: "text-emerald-600",
    "Próx. Vencimento": "text-amber-600",
    Vencido: "text-red-600",
  };

  const progressColorMap: Record<string, string> = {
    Vigente: "bg-emerald-500",
    "Próx. Vencimento": "bg-amber-500",
    Vencido: "bg-red-500",
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 mt-0.5 rounded-lg"
            onClick={() => setLocation("/instrumentos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {instrumento.tipo} n.º {instrumento.numero}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${status.bgColor} ${status.color} border-0 px-2.5 py-0.5`}
              >
                <StatusIcon
                  className={`h-3 w-3 mr-1.5 ${statusColorMap[status.label] ?? ""}`}
                />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {instrumento.diretoria}
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 ml-12 sm:ml-0 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/instrumentos/${id}/editar`)}
              className="gap-1.5 h-9 rounded-lg"
            >
              <Edit className="h-3.5 w-3.5" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9 rounded-lg text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir instrumento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O instrumento e todos os
                    seus termos aditivos serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate({ id })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Barra de Vigência */}
      {instrumento.dataInicio && instrumento.dataTermino && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-[#005A92]/5 to-[#005A92]/10">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Progresso de Vigência
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressColorMap[status.label] ?? "bg-primary"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(instrumento.dataInicio)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(instrumento.dataTermino)}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right sm:border-l sm:pl-5 sm:border-border/50">
                {duracaoTotal !== null && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Duração total</p>
                    <p className="text-sm font-bold text-foreground">
                      {Math.round((duracaoTotal / 365.25) * 10) / 10} anos
                    </p>
                  </div>
                )}
                {diasRestantes !== null ? (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Dias restantes</p>
                    <p className={`text-sm font-bold ${statusColorMap[status.label] ?? "text-foreground"}`}>
                      {diasRestantes} dias
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Status</p>
                    <p className="text-sm font-bold text-red-600">Encerrado</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Informações Gerais */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoField
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label="Número do Instrumento"
                  value={instrumento.numero}
                />
                <InfoField
                  icon={<ScrollText className="h-3.5 w-3.5" />}
                  label="Tipo"
                  value={instrumento.tipo}
                />
                <InfoField
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="Diretoria Responsável"
                  value={instrumento.diretoria}
                />
                <InfoField
                  icon={<Landmark className="h-3.5 w-3.5" />}
                  label="Processo SEI"
                  value={instrumento.processoSei || "Não informado"}
                  mono
                />
                <InfoField
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Data de Início"
                  value={formatDate(instrumento.dataInicio)}
                />
                <InfoField
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                  label="Data de Término"
                  value={formatDate(instrumento.dataTermino)}
                />
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Partes Envolvidas
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-8">
                  {instrumento.partesEnvolvidas}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Objeto
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-8">
                  {instrumento.objeto}
                </p>
              </div>

              {instrumento.arquivoOrigem && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono break-all">
                      {instrumento.arquivoOrigem.split("/").pop()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Card de Vigência */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Vigência
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status atual</span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${status.bgColor} ${status.color} border-0`}
                  >
                    <StatusIcon className={`h-3 w-3 mr-1 ${statusColorMap[status.label] ?? ""}`} />
                    {status.label}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Início</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatDate(instrumento.dataInicio)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Término</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatDate(instrumento.dataTermino)}
                  </span>
                </div>
                {duracaoTotal !== null && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Duração</span>
                      <span className="text-sm font-semibold">
                        {Math.round((duracaoTotal / 365.25) * 10) / 10} anos
                      </span>
                    </div>
                    {diasRestantes !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Dias restantes</span>
                        <span
                          className={`text-sm font-bold tabular-nums ${statusColorMap[status.label] ?? "text-foreground"}`}
                        >
                          {diasRestantes} dias
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Termos Aditivos */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <div className="h-7 w-7 rounded-lg bg-[#005A92]/10 flex items-center justify-center">
                  <ScrollText className="h-3.5 w-3.5 text-[#005A92]" />
                </div>
                Termos Aditivos
                {termos && termos.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 ml-auto"
                  >
                    {termos.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {termosLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !termos || termos.length === 0 ? (
                <div className="text-center py-8">
                  <ScrollText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Nenhum termo aditivo registrado
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {termos.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-muted/40 rounded-xl border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="h-4 w-4 rounded-full bg-[#005A92] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Termo Aditivo
                            </p>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">
                            {t.descricao}
                          </p>
                          {t.dataAditivo && (
                            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(t.dataAditivo)}
                            </p>
                          )}
                        </div>
                        {user && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground/50 hover:text-destructive shrink-0"
                            onClick={() =>
                              deleteTermoMutation.mutate({ id: t.id })
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
