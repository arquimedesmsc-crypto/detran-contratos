import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  listInstrumentos, getInstrumentoById, createInstrumento, updateInstrumento, deleteInstrumento,
  getDiretorias, getTipos, getStats, getAlertasVencimento, getTimelineData,
  getTermosByInstrumentoId, createTermoAditivo, deleteTermoAditivo,
  listVpnConexoes, getVpnStats, getAllInstrumentosForExport,
  getVpnById, createVpnConexao, updateVpnConexao, deleteVpnConexao,
  listAnexos, createAnexo, deleteAnexo, countAnexosByEntidade,
} from "./db";
import { storagePut, storageDelete } from "./storage";

// Tipos de arquivo permitidos (exceto exe e bat)
const ALLOWED_MIME_TYPES = [
  "application/zip", "application/x-zip-compressed", "application/x-zip",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/vnd.rar", "application/x-rar-compressed",
  "application/x-7z-compressed",
];

const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".com", ".msi", ".sh", ".ps1"];

function isAllowedFile(filename: string, mimeType: string): boolean {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType) || mimeType.startsWith("text/");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  instrumentos: router({
    list: publicProcedure.input(z.object({
      diretoria: z.string().optional(),
      tipo: z.string().optional(),
      search: z.string().optional(),
      statusVigencia: z.string().optional(),
      dataInicioMin: z.number().optional(),
      dataInicioMax: z.number().optional(),
      dataTerminoMin: z.number().optional(),
      dataTerminoMax: z.number().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }).optional()).query(({ input }) => listInstrumentos(input ?? undefined)),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getInstrumentoById(input.id)),

    create: protectedProcedure.input(z.object({
      numero: z.string().min(1),
      tipo: z.string().min(1),
      partesEnvolvidas: z.string().min(1),
      objeto: z.string().min(1),
      dataInicio: z.number().nullable().optional(),
      dataTermino: z.number().nullable().optional(),
      processoSei: z.string().nullable().optional(),
      diretoria: z.string().min(1),
      arquivoOrigem: z.string().nullable().optional(),
    })).mutation(({ input }) => createInstrumento(input)),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      numero: z.string().min(1).optional(),
      tipo: z.string().min(1).optional(),
      partesEnvolvidas: z.string().min(1).optional(),
      objeto: z.string().min(1).optional(),
      dataInicio: z.number().nullable().optional(),
      dataTermino: z.number().nullable().optional(),
      processoSei: z.string().nullable().optional(),
      diretoria: z.string().min(1).optional(),
      arquivoOrigem: z.string().nullable().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateInstrumento(id, data);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteInstrumento(input.id)),

    diretorias: publicProcedure.query(() => getDiretorias()),
    tipos: publicProcedure.query(() => getTipos()),
    stats: publicProcedure.query(() => getStats()),
    alertas: publicProcedure.input(z.object({ dias: z.number().default(180) }).optional()).query(({ input }) => getAlertasVencimento(input?.dias ?? 180)),
    timeline: publicProcedure.query(() => getTimelineData()),
    export: publicProcedure.input(z.object({
      diretoria: z.string().optional(),
      tipo: z.string().optional(),
      search: z.string().optional(),
      statusVigencia: z.string().optional(),
      dataInicioMin: z.number().optional(),
      dataInicioMax: z.number().optional(),
      dataTerminoMin: z.number().optional(),
      dataTerminoMax: z.number().optional(),
    }).optional()).query(({ input }) => getAllInstrumentosForExport(input ?? undefined)),
  }),

  termos: router({
    byInstrumento: publicProcedure.input(z.object({ instrumentoId: z.number() })).query(({ input }) => getTermosByInstrumentoId(input.instrumentoId)),
    create: protectedProcedure.input(z.object({
      instrumentoId: z.number(),
      descricao: z.string().min(1),
      dataAditivo: z.number().nullable().optional(),
    })).mutation(({ input }) => createTermoAditivo(input)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTermoAditivo(input.id)),
  }),

  vpn: router({
    list: publicProcedure.input(z.object({
      status: z.string().optional(),
      diretoria: z.string().optional(),
      search: z.string().optional(),
    }).optional()).query(({ input }) => listVpnConexoes(input ?? undefined)),

    stats: publicProcedure.query(() => getVpnStats()),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getVpnById(input.id)),

    create: protectedProcedure.input(z.object({
      nomeUsuario: z.string().min(1),
      matricula: z.string().nullable().optional(),
      diretoria: z.string().nullable().optional(),
      servidor: z.string().min(1),
      ipAtribuido: z.string().nullable().optional(),
      status: z.enum(["conectado", "desconectado", "bloqueado"]).default("desconectado"),
      ultimaConexao: z.number().nullable().optional(),
      bytesEnviados: z.number().nullable().optional(),
      bytesRecebidos: z.number().nullable().optional(),
    })).mutation(({ input }) => createVpnConexao(input as any)),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      nomeUsuario: z.string().min(1).optional(),
      matricula: z.string().nullable().optional(),
      diretoria: z.string().nullable().optional(),
      servidor: z.string().min(1).optional(),
      ipAtribuido: z.string().nullable().optional(),
      status: z.enum(["conectado", "desconectado", "bloqueado"]).optional(),
      ultimaConexao: z.number().nullable().optional(),
      bytesEnviados: z.number().nullable().optional(),
      bytesRecebidos: z.number().nullable().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateVpnConexao(id, data as any);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteVpnConexao(input.id)),
  }),

  // ==================== ANEXOS ====================
  anexos: router({
    list: publicProcedure.input(z.object({
      entidadeTipo: z.enum(["instrumento", "vpn"]),
      entidadeId: z.number(),
    })).query(({ input }) => listAnexos(input.entidadeTipo, input.entidadeId)),

    countByIds: publicProcedure.input(z.object({
      entidadeTipo: z.enum(["instrumento", "vpn"]),
      entidadeIds: z.array(z.number()),
    })).query(({ input }) => countAnexosByEntidade(input.entidadeTipo, input.entidadeIds)),

    // Upload via base64 — frontend converte o arquivo para base64 antes de enviar
    upload: protectedProcedure.input(z.object({
      entidadeTipo: z.enum(["instrumento", "vpn"]),
      entidadeId: z.number(),
      nomeOriginal: z.string().min(1),
      mimeType: z.string().min(1),
      tamanho: z.number().max(20 * 1024 * 1024), // máx 20MB
      base64: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      if (!isAllowedFile(input.nomeOriginal, input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo de arquivo não permitido. Arquivos .exe e .bat são bloqueados." });
      }

      const suffix = nanoid(8);
      const ext = input.nomeOriginal.split(".").pop() ?? "bin";
      const s3Key = `anexos/${input.entidadeTipo}/${input.entidadeId}/${suffix}.${ext}`;

      // Converter base64 para Buffer
      const buffer = Buffer.from(input.base64, "base64");

      const { url } = await storagePut(s3Key, buffer, input.mimeType);

      const id = await createAnexo({
        entidadeTipo: input.entidadeTipo,
        entidadeId: input.entidadeId,
        nomeOriginal: input.nomeOriginal,
        nomeArquivo: `${suffix}.${ext}`,
        mimeType: input.mimeType,
        tamanho: input.tamanho,
        s3Key,
        s3Url: url,
        uploadedBy: ctx.user?.openId ?? null,
      });

      return { id, url, nomeOriginal: input.nomeOriginal };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const anexo = await deleteAnexo(input.id);
      if (anexo?.s3Key) {
        try { await storageDelete(anexo.s3Key); } catch (e) { /* ignora erro de S3 */ }
      }
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
