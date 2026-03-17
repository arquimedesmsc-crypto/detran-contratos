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
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";
import { toast } from "sonner";

export default function InstrumentoDetalhes() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: instrumento, isLoading } = trpc.instrumentos.getById.useQuery({ id }, { enabled: id > 0 });
  const { data: termos, isLoading: termosLoading } = trpc.termos.byInstrumento.useQuery({ instrumentoId: id }, { enabled: id > 0 });
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
      <div className="space-y-5">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="animate-pulse"><CardContent className="p-5"><div className="h-64 bg-muted rounded" /></CardContent></Card>
      </div>
    );
  }

  if (!instrumento) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={() => setLocation("/instrumentos")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Instrumento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatusInstrumento(instrumento.dataTermino);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 mt-0.5" onClick={() => setLocation("/instrumentos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {instrumento.tipo} n.º {instrumento.numero}
              </h1>
              <Badge variant="outline" className={`text-xs ${status.bgColor} ${status.color} border whitespace-nowrap`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{instrumento.diretoria}</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2 ml-11 sm:ml-0 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/instrumentos/${id}/editar`)} className="gap-1.5 h-8">
              <Edit className="h-3.5 w-3.5" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir instrumento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O instrumento e todos os seus termos aditivos serão removidos permanentemente.
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

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField icon={<Hash className="h-3.5 w-3.5" />} label="Número" value={instrumento.numero} />
              <InfoField icon={<ScrollText className="h-3.5 w-3.5" />} label="Tipo" value={instrumento.tipo} />
              <InfoField icon={<Building2 className="h-3.5 w-3.5" />} label="Diretoria" value={instrumento.diretoria} />
              <InfoField icon={<Hash className="h-3.5 w-3.5" />} label="Processo SEI" value={instrumento.processoSei || "Não informado"} />
              <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="Data de Início" value={formatDate(instrumento.dataInicio)} />
              <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="Data de Término" value={formatDate(instrumento.dataTermino)} />
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Partes Envolvidas</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{instrumento.partesEnvolvidas}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Objeto</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{instrumento.objeto}</p>
            </div>

            {instrumento.arquivoOrigem && (
              <>
                <Separator />
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Arquivo de Origem</span>
                  <p className="text-xs text-muted-foreground font-mono mt-1 break-all">{instrumento.arquivoOrigem}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Vigência + Termos */}
        <div className="space-y-4 sm:space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Vigência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.bgColor} ${status.color} border`}>
                    <span className={`w-1 h-1 rounded-full ${status.dotColor} mr-1`} />
                    {status.label}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Início</span>
                  <span className="text-sm font-medium tabular-nums">{formatDate(instrumento.dataInicio)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Término</span>
                  <span className="text-sm font-medium tabular-nums">{formatDate(instrumento.dataTermino)}</span>
                </div>
                {instrumento.dataInicio && instrumento.dataTermino && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Duração</span>
                      <span className="text-sm font-medium">
                        {Math.round((instrumento.dataTermino - instrumento.dataInicio) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10} anos
                      </span>
                    </div>
                    {instrumento.dataTermino > Date.now() && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Restante</span>
                        <span className="text-sm font-semibold text-[#005A92] tabular-nums">
                          {Math.ceil((instrumento.dataTermino - Date.now()) / (1000 * 60 * 60 * 24))} dias
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Termos Aditivos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                Termos Aditivos
                {termos && termos.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{termos.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {termosLoading ? (
                <div className="h-16 bg-muted rounded animate-pulse" />
              ) : !termos || termos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Nenhum termo aditivo registrado
                </p>
              ) : (
                <div className="space-y-2.5">
                  {termos.map((t, idx) => (
                    <div key={t.id} className="p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {idx + 1}º Termo Aditivo
                          </p>
                          <p className="text-xs text-foreground leading-relaxed">{t.descricao}</p>
                          {t.dataAditivo && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">
                              Data: {formatDate(t.dataAditivo)}
                            </p>
                          )}
                        </div>
                        {user && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => deleteTermoMutation.mutate({ id: t.id })}
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

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
