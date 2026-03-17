import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const instrumentos = mysqlTable("instrumentos", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 64 }).notNull(),
  tipo: varchar("tipo", { length: 128 }).notNull(),
  partesEnvolvidas: text("partesEnvolvidas").notNull(),
  objeto: text("objeto").notNull(),
  dataInicio: bigint("dataInicio", { mode: "number" }),
  dataTermino: bigint("dataTermino", { mode: "number" }),
  processoSei: varchar("processoSei", { length: 128 }),
  diretoria: varchar("diretoria", { length: 256 }).notNull(),
  arquivoOrigem: varchar("arquivoOrigem", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Instrumento = typeof instrumentos.$inferSelect;
export type InsertInstrumento = typeof instrumentos.$inferInsert;

export const termosAditivos = mysqlTable("termos_aditivos", {
  id: int("id").autoincrement().primaryKey(),
  instrumentoId: int("instrumentoId").notNull(),
  descricao: text("descricao").notNull(),
  dataAditivo: bigint("dataAditivo", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TermoAditivo = typeof termosAditivos.$inferSelect;
export type InsertTermoAditivo = typeof termosAditivos.$inferInsert;

export const vpnConexoes = mysqlTable("vpn_conexoes", {
  id: int("id").autoincrement().primaryKey(),
  nomeUsuario: varchar("nomeUsuario", { length: 128 }).notNull(),
  matricula: varchar("matricula", { length: 32 }),
  diretoria: varchar("diretoria", { length: 256 }),
  servidor: varchar("servidor", { length: 128 }).notNull(),
  ipAtribuido: varchar("ipAtribuido", { length: 45 }),
  status: mysqlEnum("status", ["conectado", "desconectado", "bloqueado"]).default("desconectado").notNull(),
  ultimaConexao: bigint("ultimaConexao", { mode: "number" }),
  bytesEnviados: bigint("bytesEnviados", { mode: "number" }).default(0),
  bytesRecebidos: bigint("bytesRecebidos", { mode: "number" }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VpnConexao = typeof vpnConexoes.$inferSelect;
export type InsertVpnConexao = typeof vpnConexoes.$inferInsert;

// Tabela de anexos — usada tanto por instrumentos quanto por VPN
export const anexos = mysqlTable("anexos", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo de entidade: "instrumento" ou "vpn"
  entidadeTipo: mysqlEnum("entidadeTipo", ["instrumento", "vpn"]).notNull(),
  entidadeId: int("entidadeId").notNull(),
  nomeOriginal: varchar("nomeOriginal", { length: 512 }).notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  tamanho: bigint("tamanho", { mode: "number" }).notNull(),
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  s3Url: text("s3Url").notNull(),
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Anexo = typeof anexos.$inferSelect;
export type InsertAnexo = typeof anexos.$inferInsert;
