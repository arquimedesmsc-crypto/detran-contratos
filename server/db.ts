import { eq, like, and, sql, desc, asc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  instrumentos, InsertInstrumento, Instrumento,
  termosAditivos, InsertTermoAditivo,
  vpnConexoes, InsertVpnConexao,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (filters?.diretoria) conditions.push(eq(instrumentos.diretoria, filters.diretoria));
  if (filters?.tipo) conditions.push(eq(instrumentos.tipo, filters.tipo));
  if (filters?.search) conditions.push(
    sql`(${instrumentos.numero} LIKE ${`%${filters.search}%`} OR ${instrumentos.partesEnvolvidas} LIKE ${`%${filters.search}%`} OR ${instrumentos.objeto} LIKE ${`%${filters.search}%`} OR ${instrumentos.processoSei} LIKE ${`%${filters.search}%`})`
  );

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
    db.select({ diretoria: instrumentos.diretoria, count: count() }).from(instrumentos).groupBy(instrumentos.diretoria),
    db.select({ tipo: instrumentos.tipo, count: count() }).from(instrumentos).groupBy(instrumentos.tipo),
    db.select().from(instrumentos),
  ]);

  // Status counts
  let vigentes = 0, proximoVencimento = 0, vencidos = 0, semData = 0;
  const porAnoMap: Record<string, number> = {};
  let totalDias = 0, countComDatas = 0;

  for (const item of allItems) {
    if (!item.dataTermino) { semData++; continue; }
    if (item.dataTermino < now) vencidos++;
    else if (item.dataTermino < threshold180) proximoVencimento++;
    else vigentes++;

    if (item.dataInicio) {
      const year = new Date(item.dataInicio).getFullYear().toString();
      porAnoMap[year] = (porAnoMap[year] || 0) + 1;
      totalDias += (item.dataTermino - item.dataInicio) / (1000 * 60 * 60 * 24);
      countComDatas++;
    }
  }

  return {
    total: totalResult[0]?.count ?? 0,
    vigentes,
    proximoVencimento,
    vencidos,
    semData,
    prazoMedioDias: countComDatas > 0 ? Math.round(totalDias / countComDatas) : 0,
    porDiretoria: porDiretoriaResult,
    porTipo: porTipoResult,
    porAno: Object.entries(porAnoMap).map(([ano, count]) => ({ ano, count })).sort((a, b) => a.ano.localeCompare(b.ano)),
  };
}

export async function getAlertasVencimento(diasLimite: number = 180) {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  const threshold = now + diasLimite * 24 * 60 * 60 * 1000;
  const allItems = await db.select().from(instrumentos)
    .where(and(
      sql`${instrumentos.dataTermino} IS NOT NULL`,
      sql`${instrumentos.dataTermino} > ${now}`,
      sql`${instrumentos.dataTermino} < ${threshold}`
    ))
    .orderBy(asc(instrumentos.dataTermino));
  return allItems;
}

export async function getTimelineData() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(instrumentos)
    .where(sql`${instrumentos.dataInicio} IS NOT NULL AND ${instrumentos.dataTermino} IS NOT NULL`)
    .orderBy(asc(instrumentos.dataInicio));
}

// ==================== TERMOS ADITIVOS ====================
export async function getTermosByInstrumentoId(instrumentoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(termosAditivos).where(eq(termosAditivos.instrumentoId, instrumentoId)).orderBy(desc(termosAditivos.createdAt));
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
  if (filters?.status) conditions.push(sql`${vpnConexoes.status} = ${filters.status}`);
  if (filters?.diretoria) conditions.push(eq(vpnConexoes.diretoria, filters.diretoria));
  if (filters?.search) conditions.push(
    sql`(${vpnConexoes.nomeUsuario} LIKE ${`%${filters.search}%`} OR ${vpnConexoes.matricula} LIKE ${`%${filters.search}%`})`
  );
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(vpnConexoes).where(where).orderBy(desc(vpnConexoes.updatedAt));
}

export async function getVpnStats() {
  const db = await getDb();
  if (!db) return { total: 0, conectados: 0, desconectados: 0, bloqueados: 0, porDiretoria: [] };
  const all = await db.select().from(vpnConexoes);
  let conectados = 0, desconectados = 0, bloqueados = 0;
  const dirMap: Record<string, number> = {};
  for (const c of all) {
    if (c.status === "conectado") conectados++;
    else if (c.status === "desconectado") desconectados++;
    else bloqueados++;
    const d = c.diretoria || "Não definida";
    dirMap[d] = (dirMap[d] || 0) + 1;
  }
  return {
    total: all.length,
    conectados,
    desconectados,
    bloqueados,
    porDiretoria: Object.entries(dirMap).map(([diretoria, count]) => ({ diretoria, count })),
  };
}
