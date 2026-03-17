import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, FileText, Filter, X, Download } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";
import { useAuth } from "@/_core/hooks/useAuth";
import { exportToCSV, exportToPDF, formatInstrumentosForExport } from "@/lib/export-utils";

export default function Instrumentos() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [diretoria, setDiretoria] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 15;

  const [debouncedSearch] = useState(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (val: string, cb: (v: string) => void) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(val), 300);
    };
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: exportData } = trpc.instrumentos.export.useQuery({
    diretoria: diretoria !== "all" ? diretoria : undefined,
    tipo: tipo !== "all" ? tipo : undefined,
    search: searchQuery || undefined,
  });

  const { data: diretorias } = trpc.instrumentos.diretorias.useQuery();
  const { data: tipos } = trpc.instrumentos.tipos.useQuery();
  const { data, isLoading } = trpc.instrumentos.list.useQuery({
    search: searchQuery || undefined,
    diretoria: diretoria !== "all" ? diretoria : undefined,
    tipo: tipo !== "all" ? tipo : undefined,
    page,
    pageSize,
    sortBy,
    sortOrder,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);
  const hasActiveFilters = diretoria !== "all" || tipo !== "all" || searchQuery;

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchQuery("");
    setDiretoria("all");
    setTipo("all");
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
                exportToCSV(formatted, `instrumentos_${new Date().toISOString().split('T')[0]}`);
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
                exportToPDF(formatted, `instrumentos_${new Date().toISOString().split('T')[0]}`, "Relatório de Instrumentos - DETRAN-RJ");
              }
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sm:hidden">PDF</span>
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
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSearch(e.target.value, (v) => {
                  setSearchQuery(v);
                  setPage(1);
                });
              }}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Diretoria</label>
                  <Select value={diretoria} onValueChange={(v) => { setDiretoria(v); setPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Diretorias</SelectItem>
                      {(diretorias ?? []).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo de Instrumento</label>
                  <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      {(tipos ?? []).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground shrink-0" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active filter badges */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Filtros:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Busca: "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearch(""); setSearchQuery(""); setPage(1); }} />
              </Badge>
            )}
            {diretoria !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                {diretoria.replace("Diretoria de ", "")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setDiretoria("all"); setPage(1); }} />
              </Badge>
            )}
            {tipo !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                {tipo}
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setTipo("all"); setPage(1); }} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} instrumento{(data?.total ?? 0) !== 1 ? "s" : ""} encontrado{(data?.total ?? 0) !== 1 ? "s" : ""}
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
                  <SortHeader col="dataTermino" className="w-[120px]">Vencimento</SortHeader>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground">Nenhum instrumento encontrado</p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters}>Limpar filtros</Button>
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
                <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>Limpar filtros</Button>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
