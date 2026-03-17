import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Shield,
  Wifi,
  WifiOff,
  Zap,
  Bell,
  Lock,
  ArrowDown,
  Chrome,
  MonitorSmartphone,
  Loader2,
  ExternalLink,
  Info,
  X,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const LOGO_D_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-d_72599473.jpg";

const FEATURES = [
  {
    icon: Zap,
    title: "Acesso Rápido",
    description: "Abra o sistema direto da tela inicial, sem precisar do navegador",
    gradient: "from-[#1A73C4] to-[#2196F3]",
  },
  {
    icon: WifiOff,
    title: "Funciona Offline",
    description: "Consulte dados mesmo sem conexão com a internet",
    gradient: "from-[#1B8A5A] to-[#4CAF50]",
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "Receba alertas sobre vencimentos e atualizações importantes",
    gradient: "from-[#E6A817] to-[#F5C542]",
  },
  {
    icon: Lock,
    title: "Seguro",
    description: "Mesmo nível de segurança do sistema web, com autenticação protegida",
    gradient: "from-[#1B4F72] to-[#1A73C4]",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Clique em Instalar",
    description: 'Toque no botão "Instalar Aplicativo" abaixo',
  },
  {
    number: 2,
    title: "Confirme a Instalação",
    description: "No banner que aparecer, confirme tocando em Instalar",
  },
  {
    number: 3,
    title: "Pronto!",
    description: "O app aparecerá na sua tela inicial automaticamente",
  },
];

export default function DownloadPage() {
  const { canInstall, isInstalled, isInstalling, install } = usePWAInstall();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  // Show install banner automatically after 1.5s
  useEffect(() => {
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstallClick = async () => {
    if (canInstall) {
      setShowInstallDialog(true);
    } else if (!isInstalled) {
      setShowManualInstructions(true);
    }
  };

  const handleConfirmInstall = async () => {
    setShowInstallDialog(false);
    await install();
  };

  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isChrome = /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Auto Banner de Instalação */}
      {showBanner && !isInstalled && (
        <div
          className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-500"
          style={{
            background: "linear-gradient(135deg, #1B4F72 0%, #1A73C4 50%, #1B8A5A 100%)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
              <img src={LOGO_D_URL} alt="DETRAN" className="h-8 w-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Instalar DETRAN-RJ</p>
              <p className="text-white/70 text-xs truncate">
                Adicione o app na sua tela inicial
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 text-white font-semibold shadow-lg h-8 text-xs"
              style={{ background: "linear-gradient(135deg, #1B8A5A, #2E9D6A)" }}
              onClick={handleConfirmInstall}
            >
              Instalar
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/60 hover:text-white p-1 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header com degradê DETRAN */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B4F72 0%, #1A73C4 40%, #1B8A5A 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white/15 backdrop-blur-sm mb-5 shadow-xl border border-white/20">
            <img
              src={LOGO_D_URL}
              alt="DETRAN-RJ"
              className="h-14 w-14 object-contain rounded-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            DETRAN-RJ
          </h1>
          <p className="text-lg text-white/80 font-medium mb-1">
            Gestão de Instrumentos
          </p>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Instale o aplicativo no seu dispositivo para acesso rápido e direto da tela
            inicial
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <Badge className="bg-white/15 text-white border-0 text-xs px-3 py-1">
              <Smartphone className="h-3 w-3 mr-1.5" />
              Android
            </Badge>
            <Badge className="bg-white/15 text-white border-0 text-xs px-3 py-1">
              <MonitorSmartphone className="h-3 w-3 mr-1.5" />
              Desktop
            </Badge>
          </div>
        </div>
      </div>

      {/* Status de Instalação */}
      {isInstalled && (
        <Card
          className="border-0 shadow-lg overflow-hidden"
          style={{ borderLeft: "4px solid #1B8A5A" }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1B8A5A, #4CAF50)",
                }}
              >
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Aplicativo Instalado
                </p>
                <p className="text-sm text-muted-foreground">
                  O DETRAN-RJ já está instalado no seu dispositivo. Acesse pela tela
                  inicial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Principal de Instalação */}
      {!isInstalled && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mx-auto"
                style={{
                  background: "linear-gradient(135deg, #1A73C4, #1B8A5A)",
                }}
              >
                <Download className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Instalar Aplicativo
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {canInstall
                    ? "Seu dispositivo suporta a instalação. Clique abaixo para adicionar o app."
                    : "Siga as instruções abaixo para instalar o aplicativo no seu dispositivo."}
                </p>
              </div>
              <Button
                size="lg"
                className="gap-3 text-white font-semibold shadow-xl px-8 h-12 text-base rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #1B8A5A, #2E9D6A)",
                }}
                onClick={handleInstallClick}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Instalando...
                  </>
                ) : isInstalled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Já Instalado
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Instalar Agora
                  </>
                )}
              </Button>
              {!canInstall && !isInstalled && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Info className="h-3 w-3" />
                  {isIOS
                    ? 'No iPhone, use o Safari e toque em "Compartilhar" → "Adicionar à Tela de Início"'
                    : "Use o Google Chrome para melhor compatibilidade"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos do App */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1A73C4, #1B8A5A)",
            }}
          >
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          Recursos do Aplicativo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Como Instalar - Passo a Passo */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div
          className="px-5 py-4"
          style={{
            background:
              "linear-gradient(90deg, rgba(26,115,196,0.08) 0%, rgba(27,138,90,0.08) 100%)",
          }}
        >
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1A73C4, #1B8A5A)",
              }}
            >
              <ArrowDown className="h-3.5 w-3.5 text-white" />
            </div>
            Como Instalar
          </h2>
        </div>
        <CardContent className="p-5">
          <div className="space-y-0">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{
                      background:
                        idx === 0
                          ? "linear-gradient(135deg, #1A73C4, #2196F3)"
                          : idx === 1
                            ? "linear-gradient(135deg, #1B8A5A, #4CAF50)"
                            : "linear-gradient(135deg, #E6A817, #F5C542)",
                    }}
                  >
                    {step.number}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-0.5 h-8 bg-gradient-to-b from-muted-foreground/20 to-transparent my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="font-semibold text-sm text-foreground">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requisitos */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1A73C4, #1B8A5A)",
              }}
            >
              <Shield className="h-3 w-3 text-white" />
            </div>
            Requisitos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Chrome className="h-4 w-4 text-[#1A73C4]" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Google Chrome
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Versão 67 ou superior
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Smartphone className="h-4 w-4 text-[#1B8A5A]" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Android 5.0+
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Lollipop ou superior
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Wifi className="h-4 w-4 text-[#E6A817]" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Conexão Internet
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Para primeira instalação
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">
          Aplicativo PWA (Progressive Web App) — Leve, seguro e sempre atualizado
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          DETRAN-RJ — Departamento de Trânsito do Estado do Rio de Janeiro
        </p>
      </div>

      {/* Dialog de Confirmação de Instalação */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #1B4F72, #1A73C4, #1B8A5A)",
                }}
              >
                <img
                  src={LOGO_D_URL}
                  alt="DETRAN"
                  className="h-8 w-8 object-contain rounded-lg"
                />
              </div>
              <div>
                <DialogTitle className="text-left">
                  Instalar DETRAN-RJ?
                </DialogTitle>
                <DialogDescription className="text-left text-xs">
                  Gestão de Instrumentos
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              O aplicativo será adicionado à sua tela inicial para acesso rápido.
              Não ocupa espaço significativo no dispositivo.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Acesso rápido",
                "Funciona offline",
                "Sempre atualizado",
                "Seguro",
              ].map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-[#1B8A5A]" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowInstallDialog(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmInstall}
              className="gap-2 text-white font-semibold rounded-xl"
              style={{
                background: "linear-gradient(135deg, #1B8A5A, #2E9D6A)",
              }}
            >
              <Download className="h-4 w-4" />
              Instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Instruções Manuais */}
      <Dialog
        open={showManualInstructions}
        onOpenChange={setShowManualInstructions}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[#1A73C4]" />
              Instruções de Instalação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  No iPhone / iPad (Safari):
                </p>
                <div className="space-y-2">
                  {[
                    "Abra este site no Safari",
                    'Toque no ícone de Compartilhar (quadrado com seta)',
                    'Role para baixo e toque em "Adicionar à Tela de Início"',
                    'Toque em "Adicionar" para confirmar',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "#1A73C4" }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  No Android (Chrome):
                </p>
                <div className="space-y-2">
                  {[
                    "Abra este site no Google Chrome",
                    "Toque no menu (3 pontos) no canto superior direito",
                    'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"',
                    'Toque em "Instalar" para confirmar',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "#1B8A5A" }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 rounded-xl bg-muted/50 flex items-start gap-2">
              <Info className="h-4 w-4 text-[#E6A817] shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                O navegador precisa suportar PWA. Recomendamos o Google Chrome
                para a melhor experiência.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowManualInstructions(false)}
              className="text-white font-semibold rounded-xl"
              style={{
                background: "linear-gradient(135deg, #1A73C4, #1B8A5A)",
              }}
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
