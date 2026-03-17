export function getStatusInstrumento(dataTermino: number | null): {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
} {
  if (!dataTermino) {
    return {
      label: "Sem data",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      dotColor: "bg-muted-foreground",
    };
  }
  const now = Date.now();
  const dias180 = 180 * 24 * 60 * 60 * 1000;
  if (dataTermino < now) {
    return {
      label: "Vencido",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
      dotColor: "bg-red-500",
    };
  }
  if (dataTermino < now + dias180) {
    const diasRestantes = Math.ceil((dataTermino - now) / (1000 * 60 * 60 * 24));
    return {
      label: `Vence em ${diasRestantes}d`,
      color: "text-amber-700",
      bgColor: "bg-amber-50 border-amber-200",
      dotColor: "bg-amber-500",
    };
  }
  return {
    label: "Vigente",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    dotColor: "bg-emerald-500",
  };
}

export function formatDate(ts: number | null): string {
  if (!ts) return "Não definida";
  return new Date(ts).toLocaleDateString("pt-BR");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
