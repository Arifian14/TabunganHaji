# Dokumentasi Tabungan Haji API

REST API untuk simulasi **Tabungan Haji** Bank Syariah Indonesia (BSI) — materi bootcamp.
API ini mengelola nasabah, rekening tabungan haji, transaksi setor/tarik, autentikasi JWT,
estimasi tahun keberangkatan, serta export laporan bulanan ke CSV.

## Daftar Dokumen

| Dokumen | Isi |
|---|---|
| [getting-started.md](./getting-started.md) | Prasyarat, instalasi, konfigurasi `.env`, migrasi DB, menjalankan server |
| [architecture.md](./architecture.md) | Struktur folder, pola berlapis (route/controller/service/schema), model data |
| [api-reference.md](./api-reference.md) | Referensi lengkap semua endpoint + contoh request/response + kode error |
| [authentication.md](./authentication.md) | Alur login JWT, middleware `requireAuth`, logout & token blocklist |
| [laporan-export.md](./laporan-export.md) | Script export laporan transaksi bulanan ke file CSV |

## Ringkasan Teknologi

| Komponen | Pilihan |
|---|---|
| Runtime | Node.js + TypeScript (target ES2022, CommonJS) |
| Framework | Express 5 |
| ORM / DB | Prisma 6 + PostgreSQL |
| Validasi | Zod |
| Keamanan | helmet, cors, JWT (`jsonwebtoken`), hashing `bcrypt` |
| Dev tooling | ts-node, nodemon |

## Fitur Utama

- **Manajemen nasabah** — registrasi (dengan password) + CRUD.
- **Buka rekening tabungan haji** — 1 nasabah = 1 rekening, nomor rekening unik anti-collision.
- **Setor & tarik** — atomik via transaksi DB, setor **idempotent** (header `Idempotency-Key`), minimum setor Rp100.000.
- **Lihat saldo & mutasi** — detail rekening dan riwayat mutasi (rekening koran).
- **Estimasi keberangkatan haji** — berdasarkan saldo (setoran awal porsi) & kuota tahunan.
- **Autentikasi JWT** — login, proteksi endpoint sensitif, logout dengan invalidasi token.
- **Export laporan bulanan** — script CLI menghasilkan file CSV.

## Mulai Cepat

```bash
npm install
# Siapkan .env (lihat getting-started.md)
npx prisma migrate dev
npm run dev          # server di http://localhost:3000
```

Cek kesehatan: `GET http://localhost:3000/health`.

> Catatan: dokumentasi ini ditulis untuk konteks pembelajaran/bootcamp. Beberapa keputusan
> (mis. blocklist token in-memory, belum ada otorisasi berbasis kepemilikan/role) disengaja
> demi kesederhanaan — lihat [authentication.md](./authentication.md).
