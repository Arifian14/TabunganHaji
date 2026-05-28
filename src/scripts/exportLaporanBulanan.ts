import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { prisma } from "../lib/prisma";

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

const csvEscape = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

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

  const rows = await prisma.transaksi.findMany({
    where: { waktu: { gte: start, lt: end } },
    orderBy: { waktu: "asc" },
    include: {
      tabungan: { include: { nasabah: { select: { nik: true, nama: true } } } },
    },
  });

  const lines = [CSV_HEADER.join(",")];
  for (const t of rows) {
    lines.push(
      [
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
        .join(","),
    );
  }
  const csv = lines.join("\r\n");

  const outDir = join(process.cwd(), "exports");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `laporan-transaksi-${bulan}.csv`);
  writeFileSync(outFile, csv, "utf-8");

  console.log(`Laporan bulan ${bulan}: ${rows.length} transaksi`);
  console.log(`File CSV dibuat: ${outFile}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
