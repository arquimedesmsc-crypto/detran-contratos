import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";

export default function Alertas() {
  const { data: alertas, isLoading } = trpc.instrumentos.alertas.useQuery({ dias: 180 });
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-8 w-8 rounded-lg bg-[#BC9D32]/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-[#BC9D32]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Alertas de Vencimento</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[42px]">
          Instrumentos com vencimento nos próximos 180 dias
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : !alertas || alertas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#427842]/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-[#427842]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nenhum alerta</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Não há instrumentos com vencimento nos próximos 180 dias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {alertas.map((item) => {
            const status = getStatusInstrumento(item.dataTermino);
            const diasRestantes = item.dataTermino
              ? Math.ceil((item.dataTermino - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card
                key={item.id}
                className={`border-l-4 ${diasRestantes !== null && diasRestantes <= 30 ? "border-l-red-500" : diasRestantes !== null && diasRestantes <= 90 ? "border-l-[#BC9D32]" : "border-l-[#BC9D32]/50"} hover:shadow-md transition-all cursor-pointer active:scale-[0.995]`}
                onClick={() => setLocation(`/instrumentos/${item.id}`)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-foreground">
                          {item.tipo} n.º {item.numero}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.bgColor} ${status.color} border`}>
                          <span className={`w-1 h-1 rounded-full ${status.dotColor} mr-1`} />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{item.partesEnvolvidas}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                        {(item.diretoria || "").replace("Diretoria de ", "")} · Processo: {item.processoSei || "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencimento</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{formatDate(item.dataTermino)}</p>
                      </div>
                      {diasRestantes !== null && (
                        <div className={`text-xl sm:text-2xl font-bold tabular-nums ${diasRestantes <= 30 ? "text-red-600" : diasRestantes <= 90 ? "text-[#BC9D32]" : "text-[#BC9D32]/70"}`}>
                          {diasRestantes}d
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2 hidden sm:flex">
                        Detalhes <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
