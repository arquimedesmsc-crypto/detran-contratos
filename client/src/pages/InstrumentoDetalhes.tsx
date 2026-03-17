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
  Plus,
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
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent></Card>
      </div>
    );
  }

  if (!instrumento) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/instrumentos")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Instrumento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatusInstrumento(instrumento.dataTermino);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/instrumentos")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {instrumento.tipo} n.º {instrumento.numero}
              </h1>
              <Badge variant="outline" className={`${status.bgColor} ${status.color} border`}>
                <span className={`w-2 h-2 rounded-full ${status.dotColor} mr-2`} />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{instrumento.diretoria}</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation(`/instrumentos/${id}/editar`)} className="gap-2">
              <Edit className="h-4 w-4" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Excluir
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField icon={<Hash className="h-4 w-4" />} label="Número" value={instrumento.numero} />
              <InfoField icon={<ScrollText className="h-4 w-4" />} label="Tipo" value={instrumento.tipo} />
              <InfoField icon={<Building2 className="h-4 w-4" />} label="Diretoria" value={instrumento.diretoria} />
              <InfoField icon={<Hash className="h-4 w-4" />} label="Processo SEI" value={instrumento.processoSei || "Não informado"} />
              <InfoField icon={<Calendar className="h-4 w-4" />} label="Data de Início" value={formatDate(instrumento.dataInicio)} />
              <InfoField icon={<Calendar className="h-4 w-4" />} label="Data de Término" value={formatDate(instrumento.dataTermino)} />
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Partes Envolvidas</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{instrumento.partesEnvolvidas}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Objeto</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{instrumento.objeto}</p>
            </div>

            {instrumento.arquivoOrigem && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Arquivo de Origem</span>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{instrumento.arquivoOrigem}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Vigência */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Vigência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`${status.bgColor} ${status.color} border`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                    {status.label}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Início</span>
                  <span className="text-sm font-medium">{formatDate(instrumento.dataInicio)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Término</span>
                  <span className="text-sm font-medium">{formatDate(instrumento.dataTermino)}</span>
                </div>
                {instrumento.dataInicio && instrumento.dataTermino && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Duração</span>
                      <span className="text-sm font-medium">
                        {Math.round((instrumento.dataTermino - instrumento.dataInicio) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10} anos
                      </span>
                    </div>
                    {instrumento.dataTermino > Date.now() && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Restante</span>
                        <span className="text-sm font-medium">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Termos Aditivos</CardTitle>
            </CardHeader>
            <CardContent>
              {termosLoading ? (
                <div className="h-16 bg-muted rounded animate-pulse" />
              ) : !termos || termos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum termo aditivo registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {termos.map((t) => (
                    <div key={t.id} className="p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{t.descricao}</p>
                          {t.dataAditivo && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Data: {formatDate(t.dataAditivo)}
                            </p>
                          )}
                        </div>
                        {user && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => deleteTermoMutation.mutate({ id: t.id })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
