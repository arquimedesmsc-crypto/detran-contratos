import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield, Wifi, WifiOff, Ban, Search, Plus, Eye, Pencil, Trash2,
  Paperclip, Server, User, Building2, Globe, Loader2, ArrowUpDown,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AnexosModal } from "@/components/AnexosModal";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  conectado: { label: "Conectado", color: "text-green-700", bg: "bg-green-50 border-green-200", dot: "bg-green-500" },
  desconectado: { label: "Desconectado", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
  bloqueado: { label: "Bloqueado", color: "text-red-700", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
};

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(ts: number | Date | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts as any).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface VpnFormData {
  nomeUsuario: string;
  matricula: string;
  diretoria: string;
  servidor: string;
  ipAtribuido: string;
  status: "conectado" | "desconectado" | "bloqueado";
}

const EMPTY_FORM: VpnFormData = {
  nomeUsuario: "", matricula: "", diretoria: "",
  servidor: "", ipAtribuido: "", status: "desconectado",
};

export default function Vpn() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nomeUsuario");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VpnFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; nome: string } | null>(null);
  const [anexosModal, setAnexosModal] = useState<{ id: number; nome: string } | null>(null);

  const utils = trpc.useUtils();

  const { data: conexoes, isLoading } = trpc.vpn.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: stats } = trpc.vpn.stats.useQuery();

  const itemIds = useMemo(() => (conexoes ?? []).map(c => c.id), [conexoes]);
  const { data: anexosCounts } = trpc.anexos.countByIds.useQuery(
    { entidadeTipo: "vpn", entidadeIds: itemIds },
    { enabled: itemIds.length > 0 }
  );

  const createMutation = trpc.vpn.create.useMutation({
    onSuccess: () => {
      toast.success("Conexão VPN criada com sucesso");
      utils.vpn.list.invalidate();
      utils.vpn.stats.invalidate();
      setFormOpen(false);
      setFormData(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.message || "Erro ao criar conexão"),
  });

  const updateMutation = trpc.vpn.update.useMutation({
    onSuccess: () => {
      toast.success("Conexão VPN atualizada");
      utils.vpn.list.invalidate();
      utils.vpn.stats.invalidate();
      setFormOpen(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.message || "Erro ao atualizar conexão"),
  });

  const deleteMutation = trpc.vpn.delete.useMutation({
    onSuccess: () => {
      toast.success("Conexão VPN excluída");
      utils.vpn.list.invalidate();
      utils.vpn.stats.invalidate();
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Erro ao excluir conexão"),
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      nomeUsuario: item.nomeUsuario ?? "",
      matricula: item.matricula ?? "",
      diretoria: item.diretoria ?? "",
      servidor: item.servidor ?? "",
      ipAtribuido: item.ipAtribuido ?? "",
      status: item.status ?? "desconectado",
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nomeUsuario.trim() || !formData.servidor.trim()) {
      toast.error("Nome do usuário e servidor são obrigatórios");
      return;
    }
    const payload = {
      nomeUsuario: formData.nomeUsuario.trim(),
      matricula: formData.matricula.trim() || null,
      diretoria: formData.diretoria.trim() || null,
      servidor: formData.servidor.trim(),
      ipAtribuido: formData.ipAtribuido.trim() || null,
      status: formData.status,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const sorted = useMemo(() => {
    if (!conexoes) return [];
    return [...conexoes].sort((a, b) => {
      const av = (a as any)[sortBy] ?? "";
      const bv = (b as any)[sortBy] ?? "";
      const cmp = String(av).localeCompare(String(bv), "pt-BR");
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [conexoes, sortBy, sortOrder]);

  const SortHeader = ({
    col, children, className = "",
  }: { col: string; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <ArrowUpDown className={`h-3 w-3 shrink-0 ${sortBy === col ? "text-primary" : "text-muted-foreground/30"}`} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            VPN
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie conexões e usuários da rede privada virtual
          </p>
        </div>
        {user && (
          <Button
            className="gap-2 shadow-sm h-9 text-sm shrink-0"
            onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setFormOpen(true); }}
          >
            <Plus className="h-4 w-4" />Nova Conexão
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats?.total ?? 0, icon: <Server className="h-4 w-4" />, color: "text-primary", border: "border-l-primary" },
          { label: "Conectados", value: stats?.conectadas ?? 0, icon: <Wifi className="h-4 w-4" />, color: "text-green-600", border: "border-l-green-500" },
          { label: "Desconectados", value: stats?.desconectadas ?? 0, icon: <WifiOff className="h-4 w-4" />, color: "text-muted-foreground", border: "border-l-gray-400" },
        ].map((s) => (
          <Card key={s.label} className={`border-l-4 ${s.border} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <span className={s.color}>{s.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuário, matrícula, servidor ou IP..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-10 shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="conectado">Conectado</SelectItem>
            <SelectItem value="desconectado">Desconectado</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {!isLoading && (conexoes ?? []).length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-2">Nenhuma conexão VPN cadastrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== "all"
                ? "Nenhum resultado para os filtros aplicados."
                : "Adicione a primeira conexão VPN clicando no botão acima."}
            </p>
            {user && !search && statusFilter === "all" && (
              <Button
                size="sm" className="gap-2"
                onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setFormOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5" />Adicionar Conexão
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Desktop Table */}
      {(isLoading || sorted.length > 0) && (
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <SortHeader col="id" className="w-[60px]">ID</SortHeader>
                    <SortHeader col="nomeUsuario" className="min-w-[160px]">Usuário</SortHeader>
                    <SortHeader col="matricula" className="w-[110px]">Matrícula</SortHeader>
                    <SortHeader col="diretoria" className="w-[160px]">Diretoria</SortHeader>
                    <SortHeader col="servidor" className="w-[160px]">Servidor</SortHeader>
                    <SortHeader col="ipAtribuido" className="w-[130px]">IP Atribuído</SortHeader>
                    <SortHeader col="ultimaConexao" className="w-[150px]">Última Conexão</SortHeader>
                    <TableHead className="w-[100px]">Tráfego</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[70px] text-center">Anexos</TableHead>
                    <TableHead className="w-[110px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(11)].map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : sorted.map((item) => {
                        const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.desconectado;
                        const numAnexos = (anexosCounts as Record<number, number>)?.[item.id] ?? 0;
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="text-xs text-muted-foreground font-mono">{item.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">{item.nomeUsuario}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">{item.matricula ?? "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.diretoria ?? "—"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Server className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                <span className="text-xs font-mono">{item.servidor}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{item.ipAtribuido ?? "—"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">{formatDate(item.ultimaConexao)}</TableCell>
                            <TableCell>
                              <div className="text-[10px] space-y-0.5">
                                <div className="text-green-600">↑ {formatBytes(item.bytesEnviados)}</div>
                                <div className="text-blue-600">↓ {formatBytes(item.bytesRecebidos)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs font-medium ${st.bg} ${st.color} border gap-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="sm"
                                    className={`h-7 gap-1 text-xs ${numAnexos > 0 ? "text-primary hover:text-primary" : "text-muted-foreground/50"}`}
                                    onClick={() => setAnexosModal({ id: item.id, nome: item.nomeUsuario })}
                                  >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {numAnexos > 0 && <span className="font-semibold">{numAnexos}</span>}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {numAnexos > 0 ? `${numAnexos} anexo${numAnexos !== 1 ? "s" : ""}` : "Sem anexos"}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-0.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => setLocation(`/vpn/${item.id}`)}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Visualizar</TooltipContent>
                                </Tooltip>
                                {user && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                                          onClick={() => handleEdit(item)}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                                          onClick={() => setAnexosModal({ id: item.id, nome: item.nomeUsuario })}
                                        >
                                          <Paperclip className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Gerenciar Anexos</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                          onClick={() => setDeleteConfirm({ id: item.id, nome: item.nomeUsuario })}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Excluir</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile Cards */}
      {sorted.length > 0 && (
        <div className="md:hidden space-y-3">
          {sorted.map((item) => {
            const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.desconectado;
            const numAnexos = (anexosCounts as Record<number, number>)?.[item.id] ?? 0;
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.nomeUsuario}</p>
                        <p className="text-xs text-muted-foreground">{item.matricula ?? "Sem matrícula"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${st.bg} ${st.color} border shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot} mr-1`} />
                      {st.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1"><Server className="h-3 w-3" />{item.servidor}</div>
                    <div className="flex items-center gap-1"><Globe className="h-3 w-3" />{item.ipAtribuido ?? "Sem IP"}</div>
                    <div className="flex items-center gap-1"><Building2 className="h-3 w-3" />{item.diretoria ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-1 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs flex-1"
                      onClick={() => setLocation(`/vpn/${item.id}`)}>
                      <Eye className="h-3 w-3" />Ver
                    </Button>
                    {user && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs flex-1"
                          onClick={() => handleEdit(item)}>
                          <Pencil className="h-3 w-3" />Editar
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className={`h-7 gap-1 text-xs flex-1 ${numAnexos > 0 ? "text-primary" : ""}`}
                          onClick={() => setAnexosModal({ id: item.id, nome: item.nomeUsuario })}
                        >
                          <Paperclip className="h-3 w-3" />
                          {numAnexos > 0 ? `${numAnexos}` : "Anexos"}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive flex-1"
                          onClick={() => setDeleteConfirm({ id: item.id, nome: item.nomeUsuario })}>
                          <Trash2 className="h-3 w-3" />Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => { if (!v) { setFormOpen(false); setEditingId(null); setFormData(EMPTY_FORM); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingId !== null ? "Editar Conexão VPN" : "Nova Conexão VPN"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium">
                  Nome do Usuário <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Ex: João da Silva"
                  value={formData.nomeUsuario}
                  onChange={(e) => setFormData(f => ({ ...f, nomeUsuario: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Matrícula</Label>
                <Input
                  placeholder="Ex: 123456"
                  value={formData.matricula}
                  onChange={(e) => setFormData(f => ({ ...f, matricula: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Diretoria</Label>
                <Input
                  placeholder="Ex: DIIC"
                  value={formData.diretoria}
                  onChange={(e) => setFormData(f => ({ ...f, diretoria: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium">
                  Servidor <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Ex: vpn.detran.rj.gov.br"
                  value={formData.servidor}
                  onChange={(e) => setFormData(f => ({ ...f, servidor: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">IP Atribuído</Label>
                <Input
                  placeholder="Ex: 10.0.0.1"
                  value={formData.ipAtribuido}
                  onChange={(e) => setFormData(f => ({ ...f, ipAtribuido: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData(f => ({ ...f, status: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conectado">Conectado</SelectItem>
                    <SelectItem value="desconectado">Desconectado</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setFormOpen(false); setEditingId(null); setFormData(EMPTY_FORM); }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingId !== null ? "Salvar Alterações" : "Criar Conexão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conexão VPN?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conexão de{" "}
              <strong>{deleteConfirm?.nome}</strong>? Esta ação não pode ser desfeita
              e todos os anexos associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && deleteMutation.mutate({ id: deleteConfirm.id })}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Anexos */}
      {anexosModal && (
        <AnexosModal
          open={!!anexosModal}
          onClose={() => setAnexosModal(null)}
          entidadeTipo="vpn"
          entidadeId={anexosModal.id}
          entidadeNome={anexosModal.nome}
        />
      )}
    </div>
  );
}
