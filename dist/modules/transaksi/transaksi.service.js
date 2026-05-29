"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaksiService = void 0;
const crypto_1 = require("crypto");
const prisma_1 = require("../../lib/prisma");
const client_1 = require("../../generated/prisma/client");
const generateReferensi = (prefix) => {
    const random = (0, crypto_1.randomInt)(0, 1000).toString().padStart(3, '0');
    return `${prefix}${Date.now()}${random}`;
};
const assertIdempotentMatch = (existing, tabunganId, jenis, nominal) => {
    if (existing.tabunganId !== tabunganId || existing.jenis !== jenis || existing.nominal !== nominal) {
        throw new Error('IDEMPOTENCY_CONFLICT');
    }
};
exports.transaksiService = {
    setor: async (tabunganId, data, idempotencyKey) => {
        const nominal = BigInt(data.nominal);
        if (idempotencyKey) {
            const existing = await prisma_1.prisma.transaksi.findUnique({ where: { referensi: idempotencyKey } });
            if (existing) {
                assertIdempotentMatch(existing, tabunganId, 'SETOR', nominal);
                return { transaksi: existing, replayed: true };
            }
        }
        try {
            const transaksi = await prisma_1.prisma.$transaction(async (tx) => {
                const tabungan = await tx.tabunganHaji.findUnique({ where: { id: tabunganId } });
                if (!tabungan)
                    throw new Error('TABUNGAN_NOT_FOUND');
                if (tabungan.status !== 'AKTIF')
                    throw new Error('TABUNGAN_NOT_AKTIF');
                const saldoSebelum = tabungan.saldo;
                const saldoSesudah = saldoSebelum + nominal;
                await tx.tabunganHaji.update({ where: { id: tabunganId }, data: { saldo: saldoSesudah } });
                return tx.transaksi.create({
                    data: {
                        tabunganId,
                        jenis: 'SETOR',
                        nominal,
                        saldoSebelum,
                        saldoSesudah,
                        referensi: idempotencyKey ?? generateReferensi('STR'),
                        metode: data.metode,
                    },
                });
            });
            return { transaksi, replayed: false };
        }
        catch (err) {
            if (idempotencyKey && err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const existing = await prisma_1.prisma.transaksi.findUnique({ where: { referensi: idempotencyKey } });
                if (existing) {
                    assertIdempotentMatch(existing, tabunganId, 'SETOR', nominal);
                    return { transaksi: existing, replayed: true };
                }
            }
            throw err;
        }
    },
    tarik: async (tabunganId, data) => {
        return prisma_1.prisma.$transaction(async (tx) => {
            const tabungan = await tx.tabunganHaji.findUnique({ where: { id: tabunganId } });
            if (!tabungan)
                throw new Error('TABUNGAN_NOT_FOUND');
            if (tabungan.status !== 'AKTIF')
                throw new Error('TABUNGAN_NOT_AKTIF');
            const nominal = BigInt(data.nominal);
            const saldoSebelum = tabungan.saldo;
            if (saldoSebelum < nominal)
                throw new Error('SALDO_TIDAK_CUKUP');
            const saldoSesudah = saldoSebelum - nominal;
            await tx.tabunganHaji.update({ where: { id: tabunganId }, data: { saldo: saldoSesudah } });
            return tx.transaksi.create({
                data: { tabunganId, jenis: 'TARIK', nominal, saldoSebelum, saldoSesudah, referensi: generateReferensi('TRK'), metode: data.metode },
            });
        });
    },
    findAll: (filter) => prisma_1.prisma.transaksi.findMany({
        where: {
            ...(filter.tabunganId && { tabunganId: filter.tabunganId }),
            ...(filter.jenis && { jenis: filter.jenis }),
        },
        orderBy: { waktu: 'desc' },
        include: { tabungan: true },
    }),
    findByTabungan: (tabunganId) => prisma_1.prisma.transaksi.findMany({ where: { tabunganId }, orderBy: { waktu: 'desc' } }),
    mutasi: async (tabunganId) => {
        const tabungan = await prisma_1.prisma.tabunganHaji.findUnique({
            where: { id: tabunganId },
            include: { nasabah: { select: { id: true, nik: true, nama: true } } },
        });
        if (!tabungan)
            throw new Error('TABUNGAN_NOT_FOUND');
        const mutasi = await prisma_1.prisma.transaksi.findMany({
            where: { tabunganId },
            orderBy: { waktu: 'desc' },
        });
        return {
            rekening: {
                id: tabungan.id,
                nomorRekening: tabungan.nomorRekening,
                saldo: tabungan.saldo,
                status: tabungan.status,
                nasabah: tabungan.nasabah,
            },
            mutasi,
            total: mutasi.length,
        };
    },
    findById: (id) => prisma_1.prisma.transaksi.findUnique({ where: { id }, include: { tabungan: true } }),
};
