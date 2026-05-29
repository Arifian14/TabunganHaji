"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = require("fs");
const path_1 = require("path");
const prisma_1 = require("../lib/prisma");
const BULAN_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const CSV_HEADER = [
    "waktu",
    "referensi",
    "nomor_rekening",
    "nik",
    "nama",
    "jenis",
    "nominal",
    "saldo_sebelum",
    "saldo_sesudah",
    "metode",
];
const csvEscape = (value) => /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
async function main() {
    const bulan = process.argv[2];
    if (!bulan || !BULAN_REGEX.test(bulan)) {
        console.error("Format bulan harus YYYY-MM.");
        console.error("Penggunaan : ts-node src/scripts/exportLaporanBulanan.ts <YYYY-MM>");
        console.error("Contoh     : ts-node src/scripts/exportLaporanBulanan.ts 2026-05");
        process.exit(1);
    }
    const start = new Date(`${bulan}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    const rows = await prisma_1.prisma.transaksi.findMany({
        where: { waktu: { gte: start, lt: end } },
        orderBy: { waktu: "asc" },
        include: {
            tabungan: { include: { nasabah: { select: { nik: true, nama: true } } } },
        },
    });
    const lines = [CSV_HEADER.join(",")];
    for (const t of rows) {
        lines.push([
            t.waktu.toISOString(),
            t.referensi,
            t.tabungan.nomorRekening,
            t.tabungan.nasabah.nik,
            t.tabungan.nasabah.nama,
            t.jenis,
            t.nominal.toString(),
            t.saldoSebelum.toString(),
            t.saldoSesudah.toString(),
            t.metode ?? "",
        ]
            .map((v) => csvEscape(String(v)))
            .join(","));
    }
    const csv = lines.join("\r\n");
    const outDir = (0, path_1.join)(process.cwd(), "exports");
    (0, fs_1.mkdirSync)(outDir, { recursive: true });
    const outFile = (0, path_1.join)(outDir, `laporan-transaksi-${bulan}.csv`);
    (0, fs_1.writeFileSync)(outFile, csv, "utf-8");
    console.log(`Laporan bulan ${bulan}: ${rows.length} transaksi`);
    console.log(`File CSV dibuat: ${outFile}`);
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
