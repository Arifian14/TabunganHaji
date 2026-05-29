"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nasabahController = void 0;
const client_1 = require("../../generated/prisma/client");
const nasabah_schema_1 = require("./nasabah.schema");
const nasabah_service_1 = require("./nasabah.service");
exports.nasabahController = {
    async create(req, res) {
        const parsed = nasabah_schema_1.CreateNasabahSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten().fieldErrors,
            });
        }
        try {
            const nasabah = await nasabah_service_1.nasabahService.create(parsed.data);
            return res.status(201).json(nasabah);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const field = err.meta?.target?.[0] ?? 'field';
                return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: `${field} sudah terdaftar` });
            }
            throw err;
        }
    },
    async findAll(req, res) {
        const data = await nasabah_service_1.nasabahService.findAll();
        return res.status(200).json({ data, total: data.length });
    },
    async findById(req, res) {
        const nasabah = await nasabah_service_1.nasabahService.findById(String(req.params.id));
        if (!nasabah) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
        }
        return res.status(200).json(nasabah);
    },
    async update(req, res) {
        const parsed = nasabah_schema_1.UpdateNasabahSchema.safeParse(req.body);
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
            const nasabah = await nasabah_service_1.nasabahService.update(String(req.params.id), parsed.data);
            return res.status(200).json(nasabah);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    const field = err.meta?.target?.[0] ?? 'field';
                    return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: `${field} sudah terdaftar` });
                }
                if (err.code === 'P2025') {
                    return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
                }
            }
            throw err;
        }
    },
    async remove(req, res) {
        try {
            await nasabah_service_1.nasabahService.remove(String(req.params.id));
            return res.status(204).send();
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message === 'NOT_FOUND')
                    return res.status(404).json({ error: 'NOT_FOUND', message: 'Nasabah tidak ditemukan' });
                if (err.message === 'HAS_TABUNGAN')
                    return res.status(422).json({ error: 'HAS_TABUNGAN', message: 'Nasabah masih memiliki rekening tabungan' });
            }
            throw err;
        }
    },
};
