import { prisma } from "../../lib/prisma";
import type { CreateTabunganInput, UpdateStatusInput } from "./tabungan.schema";

const generateNomorRekening = (): string => {
  const prefix = '60';
  const random = Math.floor(Math.random() * 100_000_000).toString().padStart(8, '0');
  return prefix + random;
};

export const tabunganService = {
  create: async (data: CreateTabunganInput) =>
    prisma.tabunganHaji.create({
      data: { nasabahId: data.nasabahId, nomorRekening: generateNomorRekening() },
      include: { nasabah: true },
    }),

  findAll: () =>
    prisma.tabunganHaji.findMany({
      orderBy: { dibukaAt: 'desc' },
      include: { nasabah: true },
    }),

  findById: (id: string) =>
    prisma.tabunganHaji.findUnique({
      where: { id },
      include: { nasabah: true },
    }),

  findByNasabah: (nasabahId: string) =>
    prisma.tabunganHaji.findMany({
      where: { nasabahId },
      orderBy: { dibukaAt: 'desc' },
    }),

  updateStatus: (id: string, data: UpdateStatusInput) =>
    prisma.tabunganHaji.update({ where: { id }, data: { status: data.status } }),

  remove: async (id: string) => {
    const tabungan = await prisma.tabunganHaji.findUnique({
      where: { id },
      include: { _count: { select: { transaksi: true } } },
    });
    if (!tabungan) throw new Error('NOT_FOUND');
    if (tabungan.saldo > BigInt(0)) throw new Error('SALDO_TIDAK_NOL');
    if (tabungan._count.transaksi > 0) throw new Error('HAS_TRANSAKSI');
    return prisma.tabunganHaji.delete({ where: { id } });
  },
};
