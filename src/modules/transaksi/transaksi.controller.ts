import type { Request, Response } from "express";
import { SetorSchema, TarikSchema } from "./transaksi.schema";
import { transaksiService } from "./transaksi.service";

export const transaksiController = {
  async setor(req: Request, res: Response) {
    const parsed = SetorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
    }
    const idempotencyKey = req.header('Idempotency-Key')?.trim();
    if (idempotencyKey !== undefined && (idempotencyKey.length < 8 || idempotencyKey.length > 50)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Idempotency-Key harus 8-50 karakter' });
    }
    try {
      const { transaksi, replayed } = await transaksiService.setor(String(req.params.id), parsed.data, idempotencyKey);
      return res.status(replayed ? 200 : 201).json(transaksi);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'TABUNGAN_NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
        if (err.message === 'TABUNGAN_NOT_AKTIF') return res.status(422).json({ error: 'TABUNGAN_NOT_AKTIF', message: 'Tabungan tidak dalam status AKTIF' });
        if (err.message === 'IDEMPOTENCY_CONFLICT') return res.status(409).json({ error: 'IDEMPOTENCY_CONFLICT', message: 'Idempotency-Key sudah dipakai untuk transaksi yang berbeda' });
      }
      throw err;
    }
  },

  async tarik(req: Request, res: Response) {
    const parsed = TarikSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
    }
    try {
      const transaksi = await transaksiService.tarik(String(req.params.id), parsed.data);
      return res.status(201).json(transaksi);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'TABUNGAN_NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
        if (err.message === 'TABUNGAN_NOT_AKTIF') return res.status(422).json({ error: 'TABUNGAN_NOT_AKTIF', message: 'Tabungan tidak dalam status AKTIF' });
        if (err.message === 'SALDO_TIDAK_CUKUP') return res.status(422).json({ error: 'SALDO_TIDAK_CUKUP', message: 'Saldo tidak mencukupi' });
      }
      throw err;
    }
  },

  async findAll(req: Request, res: Response) {
    const { tabunganId, jenis } = req.query;
    const data = await transaksiService.findAll({
      tabunganId: tabunganId ? String(tabunganId) : undefined,
      jenis: jenis ? String(jenis).toUpperCase() : undefined,
    });
    return res.status(200).json({ data, total: data.length });
  },

  async findByTabungan(req: Request, res: Response) {
    const data = await transaksiService.findByTabungan(String(req.params.id));
    return res.status(200).json({ data, total: data.length });
  },

  async mutasi(req: Request, res: Response) {
    try {
      const result = await transaksiService.mutasi(String(req.params.id));
      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error && err.message === 'TABUNGAN_NOT_FOUND') {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
      }
      throw err;
    }
  },

  async findById(req: Request, res: Response) {
    const transaksi = await transaksiService.findById(String(req.params.id));
    if (!transaksi) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Transaksi tidak ditemukan' });
    }
    return res.status(200).json(transaksi);
  },
};
