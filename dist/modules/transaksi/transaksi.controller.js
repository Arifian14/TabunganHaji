"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaksiController = void 0;
const transaksi_schema_1 = require("./transaksi.schema");
const transaksi_service_1 = require("./transaksi.service");
exports.transaksiController = {
    async setor(req, res) {
        const parsed = transaksi_schema_1.SetorSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
        }
        const idempotencyKey = req.header('Idempotency-Key')?.trim();
        if (idempotencyKey !== undefined && (idempotencyKey.length < 8 || idempotencyKey.length > 50)) {
            return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Idempotency-Key harus 8-50 karakter' });
        }
        try {
            const { transaksi, replayed } = await transaksi_service_1.transaksiService.setor(String(req.params.id), parsed.data, idempotencyKey);
            return res.status(replayed ? 200 : 201).json(transaksi);
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message === 'TABUNGAN_NOT_FOUND')
                    return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
                if (err.message === 'TABUNGAN_NOT_AKTIF')
                    return res.status(422).json({ error: 'TABUNGAN_NOT_AKTIF', message: 'Tabungan tidak dalam status AKTIF' });
                if (err.message === 'IDEMPOTENCY_CONFLICT')
                    return res.status(409).json({ error: 'IDEMPOTENCY_CONFLICT', message: 'Idempotency-Key sudah dipakai untuk transaksi yang berbeda' });
            }
            throw err;
        }
    },
    async tarik(req, res) {
        const parsed = transaksi_schema_1.TarikSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
        }
        try {
            const transaksi = await transaksi_service_1.transaksiService.tarik(String(req.params.id), parsed.data);
            return res.status(201).json(transaksi);
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message === 'TABUNGAN_NOT_FOUND')
                    return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
                if (err.message === 'TABUNGAN_NOT_AKTIF')
                    return res.status(422).json({ error: 'TABUNGAN_NOT_AKTIF', message: 'Tabungan tidak dalam status AKTIF' });
                if (err.message === 'SALDO_TIDAK_CUKUP')
                    return res.status(422).json({ error: 'SALDO_TIDAK_CUKUP', message: 'Saldo tidak mencukupi' });
            }
            throw err;
        }
    },
    async findAll(req, res) {
        const { tabunganId, jenis } = req.query;
        const data = await transaksi_service_1.transaksiService.findAll({
            tabunganId: tabunganId ? String(tabunganId) : undefined,
            jenis: jenis ? String(jenis).toUpperCase() : undefined,
        });
        return res.status(200).json({ data, total: data.length });
    },
    async findByTabungan(req, res) {
        const data = await transaksi_service_1.transaksiService.findByTabungan(String(req.params.id));
        return res.status(200).json({ data, total: data.length });
    },
    async mutasi(req, res) {
        try {
            const result = await transaksi_service_1.transaksiService.mutasi(String(req.params.id));
            return res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof Error && err.message === 'TABUNGAN_NOT_FOUND') {
                return res.status(404).json({ error: 'NOT_FOUND', message: 'Tabungan tidak ditemukan' });
            }
            throw err;
        }
    },
    async findById(req, res) {
        const transaksi = await transaksi_service_1.transaksiService.findById(String(req.params.id));
        if (!transaksi) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Transaksi tidak ditemukan' });
        }
        return res.status(200).json(transaksi);
    },
};
