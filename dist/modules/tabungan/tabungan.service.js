"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabunganService = void 0;
const crypto_1 = require("crypto");
const prisma_1 = require("../../lib/prisma");
const client_1 = require("../../generated/prisma/client");
const MAX_REKENING_ATTEMPTS = 5;
const SETORAN_AWAL_PORSI = BigInt(25_000_000);
const generateNomorRekening = () => {
    const prefix = '60';
    const random = (0, crypto_1.randomInt)(0, 100_000_000).toString().padStart(8, '0');
    return prefix + random;
};
exports.tabunganService = {
    create: async (data) => {
        const nasabah = await prisma_1.prisma.nasabah.findUnique({
            where: { id: data.nasabahId },
            include: { _count: { select: { tabungan: true } } },
        });
        if (!nasabah)
            throw new Error('NASABAH_NOT_REGISTERED');
        if (nasabah._count.tabungan > 0)
            throw new Error('DUPLICATE_TABUNGAN');
        for (let attempt = 0; attempt < MAX_REKENING_ATTEMPTS; attempt++) {
            try {
                return await prisma_1.prisma.tabunganHaji.create({
                    data: { nasabahId: data.nasabahId, nomorRekening: generateNomorRekening() },
                    include: { nasabah: true },
                });
            }
            catch (err) {
                const isCollision = err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
                if (isCollision && attempt < MAX_REKENING_ATTEMPTS - 1)
                    continue;
                throw err;
            }
        }
        throw new Error('REKENING_GENERATION_FAILED');
    },
    findAll: () => prisma_1.prisma.tabunganHaji.findMany({
        orderBy: { dibukaAt: 'desc' },
        include: { nasabah: true },
    }),
    findById: (id) => prisma_1.prisma.tabunganHaji.findUnique({
        where: { id },
        include: { nasabah: true },
    }),
    findByNasabah: (nasabahId) => prisma_1.prisma.tabunganHaji.findMany({
        where: { nasabahId },
        orderBy: { dibukaAt: 'desc' },
    }),
    updateStatus: (id, data) => prisma_1.prisma.tabunganHaji.update({ where: { id }, data: { status: data.status } }),
    remove: async (id) => {
        const tabungan = await prisma_1.prisma.tabunganHaji.findUnique({
            where: { id },
            include: { _count: { select: { transaksi: true } } },
        });
        if (!tabungan)
            throw new Error('NOT_FOUND');
        if (tabungan.saldo > BigInt(0))
            throw new Error('SALDO_TIDAK_NOL');
        if (tabungan._count.transaksi > 0)
            throw new Error('HAS_TRANSAKSI');
        return prisma_1.prisma.tabunganHaji.delete({ where: { id } });
    },
    estimasi: async (id, opts) => {
        const tabungan = await prisma_1.prisma.tabunganHaji.findUnique({
            where: { id },
            include: { nasabah: { select: { id: true, nik: true, nama: true } } },
        });
        if (!tabungan)
            throw new Error('NOT_FOUND');
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
