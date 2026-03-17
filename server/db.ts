import { eq, like, and, sql, desc, asc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  instrumentos, InsertInstrumento, Instrumento,
  termosAditivos, InsertTermoAditivo,
  vpnConexoes, InsertVpnConexao,
  anexos, InsertAnexo,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

function formatDateUtil(ts: number | null): string {
  if (!ts) return "Não definida";
  return new Date(ts).toLocaleDateString("pt-BR");
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== INSTRUMENTOS ====================
export async function listInstrumentos(filters?: {
  diretoria?: string;
  tipo?: string;
  search?: string;
  statusVigencia?: string; // "vigente" | "proximo" | "vencido" | "sem_data"
  dataInicioMin?: number;
  dataInicioMax?: number;
  dataTerminoMin?: number;
  dataTerminoMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const now = Date.now();
  const threshold180 = now + 180 * 24 * 60 * 60 * 1000;

  const conditions = [];
  if (filters?.diretoria) conditions.push(eq(instrumentos.diretoria, filters.diretoria));
  if (filters?.tipo) conditions.push(eq(instrumentos.tipo, filters.tipo));
  if (filters?.search) conditions.push(
    sql`(${instrumentos.numero} LIKE ${`%${filters.search}%`} OR ${instrumentos.partesEnvolvidas} LIKE ${`%${filters.search}%`} OR ${instrumentos.objeto} LIKE ${`%${filters.search}%`} OR ${instrumentos.processoSei} LIKE ${`%${filters.search}%`})`
  );

  // Filtro por status de vigência
  if (filters?.statusVigencia === "vigente") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} > ${threshold180}`);
  } else if (filters?.statusVigencia === "proximo") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} > ${now} AND ${instrumentos.dataTermino} <= ${threshold180}`);
  } else if (filters?.statusVigencia === "vencido") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} <= ${now}`);
  } else if (filters?.statusVigencia === "sem_data") {
    conditions.push(sql`${instrumentos.dataTermino} IS NULL`);
  }

  // Filtros por intervalo de datas
  if (filters?.dataInicioMin) conditions.push(sql`${instrumentos.dataInicio} >= ${filters.dataInicioMin}`);
  if (filters?.dataInicioMax) conditions.push(sql`${instrumentos.dataInicio} <= ${filters.dataInicioMax}`);
  if (filters?.dataTerminoMin) conditions.push(sql`${instrumentos.dataTermino} >= ${filters.dataTerminoMin}`);
  if (filters?.dataTerminoMax) conditions.push(sql`${instrumentos.dataTermino} <= ${filters.dataTerminoMax}`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  // Sort
  const sortCol = filters?.sortBy === "numero" ? instrumentos.numero
    : filters?.sortBy === "tipo" ? instrumentos.tipo
    : filters?.sortBy === "diretoria" ? instrumentos.diretoria
    : filters?.sortBy === "dataInicio" ? instrumentos.dataInicio
    : filters?.sortBy === "dataTermino" ? instrumentos.dataTermino
    : instrumentos.id;
  const orderFn = filters?.sortOrder === "asc" ? asc : desc;

  const [items, totalResult] = await Promise.all([
    db.select().from(instrumentos).where(where).orderBy(orderFn(sortCol)).limit(pageSize).offset(offset),
    db.select({ count: count() }).from(instrumentos).where(where),
  ]);

  return { items, total: totalResult[0]?.count ?? 0 };
}

export async function getInstrumentoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(instrumentos).where(eq(instrumentos.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createInstrumento(data: InsertInstrumento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(instrumentos).values(data);
  return result[0].insertId;
}

export async function updateInstrumento(id: number, data: Partial<InsertInstrumento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(instrumentos).set(data).where(eq(instrumentos.id, id));
}

export async function deleteInstrumento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(termosAditivos).where(eq(termosAditivos.instrumentoId, id));
  await db.delete(instrumentos).where(eq(instrumentos.id, id));
}

export async function getAllInstrumentosForExport(filters?: {
  diretoria?: string;
  tipo?: string;
  search?: string;
  statusVigencia?: string;
  dataInicioMin?: number;
  dataInicioMax?: number;
  dataTerminoMin?: number;
  dataTerminoMax?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const now = Date.now();
  const threshold180 = now + 180 * 24 * 60 * 60 * 1000;

  const conditions = [];
  if (filters?.diretoria) conditions.push(eq(instrumentos.diretoria, filters.diretoria));
  if (filters?.tipo) conditions.push(eq(instrumentos.tipo, filters.tipo));
  if (filters?.search) conditions.push(
    sql`(${instrumentos.numero} LIKE ${`%${filters.search}%`} OR ${instrumentos.partesEnvolvidas} LIKE ${`%${filters.search}%`} OR ${instrumentos.objeto} LIKE ${`%${filters.search}%`} OR ${instrumentos.processoSei} LIKE ${`%${filters.search}%`})`
  );
  if (filters?.statusVigencia === "vigente") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} > ${threshold180}`);
  } else if (filters?.statusVigencia === "proximo") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} > ${now} AND ${instrumentos.dataTermino} <= ${threshold180}`);
  } else if (filters?.statusVigencia === "vencido") {
    conditions.push(sql`${instrumentos.dataTermino} IS NOT NULL AND ${instrumentos.dataTermino} <= ${now}`);
  } else if (filters?.statusVigencia === "sem_data") {
    conditions.push(sql`${instrumentos.dataTermino} IS NULL`);
  }
  if (filters?.dataInicioMin) conditions.push(sql`${instrumentos.dataInicio} >= ${filters.dataInicioMin}`);
  if (filters?.dataInicioMax) conditions.push(sql`${instrumentos.dataInicio} <= ${filters.dataInicioMax}`);
  if (filters?.dataTerminoMin) conditions.push(sql`${instrumentos.dataTermino} >= ${filters.dataTerminoMin}`);
  if (filters?.dataTerminoMax) conditions.push(sql`${instrumentos.dataTermino} <= ${filters.dataTerminoMax}`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db.select().from(instrumentos).where(where).orderBy(asc(instrumentos.numero));
  return items;
}

export async function getDiretorias() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ diretoria: instrumentos.diretoria }).from(instrumentos).orderBy(asc(instrumentos.diretoria));
  return result.map(r => r.diretoria);
}

export async function getTipos() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ tipo: instrumentos.tipo }).from(instrumentos).orderBy(asc(instrumentos.tipo));
  return result.map(r => r.tipo);
}

export async function getStats() {
  const db = await getDb();
  if (!db) return { total: 0, porDiretoria: [], porTipo: [], porAno: [] };

  const now = Date.now();
  const threshold180 = now + 180 * 24 * 60 * 60 * 1000;

  const [totalResult, porDiretoriaResult, porTipoResult, allItems] = await Promise.all([
    db.select({ count: count() }).from(instrumentos),
    db.selectDistinct({ diretoria: instrumentos.diretoria }).from(instrumentos),
    db.selectDistinct({ tipo: instrumentos.tipo }).from(instrumentos),
    db.select().from(instrumentos),
  ]);

  const porDiretoria = porDiretoriaResult.map(r => {
    const count = allItems.filter(i => i.diretoria === r.diretoria).length;
    return { diretoria: r.diretoria, count };
  });

  const porTipo = porTipoResult.map(r => {
    const count = allItems.filter(i => i.tipo === r.tipo).length;
    return { tipo: r.tipo, count };
  });

  const porAno = allItems
    .filter(i => i.dataInicio)
    .reduce((acc: Record<number, number>, i) => {
      const year = new Date(i.dataInicio!).getFullYear();
      acc[year] = (acc[year] ?? 0) + 1;
      return acc;
    }, {});

  return {
    total: totalResult[0]?.count ?? 0,
    porDiretoria,
    porTipo,
    porAno: Object.entries(porAno).map(([year, count]) => ({ year: parseInt(year), count })),
  };
}

export async function getAlertasVencimento(dias: number) {
  const db = await getDb();
  if (!db) return [];

  const now = Date.now();
  const threshold = now + dias * 24 * 60 * 60 * 1000;

  const items = await db.select().from(instrumentos).orderBy(asc(instrumentos.dataTermino));
  return items.filter(i => i.dataTermino && i.dataTermino <= threshold && i.dataTermino >= now);
}

export async function getTimelineData() {
  const db = await getDb();
  if (!db) return [];

  const items = await db.select().from(instrumentos).where(and(
    sql`${instrumentos.dataInicio} IS NOT NULL`,
    sql`${instrumentos.dataTermino} IS NOT NULL`
  )).orderBy(asc(instrumentos.dataInicio));

  return items.map(i => ({
    id: i.id,
    numero: i.numero,
    tipo: i.tipo,
    dataInicio: i.dataInicio,
    dataTermino: i.dataTermino,
    diretoria: i.diretoria,
  }));
}

// ==================== TERMOS ADITIVOS ====================
export async function getTermosByInstrumentoId(instrumentoId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(termosAditivos).where(eq(termosAditivos.instrumentoId, instrumentoId)).orderBy(asc(termosAditivos.dataAditivo));
  return result;
}

export async function createTermoAditivo(data: InsertTermoAditivo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(termosAditivos).values(data);
  return result[0].insertId;
}

export async function deleteTermoAditivo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(termosAditivos).where(eq(termosAditivos.id, id));
}

// ==================== VPN ====================
export async function listVpnConexoes(filters?: {
  status?: string;
  diretoria?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(vpnConexoes.status, filters.status as any));
  if (filters?.diretoria) conditions.push(eq(vpnConexoes.diretoria, filters.diretoria));
  if (filters?.search) conditions.push(
    sql`(${vpnConexoes.nomeUsuario} LIKE ${`%${filters.search}%`} OR ${vpnConexoes.servidor} LIKE ${`%${filters.search}%`})`
  );

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = await db.select().from(vpnConexoes).where(where).orderBy(asc(vpnConexoes.nomeUsuario));
  return result;
}

export async function getVpnStats() {
  const db = await getDb();
  if (!db) return { total: 0, conectadas: 0, desconectadas: 0 };

  const [totalResult, conectadasResult] = await Promise.all([
    db.select({ count: count() }).from(vpnConexoes),
    db.select({ count: count() }).from(vpnConexoes).where(eq(vpnConexoes.status, "conectado" as any)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const conectadas = conectadasResult[0]?.count ?? 0;

  return { total, conectadas, desconectadas: total - conectadas };
}

export async function getVpnById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(vpnConexoes).where(eq(vpnConexoes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createVpnConexao(data: InsertVpnConexao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vpnConexoes).values(data);
  return result[0].insertId;
}

export async function updateVpnConexao(id: number, data: Partial<InsertVpnConexao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vpnConexoes).set(data).where(eq(vpnConexoes.id, id));
}

export async function deleteVpnConexao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Remove anexos associados
  await db.delete(anexos).where(and(eq(anexos.entidadeTipo, "vpn"), eq(anexos.entidadeId, id)));
  await db.delete(vpnConexoes).where(eq(vpnConexoes.id, id));
}

// ==================== ANEXOS ====================
export async function listAnexos(entidadeTipo: "instrumento" | "vpn", entidadeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(anexos)
    .where(and(eq(anexos.entidadeTipo, entidadeTipo), eq(anexos.entidadeId, entidadeId)))
    .orderBy(asc(anexos.createdAt));
}

export async function createAnexo(data: InsertAnexo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(anexos).values(data);
  return result[0].insertId;
}

export async function deleteAnexo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(anexos).where(eq(anexos.id, id)).limit(1);
  const anexo = result[0];
  await db.delete(anexos).where(eq(anexos.id, id));
  return anexo; // retorna para poder deletar do S3
}

export async function countAnexosByEntidade(entidadeTipo: "instrumento" | "vpn", entidadeIds: number[]) {
  const db = await getDb();
  if (!db) return {};
  if (entidadeIds.length === 0) return {};
  const result = await db.select({
    entidadeId: anexos.entidadeId,
    count: count(),
  }).from(anexos)
    .where(and(
      eq(anexos.entidadeTipo, entidadeTipo),
      sql`${anexos.entidadeId} IN (${sql.join(entidadeIds.map(id => sql`${id}`), sql`, `)})`
    ))
    .groupBy(anexos.entidadeId);
  return Object.fromEntries(result.map(r => [r.entidadeId, r.count]));
}
