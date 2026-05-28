import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { CreateNasabahInput, UpdateNasabahInput } from "./nasabah.schema";

const BCRYPT_ROUNDS = 10;

export const nasabahService = {
  create: async (data: CreateNasabahInput) => {
    const password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return prisma.nasabah.create({ data: { ...data, password } });
  },

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
