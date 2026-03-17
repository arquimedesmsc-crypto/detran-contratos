import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const TIPOS_INSTRUMENTO = [
  "Contrato",
  "Convênio",
  "Acordo de Cooperação Técnica",
  "Termo de Cooperação Técnica",
  "Acordo de Cooperação",
  "Termo de Acordo de Cooperação",
  "Termo de Credenciamento",
];

export default function InstrumentoForm() {
  const params = useParams<{ id: string }>();
  const isEditing = !!params.id;
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();

  const { data: instrumento, isLoading: loadingInstrumento } = trpc.instrumentos.getById.useQuery(
    { id },
    { enabled: isEditing && id > 0 }
  );
  const { data: diretorias } = trpc.instrumentos.diretorias.useQuery();

  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");
  const [partesEnvolvidas, setPartesEnvolvidas] = useState("");
  const [objeto, setObjeto] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [processoSei, setProcessoSei] = useState("");
  const [diretoria, setDiretoria] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (instrumento) {
      setNumero(instrumento.numero);
      setTipo(instrumento.tipo);
      setPartesEnvolvidas(instrumento.partesEnvolvidas);
      setObjeto(instrumento.objeto);
      setDataInicio(instrumento.dataInicio ? new Date(instrumento.dataInicio).toISOString().split("T")[0] : "");
      setDataTermino(instrumento.dataTermino ? new Date(instrumento.dataTermino).toISOString().split("T")[0] : "");
      setProcessoSei(instrumento.processoSei || "");
      setDiretoria(instrumento.diretoria);
    }
  }, [instrumento]);

  const utils = trpc.useUtils();

  const createMutation = trpc.instrumentos.create.useMutation({
    onSuccess: () => {
      toast.success("Instrumento criado com sucesso");
      utils.instrumentos.list.invalidate();
      utils.instrumentos.stats.invalidate();
      setLocation("/instrumentos");
    },
    onError: () => toast.error("Erro ao criar instrumento"),
  });

  const updateMutation = trpc.instrumentos.update.useMutation({
    onSuccess: () => {
      toast.success("Instrumento atualizado com sucesso");
      utils.instrumentos.list.invalidate();
      utils.instrumentos.stats.invalidate();
      utils.instrumentos.getById.invalidate({ id });
      setLocation(`/instrumentos/${id}`);
    },
    onError: () => toast.error("Erro ao atualizar instrumento"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !tipo || !partesEnvolvidas || !objeto || !diretoria) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const data = {
      numero,
      tipo,
      partesEnvolvidas,
      objeto,
      dataInicio: dataInicio ? new Date(dataInicio + "T00:00:00Z").getTime() : null,
      dataTermino: dataTermino ? new Date(dataTermino + "T00:00:00Z").getTime() : null,
      processoSei: processoSei || null,
      diretoria,
    };

    setSaving(true);
    if (isEditing) {
      updateMutation.mutate({ id, ...data }, { onSettled: () => setSaving(false) });
    } else {
      createMutation.mutate(data, { onSettled: () => setSaving(false) });
    }
  };

  if (isEditing && loadingInstrumento) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-96 bg-muted rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation(isEditing ? `/instrumentos/${id}` : "/instrumentos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar Instrumento" : "Novo Instrumento"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações do instrumento" : "Cadastre um novo instrumento jurídico"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Dados do Instrumento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 001/2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_INSTRUMENTO.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diretoria">Diretoria Responsável *</Label>
              <Select value={diretoria} onValueChange={setDiretoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a diretoria" />
                </SelectTrigger>
                <SelectContent>
                  {(diretorias ?? []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                  <SelectItem value="Outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partes">Partes Envolvidas *</Label>
              <Textarea
                id="partes"
                value={partesEnvolvidas}
                onChange={(e) => setPartesEnvolvidas(e.target.value)}
                placeholder="Ex: DETRAN-RJ e Município de Niterói"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objeto">Objeto *</Label>
              <Textarea
                id="objeto"
                value={objeto}
                onChange={(e) => setObjeto(e.target.value)}
                placeholder="Descrição do objeto do instrumento..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataTermino">Data de Término</Label>
                <Input id="dataTermino" type="date" value={dataTermino} onChange={(e) => setDataTermino(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processoSei">Processo SEI</Label>
              <Input
                id="processoSei"
                value={processoSei}
                onChange={(e) => setProcessoSei(e.target.value)}
                placeholder="Ex: SEI-150016/001818/2026"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(isEditing ? `/instrumentos/${id}` : "/instrumentos")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEditing ? "Salvar Alterações" : "Criar Instrumento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
