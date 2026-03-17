import { trpc } from "@/lib/trpc";
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
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { getStatusInstrumento, formatDate } from "@/lib/utils-instrumentos";

export default function Instrumentos() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [diretoria, setDiretoria] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 15;

  const [debouncedSearch] = useState(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (val: string, cb: (v: string) => void) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(val), 300);
    };
  });
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const SortHeader = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortBy === col ? "text-primary" : "text-muted-foreground/40"}`} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instrumentos</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} instrumentos cadastrados
          </p>
        </div>
        <Button onClick={() => setLocation("/instrumentos/novo")} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Instrumento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, partes, objeto ou processo..."
                className="pl-9"
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
            <Select value={diretoria} onValueChange={(v) => { setDiretoria(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Diretoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Diretorias</SelectItem>
                {(diretorias ?? []).map((d) => (
                  <SelectItem key={d} value={d}>{d.replace("Diretoria de ", "")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {(tipos ?? []).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <SortHeader col="numero">Número</SortHeader>
                  <SortHeader col="tipo">Tipo</SortHeader>
                  <TableHead>Partes</TableHead>
                  <SortHeader col="diretoria">Diretoria</SortHeader>
                  <SortHeader col="dataTermino">Vencimento</SortHeader>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (data?.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhum instrumento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.items ?? []).map((item) => {
                    const status = getStatusInstrumento(item.dataTermino);
                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setLocation(`/instrumentos/${item.id}`)}
                      >
                        <TableCell className="font-medium text-sm">{item.numero}</TableCell>
                        <TableCell className="text-sm">{item.tipo}</TableCell>
                        <TableCell className="text-sm max-w-[250px] truncate">{item.partesEnvolvidas}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.diretoria.replace("Diretoria de ", "")}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(item.dataTermino)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${status.bgColor} ${status.color} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setLocation(`/instrumentos/${item.id}`); }}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} ({data?.total} resultados)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
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
                      className="w-8 h-8 p-0"
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
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
