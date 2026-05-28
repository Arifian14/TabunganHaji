# Getting Started

Panduan menyiapkan dan menjalankan Tabungan Haji API di lingkungan lokal.

## Prasyarat

- **Node.js** 18+ (proyek diuji dengan tooling versi terbaru)
- **PostgreSQL** berjalan dan dapat diakses (default: `localhost:5432`)
- **npm**

## 1. Instalasi Dependency

```bash
npm install
```

Dependency runtime: `express`, `@prisma/client`, `prisma`, `zod`, `bcrypt`, `jsonwebtoken`,
`helmet`, `cors`, `dotenv`.

> **Kendala jaringan korporat:** di sebagian jaringan (mis. proxy/SSL inspection BSI),
> `npm install` paket baru bisa gagal dengan `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
> Untuk itu, type definition `@types/jsonwebtoken` & `@types/bcrypt` **belum** ter-install
> dan digantikan deklarasi lokal di `src/types/shims.d.ts`. Ganti dengan `@types/*` resmi
> saat jaringan memungkinkan. **Jangan** menonaktifkan verifikasi TLS sebagai jalan pintas.

## 2. Konfigurasi Environment (`.env`)

Buat file `.env` di root proyek:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/tabungan_haji_online?schema=public
JWT_SECRET=ganti-dengan-string-acak-panjang
JWT_EXPIRES_SECONDS=3600
```

| Variabel | Wajib | Keterangan |
|---|---|---|
| `PORT` | tidak | Port server, default `3000` |
| `DATABASE_URL` | ya | Connection string PostgreSQL |
| `JWT_SECRET` | ya* | Kunci penandatangan JWT. *Ada fallback dev `dev-secret-change-me`, **wajib diganti** untuk selain dev |
| `JWT_EXPIRES_SECONDS` | tidak | Masa berlaku token (detik), default `3600` (1 jam) |

Membuat secret acak:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `.env` di-ignore git. Jangan commit kredensial.

## 3. Migrasi Database

```bash
npx prisma migrate dev
```

Perintah ini menerapkan migrasi di `prisma/migrations/` dan meng-generate Prisma Client
ke `src/generated/prisma` (folder ini di-ignore git).

Migrasi yang ada:
- `..._init` — tabel `nasabah`, `tabungan_haji`, `transaksi`
- `..._add_nasabah_password` — kolom `password` pada `nasabah`

Cek status: `npx prisma migrate status`.

## 4. Menjalankan Server

```bash
npm run dev      # development (nodemon + ts-node, auto-reload)
```

atau build & jalankan hasil kompilasi:

```bash
npm run build    # output ke dist/
npm start        # node dist/index.js
```

Server akan mencetak `Server berjalan di port 3000`.

## 5. Verifikasi

```bash
curl http://localhost:3000/health
# {"status":"ok","service":"tabungan_haji_api","timestamp":"..."}
```

## Script NPM

| Script | Fungsi |
|---|---|
| `npm run dev` | Server mode dev (auto-reload) |
| `npm run build` | Kompilasi TypeScript ke `dist/` |
| `npm start` | Jalankan hasil build |
| `npm run export:laporan -- <YYYY-MM>` | Export laporan transaksi bulanan ke CSV (lihat [laporan-export.md](./laporan-export.md)) |

## Troubleshooting

| Gejala | Penyebab & Solusi |
|---|---|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` saat `npm install` | Proxy/SSL korporat. Lihat catatan di bagian Instalasi. |
| `Property 'auth' does not exist on type 'Request'` saat `ts-node` | Pastikan `tsconfig.json` memuat `"ts-node": { "files": true }` agar deklarasi ambient `src/types/*.d.ts` terbaca. |
| `Can't reach database server` | Pastikan PostgreSQL hidup & `DATABASE_URL` benar. |
| Error JWT `invalid signature` | `JWT_SECRET` berbeda antara saat token dibuat dan diverifikasi. |
