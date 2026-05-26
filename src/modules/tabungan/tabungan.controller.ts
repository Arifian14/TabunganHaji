import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { CreateTabunganSchema, UpdateStatusSchema } from "./tabungan.schema";
import { tabunganService } from "./tabungan.service";

export const tabunganController = {
  async create(req: Request, res: Response) {
    const parsed = CreateTabunganSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    try {
      const tabungan = await tabunganService.create(parsed.data);
      return res.status(201).json(tabungan);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: 'Nomor rekening sudah terdaftar, coba lagi' });
        if (err.code === 'P2003' || err.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
      }
      throw err;
    }
  },

  async findAll(req: Request, res: Response) {
    const data = await tabunganService.findAll();
    return res.status(200).json({ data, total: data.length });
  },

  async findById(req: Request, res: Response) {
    const tabungan = await tabunganService.findById(String(req.params.id));
    if (!tabungan) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
    }
    return res.status(200).json(tabungan);
  },

  async findByNasabah(req: Request, res: Response) {
    const data = await tabunganService.findByNasabah(String(req.params.nasabahId));
    return res.status(200).json({ data, total: data.length });
  },

  async updateStatus(req: Request, res: Response) {
    const parsed = UpdateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    try {
      const tabungan = await tabunganService.updateStatus(String(req.params.id), parsed.data);
      return res.status(200).json(tabungan);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
      }
      throw err;
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await tabunganService.remove(String(req.params.id));
      return res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
        if (err.message === 'SALDO_TIDAK_NOL') return res.status(422).json({ error: 'SALDO_TIDAK_NOL', message: 'Tabungan masih memiliki saldo, harap tarik saldo terlebih dahulu' });
        if (err.message === 'HAS_TRANSAKSI') return res.status(422).json({ error: 'HAS_TRANSAKSI', message: 'Tabungan memiliki riwayat transaksi dan tidak dapat dihapus' });
      }
      throw err;
    }
  },
};
