import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, FileText, Filter, X, Download, Calendar, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";
import { useAuth } from "@/_core/hooks/useAuth";
import { exportToCSV, exportToPDF, formatInstrumentosForExport } from "@/lib/export-utils";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status", color: "" },
  { value: "vigente", label: "Vigente", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "proximo", label: "Próximo do Vencimento", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "vencido", label: "Vencido", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "sem_data", label: "Sem Data Definida", color: "bg-gray-100 text-gray-600 border-gray-200" },
];

function dateInputToTimestamp(value: string): number | undefined {
  if (!value) return undefined;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d.getTime();
}

function timestampToDateInput(ts: number | undefined): string {
  if (!ts) return "";
  return new Date(ts).toISOString().split("T")[0];
}

export default function Instrumentos() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Filtros
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [diretoria, setDiretoria] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [statusVigencia, setStatusVigencia] = useState("all");
  const [dataInicioMin, setDataInicioMin] = useState<string>("");
  const [dataInicioMax, setDataInicioMax] = useState<string>("");
  const [dataTerminoMin, setDataTerminoMin] = useState<string>("");
  const [dataTerminoMax, setDataTerminoMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Paginação e ordenação
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 15;

  // Debounce da busca
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => { setSearchQuery(val); setPage(1); }, 300);
    setDebounceTimer(t);
  };

  // Construir filtros para a query
  const queryFilters = useMemo(() => ({
    search: searchQuery || undefined,
    diretoria: diretoria !== "all" ? diretoria : undefined,
    tipo: tipo !== "all" ? tipo : undefined,
    statusVigencia: statusVigencia !== "all" ? statusVigencia : undefined,
    dataInicioMin: dateInputToTimestamp(dataInicioMin),
    dataInicioMax: dateInputToTimestamp(dataInicioMax),
    dataTerminoMin: dateInputToTimestamp(dataTerminoMin),
    dataTerminoMax: dateInputToTimestamp(dataTerminoMax),
    page,
    pageSize,
    sortBy,
    sortOrder,
  }), [searchQuery, diretoria, tipo, statusVigencia, dataInicioMin, dataInicioMax, dataTerminoMin, dataTerminoMax, page, pageSize, sortBy, sortOrder]);

  const { data: exportData } = trpc.instrumentos.export.useQuery({
    diretoria: diretoria !== "all" ? diretoria : undefined,
    tipo: tipo !== "all" ? tipo : undefined,
    search: searchQuery || undefined,
    statusVigencia: statusVigencia !== "all" ? statusVigencia : undefined,
    dataInicioMin: dateInputToTimestamp(dataInicioMin),
    dataInicioMax: dateInputToTimestamp(dataInicioMax),
    dataTerminoMin: dateInputToTimestamp(dataTerminoMin),
    dataTerminoMax: dateInputToTimestamp(dataTerminoMax),
  });

  const { data: diretorias } = trpc.instrumentos.diretorias.useQuery();
  const { data: tipos } = trpc.instrumentos.tipos.useQuery();
  const { data, isLoading } = trpc.instrumentos.list.useQuery(queryFilters);

  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

  // Verificar filtros ativos
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];
    if (searchQuery) filters.push({ key: "search", label: `Busca: "${searchQuery}"`, onRemove: () => { setSearch(""); setSearchQuery(""); setPage(1); } });
    if (diretoria !== "all") filters.push({ key: "diretoria", label: diretoria.replace("Diretoria de ", ""), onRemove: () => { setDiretoria("all"); setPage(1); } });
    if (tipo !== "all") filters.push({ key: "tipo", label: tipo, onRemove: () => { setTipo("all"); setPage(1); } });
    if (statusVigencia !== "all") {
      const s = STATUS_OPTIONS.find(o => o.value === statusVigencia);
      filters.push({ key: "status", label: s?.label ?? statusVigencia, onRemove: () => { setStatusVigencia("all"); setPage(1); } });
    }
    if (dataInicioMin) filters.push({ key: "dataInicioMin", label: `Início ≥ ${dataInicioMin}`, onRemove: () => { setDataInicioMin(""); setPage(1); } });
    if (dataInicioMax) filters.push({ key: "dataInicioMax", label: `Início ≤ ${dataInicioMax}`, onRemove: () => { setDataInicioMax(""); setPage(1); } });
    if (dataTerminoMin) filters.push({ key: "dataTerminoMin", label: `Vencimento ≥ ${dataTerminoMin}`, onRemove: () => { setDataTerminoMin(""); setPage(1); } });
    if (dataTerminoMax) filters.push({ key: "dataTerminoMax", label: `Vencimento ≤ ${dataTerminoMax}`, onRemove: () => { setDataTerminoMax(""); setPage(1); } });
    return filters;
  }, [searchQuery, diretoria, tipo, statusVigencia, dataInicioMin, dataInicioMax, dataTerminoMin, dataTerminoMax]);

  const hasActiveFilters = activeFilters.length > 0;

  const clearAllFilters = () => {
    setSearch(""); setSearchQuery("");
    setDiretoria("all"); setTipo("all"); setStatusVigencia("all");
    setDataInicioMin(""); setDataInicioMax("");
    setDataTerminoMin(""); setDataTerminoMax("");
    setPage(1);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
    setPage(1);
  };

  const SortHeader = ({ col, children, className = "" }: { col: string; children: React.ReactNode; className?: string }) => (
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Instrumentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie contratos, convênios e acordos de cooperação
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-xs sm:text-sm"
            onClick={() => {
              if (exportData && exportData.length > 0) {
                const formatted = formatInstrumentosForExport(exportData);
                exportToCSV(formatted, `instrumentos_${new Date().toISOString().split("T")[0]}`);
              }
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Excel</span>
            <span className="sm:hidden">XLS</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-xs sm:text-sm"
            onClick={() => {
              if (exportData && exportData.length > 0) {
                const formatted = formatInstrumentosForExport(exportData);
                exportToPDF(formatted, `instrumentos_${new Date().toISOString().split("T")[0]}`, "Relatório de Instrumentos - DETRAN-RJ");
              }
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </Button>
          {user && (
            <Button onClick={() => setLocation("/instrumentos/novo")} className="gap-2 shrink-0 shadow-sm h-9 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, partes, objeto ou processo SEI..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            className={`h-10 gap-2 shrink-0 ${showFilters ? "" : "border-dashed"}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Filtros Avançados</span>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-7 text-xs" onClick={clearAllFilters}>
                    <X className="h-3 w-3" />
                    Limpar todos
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Diretoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Diretoria</label>
                  <Select value={diretoria} onValueChange={(v) => { setDiretoria(v); setPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas as diretorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Diretorias</SelectItem>
                      {(diretorias ?? []).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo de Instrumento</label>
                  <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      {(tipos ?? []).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status de Vigência */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status de Vigência</label>
                  <Select value={statusVigencia} onValueChange={(v) => { setStatusVigencia(v); setPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            {opt.value !== "all" && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${opt.color}`}>
                                {opt.label}
                              </span>
                            )}
                            {opt.value === "all" && opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Início — intervalo */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Data de Início
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        placeholder="De"
                        value={dataInicioMin}
                        onChange={(e) => { setDataInicioMin(e.target.value); setPage(1); }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs shrink-0">até</span>
                    <div className="flex-1">
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        placeholder="Até"
                        value={dataInicioMax}
                        onChange={(e) => { setDataInicioMax(e.target.value); setPage(1); }}
                      />
                    </div>
                  </div>
                </div>

                {/* Data Término — intervalo */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Data de Vencimento
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        placeholder="De"
                        value={dataTerminoMin}
                        onChange={(e) => { setDataTerminoMin(e.target.value); setPage(1); }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs shrink-0">até</span>
                    <div className="flex-1">
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        placeholder="Até"
                        value={dataTerminoMax}
                        onChange={(e) => { setDataTerminoMax(e.target.value); setPage(1); }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chips de filtros ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground font-medium">Filtros ativos:</span>
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                variant="secondary"
                className="gap-1 text-xs font-normal pr-1 pl-2 h-6 cursor-default"
              >
                {f.label}
                <button
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                  onClick={f.onRemove}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              onClick={clearAllFilters}
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <span className="inline-block w-32 h-4 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{data?.total ?? 0}</span>{" "}
              instrumento{(data?.total ?? 0) !== 1 ? "s" : ""} encontrado{(data?.total ?? 0) !== 1 ? "s" : ""}
              {hasActiveFilters && (
                <span className="text-muted-foreground/70"> com os filtros aplicados</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <SortHeader col="numero" className="w-[110px]">N.º</SortHeader>
                  <SortHeader col="tipo" className="w-[180px]">Tipo</SortHeader>
                  <TableHead className="min-w-[200px]">Partes Envolvidas</TableHead>
                  <SortHeader col="diretoria" className="w-[180px]">Diretoria</SortHeader>
                  <SortHeader col="dataInicio" className="w-[110px]">Início</SortHeader>
                  <SortHeader col="dataTermino" className="w-[120px]">Vencimento</SortHeader>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground">Nenhum instrumento encontrado</p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearAllFilters}>Limpar filtros</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.items ?? []).map((item) => {
                    const status = getStatusInstrumento(item.dataTermino);
                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors group"
                        onClick={() => setLocation(`/instrumentos/${item.id}`)}
                      >
                        <TableCell className="font-semibold text-sm text-primary">{item.numero}</TableCell>
                        <TableCell className="text-sm">{item.tipo}</TableCell>
                        <TableCell className="text-sm max-w-[300px]">
                          <span className="line-clamp-2">{item.partesEnvolvidas}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.diretoria.replace("Diretoria de ", "")}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-muted-foreground">{formatDate(item.dataInicio)}</TableCell>
                        <TableCell className="text-sm tabular-nums">{formatDate(item.dataTermino)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium ${status.bgColor} ${status.color} border whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5 shrink-0`} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setLocation(`/instrumentos/${item.id}`); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (data?.items ?? []).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum instrumento encontrado</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-3" onClick={clearAllFilters}>Limpar filtros</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          (data?.items ?? []).map((item) => {
            const status = getStatusInstrumento(item.dataTermino);
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => setLocation(`/instrumentos/${item.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-primary">{item.numero}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.bgColor} ${status.color} border`}>
                          <span className={`w-1 h-1 rounded-full ${status.dotColor} mr-1`} />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{item.tipo}</p>
                      <p className="text-sm line-clamp-2 leading-relaxed">{item.partesEnvolvidas}</p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {item.diretoria.replace("Diretoria de ", "")}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {item.dataTermino ? `Vence: ${formatDate(item.dataTermino)}` : "Sem data"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Página {page} de {totalPages} ({data?.total} resultados)
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0 text-xs" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
