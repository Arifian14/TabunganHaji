import { randomInt } from "crypto";
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import type { CreateTabunganInput, UpdateStatusInput, EstimasiQueryInput } from "./tabungan.schema";

const MAX_REKENING_ATTEMPTS = 5;
const SETORAN_AWAL_PORSI = BigInt(25_000_000);

const generateNomorRekening = (): string => {
  const prefix = '60';
  const random = randomInt(0, 100_000_000).toString().padStart(8, '0');
  return prefix + random;
};

export const tabunganService = {
  create: async (data: CreateTabunganInput) => {
    const nasabah = await prisma.nasabah.findUnique({
      where: { id: data.nasabahId },
      include: { _count: { select: { tabungan: true } } },
    });
    if (!nasabah) throw new Error('NASABAH_NOT_REGISTERED');
    if (nasabah._count.tabungan > 0) throw new Error('DUPLICATE_TABUNGAN');

    for (let attempt = 0; attempt < MAX_REKENING_ATTEMPTS; attempt++) {
      try {
        return await prisma.tabunganHaji.create({
          data: { nasabahId: data.nasabahId, nomorRekening: generateNomorRekening() },
          include: { nasabah: true },
        });
      } catch (err) {
        const isCollision =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
        if (isCollision && attempt < MAX_REKENING_ATTEMPTS - 1) continue;
        throw err;
      }
    }
    throw new Error('REKENING_GENERATION_FAILED');
  },

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

  estimasi: async (id: string, opts: EstimasiQueryInput) => {
    const tabungan = await prisma.tabunganHaji.findUnique({
      where: { id },
      include: { nasabah: { select: { id: true, nik: true, nama: true } } },
    });
    if (!tabungan) throw new Error('NOT_FOUND');

    const sudahMemenuhi = tabungan.saldo >= SETORAN_AWAL_PORSI;
    const kekurangan = sudahMemenuhi ? BigInt(0) : SETORAN_AWAL_PORSI - tabungan.saldo;
    const tahunSekarang = new Date().getFullYear();

    const tahunTunggu = sudahMemenuhi ? Math.ceil(opts.nomorPorsi / opts.kuotaTahunan) : null;
    const estimasiTahunBerangkat = tahunTunggu === null ? null : tahunSekarang + tahunTunggu;

    return {
      rekening: {
        id: tabungan.id,
        nomorRekening: tabungan.nomorRekening,
        saldo: tabungan.saldo,
        status: tabungan.status,
        nasabah: tabungan.nasabah,
      },
      estimasi: {
        setoranAwalMinimal: SETORAN_AWAL_PORSI,
        sudahMemenuhiSetoranAwal: sudahMemenuhi,
        kekuranganSetoran: kekurangan,
        nomorPorsi: opts.nomorPorsi,
        kuotaTahunan: opts.kuotaTahunan,
        tahunSekarang,
        tahunTunggu,
        estimasiTahunBerangkat,
      },
    };
  },
};
