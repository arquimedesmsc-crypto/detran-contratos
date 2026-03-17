import { useEffect, useState } from "react";

// Logo HQ gerada com nano banana
const LOGO_HQ_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-d-hq-dZzWBJ829VhnMFwpgVHjyS.png";

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number; // ms mínimo de exibição
}

export default function SplashScreen({
  onFinish,
  minDuration = 2200,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Fase 1: logo entra (400ms)
    const t1 = setTimeout(() => setPhase("hold"), 400);

    // Fase 2: hold — barra de progresso corre (minDuration - 400 - 500)
    const holdDuration = minDuration - 400 - 500;
    const t2 = setTimeout(() => setPhase("exit"), 400 + holdDuration);

    // Fase 3: exit fade-out (500ms) → chama onFinish
    const t3 = setTimeout(() => onFinish(), minDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [minDuration, onFinish]);

  const progressDuration = minDuration - 400 - 500;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "#ffffff",
        transition: "opacity 500ms ease-in-out",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Decoração de fundo — círculos suaves */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: -120,
            right: -100,
            background:
              "radial-gradient(circle, rgba(26,115,196,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            bottom: -80,
            left: -80,
            background:
              "radial-gradient(circle, rgba(27,138,90,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            bottom: 80,
            right: 60,
            background:
              "radial-gradient(circle, rgba(26,115,196,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Conteúdo central */}
      <div
        className="relative flex flex-col items-center gap-6"
        style={{
          transform:
            phase === "enter" ? "translateY(24px) scale(0.92)" : "translateY(0) scale(1)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out",
        }}
      >
        {/* Logo container com sombra suave */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow:
              "0 8px 40px rgba(26,115,196,0.18), 0 2px 12px rgba(27,138,90,0.12)",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={LOGO_HQ_URL}
            alt="DETRAN-RJ"
            onLoad={() => setLogoLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: logoLoaded ? 1 : 0,
              transition: "opacity 300ms ease",
            }}
          />
          {/* Placeholder enquanto carrega */}
          {!logoLoaded && (
            <div
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 28,
                background: "linear-gradient(135deg, #e8f4fd, #e8f8f0)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {/* Textos */}
        <div className="text-center space-y-1">
          <h1
            className="font-bold tracking-tight"
            style={{
              fontSize: 28,
              background: "linear-gradient(135deg, #1B4F72, #1A73C4, #1B8A5A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            DETRAN-RJ
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#6B7280",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Gestão de Instrumentos
          </p>
        </div>

        {/* Barra de progresso animada */}
        <div
          style={{
            width: 160,
            height: 3,
            borderRadius: 99,
            background: "#E5E7EB",
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #1A73C4, #1B8A5A)",
              width: phase === "hold" || phase === "exit" ? "100%" : "0%",
              transition:
                phase === "hold"
                  ? `width ${progressDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : "none",
            }}
          />
        </div>

        {/* Pontinhos de carregamento */}
        <div className="flex items-center gap-1.5" style={{ marginTop: -4 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  i === 0
                    ? "#1A73C4"
                    : i === 1
                      ? "#1B8A5A"
                      : "#1A73C4",
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: phase === "hold" ? 1 : 0,
                transition: "opacity 300ms ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div
        className="absolute bottom-8 text-center"
        style={{
          opacity: phase === "hold" ? 0.45 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            letterSpacing: "0.05em",
          }}
        >
          Departamento de Trânsito do Estado do Rio de Janeiro
        </p>
      </div>

      {/* Keyframes injetados via style tag */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
