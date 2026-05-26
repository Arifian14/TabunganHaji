import { prisma } from "../../lib/prisma";
import type { CreateNasabahInput, UpdateNasabahInput } from "./nasabah.schema";

export const nasabahService = {
  create: (data: CreateNasabahInput) =>
    prisma.nasabah.create({ data }),

  findAll: () =>
    prisma.nasabah.findMany({ orderBy: { createdAt: 'desc' } }),

  findById: (id: string) =>
    prisma.nasabah.findUnique({ where: { id }, include: { tabungan: true } }),

  update: (id: string, data: UpdateNasabahInput) =>
    prisma.nasabah.update({ where: { id }, data }),

  remove: async (id: string) => {
    const nasabah = await prisma.nasabah.findUnique({
      where: { id },
      include: { _count: { select: { tabungan: true } } },
    });
    if (!nasabah) throw new Error('NOT_FOUND');
    if (nasabah._count.tabungan > 0) throw new Error('HAS_TABUNGAN');
    return prisma.nasabah.delete({ where: { id } });
  },
};
