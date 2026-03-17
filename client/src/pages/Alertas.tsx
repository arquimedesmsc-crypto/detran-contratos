import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";

export default function Alertas() {
  const { data: alertas, isLoading } = trpc.instrumentos.alertas.useQuery({ dias: 180 });
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          Alertas de Vencimento
        </h1>
        <p className="text-muted-foreground mt-1">
          Instrumentos com vencimento nos próximos 180 dias
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : !alertas || alertas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nenhum alerta</h3>
                <p className="text-muted-foreground mt-1">
                  Não há instrumentos com vencimento nos próximos 180 dias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((item) => {
            const status = getStatusInstrumento(item.dataTermino);
            const diasRestantes = item.dataTermino
              ? Math.ceil((item.dataTermino - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card
                key={item.id}
                className={`border-l-4 ${diasRestantes && diasRestantes <= 30 ? "border-l-red-500" : diasRestantes && diasRestantes <= 90 ? "border-l-amber-500" : "border-l-yellow-400"} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setLocation(`/instrumentos/${item.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {item.tipo} n.º {item.numero}
                        </span>
                        <Badge variant="outline" className={`text-xs ${status.bgColor} ${status.color} border`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.partesEnvolvidas}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.diretoria} · Processo: {item.processoSei || "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Vencimento</p>
                        <p className="text-sm font-bold text-foreground">{formatDate(item.dataTermino)}</p>
                      </div>
                      {diasRestantes !== null && (
                        <div className={`text-2xl font-bold ${diasRestantes <= 30 ? "text-red-600" : diasRestantes <= 90 ? "text-amber-600" : "text-yellow-600"}`}>
                          {diasRestantes}d
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
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
