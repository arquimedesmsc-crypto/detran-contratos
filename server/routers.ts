import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  listInstrumentos, getInstrumentoById, createInstrumento, updateInstrumento, deleteInstrumento,
  getDiretorias, getTipos, getStats, getAlertasVencimento, getTimelineData,
  getTermosByInstrumentoId, createTermoAditivo, deleteTermoAditivo,
  listVpnConexoes, getVpnStats, getAllInstrumentosForExport,
} from "./db";

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
  }),
});

export type AppRouter = typeof appRouter;
