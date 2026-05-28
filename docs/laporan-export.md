# Export Laporan Bulanan (CSV)

Export laporan transaksi per bulan diimplementasikan sebagai **script CLI** (bukan endpoint/modul),
cocok untuk dijalankan admin/compliance secara berkala. Script menghasilkan file `.csv` di folder `exports/`.

- Script: `src/scripts/exportLaporanBulanan.ts`
- Output: `exports/laporan-transaksi-<YYYY-MM>.csv` (folder `exports/` di-ignore git)

## Cara Menjalankan

```bash
npm run export:laporan -- 2026-05
```

atau langsung:

```bash
npx ts-node src/scripts/exportLaporanBulanan.ts 2026-05
```

Argumen `<YYYY-MM>` wajib dan harus valid (bulan `01`–`12`). Format salah → pesan penggunaan + exit code `1`.

Contoh keluaran terminal:
```
Laporan bulan 2026-05: 4 transaksi
File CSV dibuat: .../TabunganHaji/exports/laporan-transaksi-2026-05.csv
```

## Isi & Kolom CSV

Rentang waktu: seluruh bulan (`[YYYY-MM-01 00:00 UTC, bulan berikutnya)`), urut waktu menaik.
Pemisah baris `\r\n`, nilai mengandung `, " \n` di-escape sesuai aturan CSV.

| Kolom | Sumber |
|---|---|
| `waktu` | `transaksi.waktu` (ISO 8601) |
| `referensi` | `transaksi.referensi` |
| `nomor_rekening` | `tabungan_haji.nomor_rekening` |
| `nik` | `nasabah.nik` |
| `nama` | `nasabah.nama` |
| `jenis` | `SETOR` / `TARIK` |
| `nominal` | `transaksi.nominal` |
| `saldo_sebelum` | `transaksi.saldo_sebelum` |
| `saldo_sesudah` | `transaksi.saldo_sesudah` |
| `metode` | `transaksi.metode` (boleh kosong) |

Contoh isi:
```csv
waktu,referensi,nomor_rekening,nik,nama,jenis,nominal,saldo_sebelum,saldo_sesudah,metode
2026-05-28T04:46:27.044Z,STR1779943587042703,6089344036,3201010101900001,Ahmad Fauzi,SETOR,250000,0,250000,QRIS
2026-05-28T06:05:35.327Z,TRK1779948335325698,6089344036,3201010101900001,Ahmad Fauzi,TARIK,100000,750000,650000,TELLER
```

Bila tidak ada transaksi pada bulan tersebut, file tetap dibuat berisi **baris header saja**.

## Catatan

- Script terhubung langsung ke database (memakai singleton Prisma) lalu `prisma.$disconnect()` saat selesai.
- Karena berupa CLI, **tidak** melewati `requireAuth`; keamanannya bergantung pada akses ke server/DB.
  Bila butuh export via HTTP dengan proteksi token, perlu menambahkan route khusus.
- Rentang bulan dihitung berbasis **UTC**.
