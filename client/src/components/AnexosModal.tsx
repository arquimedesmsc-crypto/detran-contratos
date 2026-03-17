import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Paperclip, Upload, Download, Trash2, FileText, FileArchive,
  File, Loader2, X, AlertCircle,
} from "lucide-react";

const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".com", ".msi", ".sh", ".ps1"];
const MAX_SIZE_MB = 20;

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
    return <FileArchive className="h-4 w-4 text-amber-500" />;
  if (mimeType.startsWith("image/")) return <File className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number | string | Date): string {
  return new Date(ts as any).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface AnexosModalProps {
  open: boolean;
  onClose: () => void;
  entidadeTipo: "instrumento" | "vpn";
  entidadeId: number;
  entidadeNome: string;
}

export function AnexosModal({ open, onClose, entidadeTipo, entidadeId, entidadeNome }: AnexosModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const utils = trpc.useUtils();

  const { data: anexos, isLoading } = trpc.anexos.list.useQuery(
    { entidadeTipo, entidadeId },
    { enabled: open }
  );

  const uploadMutation = trpc.anexos.upload.useMutation({
    onSuccess: () => {
      utils.anexos.list.invalidate({ entidadeTipo, entidadeId });
      utils.anexos.countByIds.invalidate();
      toast.success("Arquivo enviado com sucesso!");
      setUploading(false);
      setUploadProgress(0);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar arquivo");
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const deleteMutation = trpc.anexos.delete.useMutation({
    onSuccess: () => {
      utils.anexos.list.invalidate({ entidadeTipo, entidadeId });
      utils.anexos.countByIds.invalidate();
      toast.success("Anexo removido");
    },
    onError: () => toast.error("Erro ao remover anexo"),
  });

  const handleFile = async (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      toast.error(`Tipo de arquivo não permitido: ${ext}`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setUploadProgress(50);
      uploadMutation.mutate({
        entidadeTipo,
        entidadeId,
        nomeOriginal: file.name,
        mimeType: file.type || "application/octet-stream",
        tamanho: file.size,
        base64,
      });
      setUploadProgress(90);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            Anexos — {entidadeNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de upload */}
          {user && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-medium text-foreground">Clique ou arraste um arquivo aqui</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, ZIP, DOC, XLS, TXT, imagens — máx. {MAX_SIZE_MB}MB
                  </p>
                  <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">
                    <AlertCircle className="h-2.5 w-2.5 mr-1" />
                    .exe e .bat bloqueados
                  </Badge>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Lista de anexos */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !anexos || anexos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum anexo ainda</p>
              </div>
            ) : (
              anexos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group"
                >
                  <div className="shrink-0">{getFileIcon(a.mimeType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.nomeOriginal}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(a.tamanho)} · {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                      asChild
                    >
                      <a href={a.s3Url} target="_blank" rel="noopener noreferrer" download={a.nomeOriginal}>
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {user && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm("Remover este anexo?")) deleteMutation.mutate({ id: a.id });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
