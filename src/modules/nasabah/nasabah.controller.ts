import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { CreateNasabahSchema, UpdateNasabahSchema } from "./nasabah.schema";
import { nasabahService } from "./nasabah.service";

export const nasabahController = {
  async create(req: Request, res: Response) {
    const parsed = CreateNasabahSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    try {
      const nasabah = await nasabahService.create(parsed.data);
      return res.status(201).json(nasabah);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const field = (err.meta?.target as string[])?.[0] ?? 'field';
        return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: `${field} sudah terdaftar` });
      }
      throw err;
    }
  },

  async findAll(req: Request, res: Response) {
    const data = await nasabahService.findAll();
    return res.status(200).json({ data, total: data.length });
  },

  async findById(req: Request, res: Response) {
    const nasabah = await nasabahService.findById(String(req.params.id));
    if (!nasabah) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
    }
    return res.status(200).json(nasabah);
  },

  async update(req: Request, res: Response) {
    const parsed = UpdateNasabahSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const anyDefined = Object.values(parsed.data).some(v => v !== undefined);
    if (!anyDefined) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: { _errors: ["Minimal satu field harus diisi"] },
      });
    }
    try {
      const nasabah = await nasabahService.update(String(req.params.id), parsed.data);
      return res.status(200).json(nasabah);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const field = (err.meta?.target as string[])?.[0] ?? 'field';
          return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: `${field} sudah terdaftar` });
        }
        if (err.code === 'P2025') {
          return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
        }
      }
      throw err;
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await nasabahService.remove(String(req.params.id));
      return res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
        if (err.message === 'HAS_TABUNGAN') return res.status(422).json({ error: 'HAS_TABUNGAN', message: 'Nasabah masih memiliki rekening tabungan' });
      }
      throw err;
    }
  },
};
