import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  listInstrumentos: vi.fn(),
  getInstrumentoById: vi.fn(),
  createInstrumento: vi.fn(),
  updateInstrumento: vi.fn(),
  deleteInstrumento: vi.fn(),
  getDiretorias: vi.fn(),
  getTipos: vi.fn(),
  getStats: vi.fn(),
  getAlertasVencimento: vi.fn(),
  getTimelineData: vi.fn(),
  getTermosByInstrumentoId: vi.fn(),
  createTermoAditivo: vi.fn(),
  deleteTermoAditivo: vi.fn(),
  listVpnConexoes: vi.fn(),
  getVpnStats: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@detran.rj.gov.br",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("instrumentos.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns paginated list of instrumentos", async () => {
    const mockData = {
      items: [
        { id: 1, numero: "001/2024", tipo: "Contrato", partesEnvolvidas: "DETRAN e Empresa X", objeto: "Serviço de TI", dataInicio: 1704067200000, dataTermino: 1735689600000, processoSei: "SEI-001", diretoria: "Diretoria de TI", arquivoOrigem: null, createdAt: new Date(), updatedAt: new Date() },
      ],
      total: 1,
    };
    vi.mocked(db.listInstrumentos).mockResolvedValue(mockData);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.instrumentos.list({ page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].numero).toBe("001/2024");
  });

  it("passes filters to db query", async () => {
    vi.mocked(db.listInstrumentos).mockResolvedValue({ items: [], total: 0 });

    const caller = appRouter.createCaller(createPublicContext());
    await caller.instrumentos.list({
      diretoria: "Diretoria de TI",
      tipo: "Contrato",
      search: "test",
      page: 2,
      pageSize: 10,
      sortBy: "numero",
      sortOrder: "asc",
    });

    expect(db.listInstrumentos).toHaveBeenCalledWith({
      diretoria: "Diretoria de TI",
      tipo: "Contrato",
      search: "test",
      page: 2,
      pageSize: 10,
      sortBy: "numero",
      sortOrder: "asc",
    });
  });
});

describe("instrumentos.getById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns instrumento by id", async () => {
    const mockInstrumento = {
      id: 1, numero: "001/2024", tipo: "Contrato", partesEnvolvidas: "DETRAN e Empresa X",
      objeto: "Serviço de TI", dataInicio: 1704067200000, dataTermino: 1735689600000,
      processoSei: "SEI-001", diretoria: "Diretoria de TI", arquivoOrigem: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    vi.mocked(db.getInstrumentoById).mockResolvedValue(mockInstrumento);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.instrumentos.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.numero).toBe("001/2024");
  });

  it("returns null for non-existent id", async () => {
    vi.mocked(db.getInstrumentoById).mockResolvedValue(null);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.instrumentos.getById({ id: 999 });

    expect(result).toBeNull();
  });
});

describe("instrumentos.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates instrumento when authenticated", async () => {
    vi.mocked(db.createInstrumento).mockResolvedValue(42);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.instrumentos.create({
      numero: "002/2024",
      tipo: "Convênio",
      partesEnvolvidas: "DETRAN e Município",
      objeto: "Instalação de posto",
      diretoria: "Diretoria de Identificação Civil",
      dataInicio: 1704067200000,
      dataTermino: 1735689600000,
    });

    expect(result).toBe(42);
    expect(db.createInstrumento).toHaveBeenCalledOnce();
  });

  it("rejects unauthenticated create", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.instrumentos.create({
        numero: "002/2024",
        tipo: "Convênio",
        partesEnvolvidas: "DETRAN e Município",
        objeto: "Instalação de posto",
        diretoria: "Diretoria de Identificação Civil",
      })
    ).rejects.toThrow();
  });
});

describe("instrumentos.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates instrumento when authenticated", async () => {
    vi.mocked(db.updateInstrumento).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAuthContext());
    await caller.instrumentos.update({ id: 1, numero: "001/2024-A" });

    expect(db.updateInstrumento).toHaveBeenCalledWith(1, { numero: "001/2024-A" });
  });
});

describe("instrumentos.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes instrumento when authenticated", async () => {
    vi.mocked(db.deleteInstrumento).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAuthContext());
    await caller.instrumentos.delete({ id: 1 });

    expect(db.deleteInstrumento).toHaveBeenCalledWith(1);
  });
});

describe("instrumentos.stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns statistics", async () => {
    const mockStats = {
      total: 57,
      vigentes: 13,
      proximoVencimento: 2,
      vencidos: 6,
      semData: 36,
      prazoMedioDias: 1460,
      porDiretoria: [{ diretoria: "Diretoria de Identificação Civil", count: 39 }],
      porTipo: [{ tipo: "Convênio", count: 30 }],
      porAno: [{ ano: "2023", count: 15 }],
    };
    vi.mocked(db.getStats).mockResolvedValue(mockStats);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.instrumentos.stats();

    expect(result.total).toBe(57);
    expect(result.vigentes).toBe(13);
    expect(result.porDiretoria).toHaveLength(1);
  });
});

describe("instrumentos.alertas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns alertas with default 180 days", async () => {
    const mockAlertas = [
      { id: 1, numero: "010/2023", tipo: "Convênio", partesEnvolvidas: "DETRAN e Vassouras",
        objeto: "Posto", dataInicio: 1704067200000, dataTermino: Date.now() + 90 * 86400000,
        processoSei: null, diretoria: "Dir", arquivoOrigem: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(db.getAlertasVencimento).mockResolvedValue(mockAlertas);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.instrumentos.alertas({ dias: 180 });

    expect(result).toHaveLength(1);
    expect(db.getAlertasVencimento).toHaveBeenCalledWith(180);
  });
});

describe("termos.byInstrumento", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns termos for instrumento", async () => {
    const mockTermos = [
      { id: 1, instrumentoId: 1, descricao: "Primeiro Aditivo", dataAditivo: 1704067200000, createdAt: new Date() },
    ];
    vi.mocked(db.getTermosByInstrumentoId).mockResolvedValue(mockTermos);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.termos.byInstrumento({ instrumentoId: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].descricao).toBe("Primeiro Aditivo");
  });
});

describe("termos.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates termo aditivo when authenticated", async () => {
    vi.mocked(db.createTermoAditivo).mockResolvedValue(5);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.termos.create({
      instrumentoId: 1,
      descricao: "Segundo Aditivo - Prorrogação",
      dataAditivo: 1704067200000,
    });

    expect(result).toBe(5);
  });
});

describe("vpn.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns vpn connections", async () => {
    const mockConexoes = [
      { id: 1, nomeUsuario: "Carlos Silva", matricula: "DET-001", diretoria: "Dir TI",
        servidor: "vpn-srv-01", ipAtribuido: "10.0.1.1", status: "conectado" as const,
        ultimaConexao: Date.now(), bytesEnviados: 1000, bytesRecebidos: 5000,
        createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(db.listVpnConexoes).mockResolvedValue(mockConexoes);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.vpn.list();

    expect(result).toHaveLength(1);
    expect(result[0].nomeUsuario).toBe("Carlos Silva");
  });
});

describe("vpn.stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns vpn statistics", async () => {
    const mockStats = {
      total: 12,
      conectados: 7,
      desconectados: 4,
      bloqueados: 1,
      porDiretoria: [{ diretoria: "Dir TI", count: 3 }],
    };
    vi.mocked(db.getVpnStats).mockResolvedValue(mockStats);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.vpn.stats();

    expect(result.total).toBe(12);
    expect(result.conectados).toBe(7);
  });
});
