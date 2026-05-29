"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabunganController = void 0;
const client_1 = require("../../generated/prisma/client");
const tabungan_schema_1 = require("./tabungan.schema");
const tabungan_service_1 = require("./tabungan.service");
exports.tabunganController = {
    async create(req, res) {
        const parsed = tabungan_schema_1.CreateTabunganSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten().fieldErrors,
            });
        }
        try {
            const tabungan = await tabungan_service_1.tabunganService.create(parsed.data);
            return res.status(201).json(tabungan);
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message === 'NASABAH_NOT_REGISTERED')
                    return res.status(403).json({ error: 'NASABAH_NOT_REGISTERED', message: 'Nasabah belum terdaftar, tidak dapat membuka rekening' });
                if (err.message === 'DUPLICATE_TABUNGAN')
                    return res.status(409).json({ error: 'DUPLICATE_TABUNGAN', message: 'Nasabah sudah memiliki rekening tabungan haji' });
                if (err.message === 'REKENING_GENERATION_FAILED')
                    return res.status(503).json({ error: 'REKENING_GENERATION_FAILED', message: 'Gagal membuat nomor rekening unik, silakan coba lagi' });
            }
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002')
                    return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: 'Nomor rekening sudah terdaftar, coba lagi' });
                if (err.code === 'P2003' || err.code === 'P2025')
                    return res.status(403).json({ error: 'NASABAH_NOT_REGISTERED', message: 'Nasabah belum terdaftar, tidak dapat membuka rekening' });
            }
            throw err;
        }
    },
    async findAll(req, res) {
        const data = await tabungan_service_1.tabunganService.findAll();
        return res.status(200).json({ data, total: data.length });
    },
    async findById(req, res) {
        const tabungan = await tabungan_service_1.tabunganService.findById(String(req.params.id));
        if (!tabungan) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
        }
        return res.status(200).json(tabungan);
    },
    async findByNasabah(req, res) {
        const data = await tabungan_service_1.tabunganService.findByNasabah(String(req.params.nasabahId));
        return res.status(200).json({ data, total: data.length });
    },
    async estimasi(req, res) {
        const parsed = tabungan_schema_1.EstimasiQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
        }
        try {
            const result = await tabungan_service_1.tabunganService.estimasi(String(req.params.id), parsed.data);
            return res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof Error && err.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
            }
            throw err;
        }
    },
    async updateStatus(req, res) {
        const parsed = tabungan_schema_1.UpdateStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten().fieldErrors,
            });
        }
        try {
            const tabungan = await tabungan_service_1.tabunganService.updateStatus(String(req.params.id), parsed.data);
            return res.status(200).json(tabungan);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
            }
            throw err;
        }
    },
    async remove(req, res) {
        try {
            await tabungan_service_1.tabunganService.remove(String(req.params.id));
            return res.status(204).send();
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message === 'NOT_FOUND')
                    return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
                if (err.message === 'SALDO_TIDAK_NOL')
                    return res.status(422).json({ error: 'SALDO_TIDAK_NOL', message: 'Tabungan masih memiliki saldo, harap tarik saldo terlebih dahulu' });
                if (err.message === 'HAS_TRANSAKSI')
                    return res.status(422).json({ error: 'HAS_TRANSAKSI', message: 'Tabungan memiliki riwayat transaksi dan tidak dapat dihapus' });
            }
            throw err;
        }
    },
};
