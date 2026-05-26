import { prisma } from "../../lib/prisma";
import type { SetorInput, TarikInput } from "./transaksi.schema";

const generateReferensi = (prefix: 'STR' | 'TRK'): string => {
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${Date.now()}${random}`;
};

export const transaksiService = {
  setor: async (tabunganId: string, data: SetorInput) => {
    return prisma.$transaction(async (tx) => {
      const tabungan = await tx.tabunganHaji.findUnique({ where: { id: tabunganId } });
      if (!tabungan) throw new Error('TABUNGAN_NOT_FOUND');
      if (tabungan.status !== 'AKTIF') throw new Error('TABUNGAN_NOT_AKTIF');

      const nominal = BigInt(data.nominal);
      const saldoSebelum = tabungan.saldo;
      const saldoSesudah = saldoSebelum + nominal;

      await tx.tabunganHaji.update({ where: { id: tabunganId }, data: { saldo: saldoSesudah } });

      return tx.transaksi.create({
        data: { tabunganId, jenis: 'SETOR', nominal, saldoSebelum, saldoSesudah, referensi: generateReferensi('STR'), metode: data.metode },
      });
    });
  },

  tarik: async (tabunganId: string, data: TarikInput) => {
    return prisma.$transaction(async (tx) => {
      const tabungan = await tx.tabunganHaji.findUnique({ where: { id: tabunganId } });
      if (!tabungan) throw new Error('TABUNGAN_NOT_FOUND');
      if (tabungan.status !== 'AKTIF') throw new Error('TABUNGAN_NOT_AKTIF');

      const nominal = BigInt(data.nominal);
      const saldoSebelum = tabungan.saldo;
      if (saldoSebelum < nominal) throw new Error('SALDO_TIDAK_CUKUP');

      const saldoSesudah = saldoSebelum - nominal;

      await tx.tabunganHaji.update({ where: { id: tabunganId }, data: { saldo: saldoSesudah } });

      return tx.transaksi.create({
        data: { tabunganId, jenis: 'TARIK', nominal, saldoSebelum, saldoSesudah, referensi: generateReferensi('TRK'), metode: data.metode },
      });
    });
  },

  findAll: (filter: { tabunganId?: string; jenis?: string }) =>
    prisma.transaksi.findMany({
      where: {
        ...(filter.tabunganId && { tabunganId: filter.tabunganId }),
        ...(filter.jenis && { jenis: filter.jenis }),
      },
      orderBy: { waktu: 'desc' },
      include: { tabungan: true },
    }),

  findByTabungan: (tabunganId: string) =>
    prisma.transaksi.findMany({ where: { tabunganId }, orderBy: { waktu: 'desc' } }),

  findById: (id: string) =>
    prisma.transaksi.findUnique({ where: { id }, include: { tabungan: true } }),
};
