# API Reference

Base URL: `http://localhost:3000`
Prefix API: `/api/v1`

- Body request & response berformat **JSON** (`Content-Type: application/json`).
- Endpoint terproteksi membutuhkan header `Authorization: Bearer <token>` (lihat [authentication.md](./authentication.md)).
- Nilai uang (`saldo`, `nominal`) dikembalikan sebagai **string** (tipe BigInt).

## Ringkasan Endpoint

| Method | Path | Auth | Deskripsi |
|---|---|:---:|---|
| GET | `/health` | – | Health check |
| POST | `/api/v1/auth/login` | – | Login, dapatkan JWT |
| POST | `/api/v1/auth/logout` | ✅ | Logout (invalidasi token) |
| POST | `/api/v1/nasabah` | – | Registrasi nasabah |
| GET | `/api/v1/nasabah` | ✅ | Daftar nasabah |
| GET | `/api/v1/nasabah/:id` | ✅ | Detail nasabah (+ rekening) |
| PATCH | `/api/v1/nasabah/:id` | ✅ | Update nasabah |
| DELETE | `/api/v1/nasabah/:id` | ✅ | Hapus nasabah |
| POST | `/api/v1/tabungan-haji` | ✅ | Buka rekening |
| GET | `/api/v1/tabungan-haji` | ✅ | Daftar rekening |
| GET | `/api/v1/tabungan-haji/nasabah/:nasabahId` | ✅ | Rekening milik nasabah |
| GET | `/api/v1/tabungan-haji/:id` | ✅ | Detail rekening & saldo |
| GET | `/api/v1/tabungan-haji/:id/estimasi` | ✅ | Estimasi tahun keberangkatan |
| PATCH | `/api/v1/tabungan-haji/:id/status` | ✅ | Ubah status rekening |
| DELETE | `/api/v1/tabungan-haji/:id` | ✅ | Hapus rekening |
| POST | `/api/v1/tabungan-haji/:id/setor` | ✅ | Setor (idempotent) |
| POST | `/api/v1/tabungan-haji/:id/tarik` | ✅ | Tarik |
| GET | `/api/v1/tabungan-haji/:id/transaksi` | ✅ | Daftar transaksi rekening |
| GET | `/api/v1/tabungan-haji/:id/mutasi` | ✅ | Mutasi (rekening koran) |
| GET | `/api/v1/transaksi` | ✅ | Daftar transaksi (filter) |
| GET | `/api/v1/transaksi/:id` | ✅ | Detail transaksi |

---

## Health

### `GET /health`
```json
{ "status": "ok", "service": "tabungan_haji_api", "timestamp": "2026-05-28T04:45:27.448Z" }
```

---

## Auth

Lihat detail di [authentication.md](./authentication.md).

### `POST /api/v1/auth/login`
Request:
```json
{ "email": "siti.aminah@example.com", "password": "rahasia123" }
```
Response `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "nasabah": { "id": "...", "nik": "...", "nama": "Siti Aminah", "email": "...", "nomorHp": "..." }
}
```
Error: `400` validasi, `401 INVALID_CREDENTIALS`.

### `POST /api/v1/auth/logout` 🔒
Header `Authorization: Bearer <token>`. Response `200`:
```json
{ "message": "Logout berhasil, token dinonaktifkan" }
```

---

## Nasabah

### `POST /api/v1/nasabah` — Registrasi (publik)
Request:
```json
{
  "nik": "3201010202910002",
  "nama": "Siti Aminah",
  "email": "siti.aminah@example.com",
  "nomorHp": "081298765432",
  "password": "rahasia123"
}
```
Aturan validasi:
| Field | Aturan |
|---|---|
| `nik` | tepat 16 digit angka |
| `nama` | 3–100 karakter |
| `email` | format email, ≤150 karakter, unik |
| `nomorHp` | pola `08xxxxxxxxxx` (10–13 digit) |
| `password` | 8–72 karakter |

Response `201` (tanpa password):
```json
{ "id": "...", "nik": "...", "nama": "Siti Aminah", "email": "...", "nomorHp": "...", "createdAt": "...", "updatedAt": "..." }
```
Error: `400` validasi, `409 DUPLICATE_ENTRY` (nik/email sudah terdaftar).

### `GET /api/v1/nasabah` 🔒
```json
{ "data": [ { "id": "...", "nama": "..." } ], "total": 2 }
```

### `GET /api/v1/nasabah/:id` 🔒
Mengembalikan nasabah beserta daftar `tabungan`. `404 NOT_FOUND` bila tidak ada.

### `PATCH /api/v1/nasabah/:id` 🔒
Body opsional (`nama`, `email`, `nomorHp`) — minimal satu field. Error: `400`, `404 NOT_FOUND`, `409 DUPLICATE_ENTRY`.

### `DELETE /api/v1/nasabah/:id` 🔒
Response `204`. Error: `404 NOT_FOUND`, `422 HAS_TABUNGAN` (masih punya rekening).

---

## Tabungan Haji

### `POST /api/v1/tabungan-haji` — Buka rekening 🔒
Request:
```json
{ "nasabahId": "3bba2c51-a629-4ba5-a70c-3227b7b8d8eb" }
```
**Aturan bisnis:** 1 nasabah = 1 rekening tabungan haji. Nomor rekening di-generate otomatis.

Response `201`:
```json
{
  "id": "...", "nasabahId": "...", "nomorRekening": "6089344036",
  "saldo": "0", "status": "AKTIF", "dibukaAt": "...",
  "nasabah": { "id": "...", "nama": "Ahmad Fauzi", "...": "..." }
}
```
| Kondisi | Status |
|---|---|
| Sukses | `201` |
| `nasabahId` tidak terdaftar | `403 NASABAH_NOT_REGISTERED` |
| Nasabah sudah punya rekening | `409 DUPLICATE_TABUNGAN` |
| Gagal membuat nomor unik (sangat jarang) | `503 REKENING_GENERATION_FAILED` |

### `GET /api/v1/tabungan-haji` 🔒
`{ "data": [...], "total": n }` — tiap item menyertakan `nasabah`.

### `GET /api/v1/tabungan-haji/nasabah/:nasabahId` 🔒
Daftar rekening milik satu nasabah.

### `GET /api/v1/tabungan-haji/:id` — Lihat saldo & detail 🔒
Response `200` (lihat contoh buka rekening). `404 NOT_FOUND` bila rekening tidak ada.

### `GET /api/v1/tabungan-haji/:id/estimasi` — Estimasi keberangkatan 🔒
Query (opsional):
| Param | Default | Arti |
|---|---|---|
| `kuotaTahunan` | `221000` | Kuota haji nasional per tahun |
| `nomorPorsi` | `1000000` | Posisi antrian (nomor porsi) |

Logika: butuh **setoran awal Rp25.000.000** untuk dapat porsi. Bila terpenuhi,
`tahunTunggu = ceil(nomorPorsi / kuotaTahunan)` dan `estimasiTahunBerangkat = tahunSekarang + tahunTunggu`.

Contoh `GET .../estimasi?kuotaTahunan=221000&nomorPorsi=1000000` saat saldo cukup → `200`:
```json
{
  "rekening": { "id": "...", "nomorRekening": "...", "saldo": "25000000", "status": "AKTIF", "nasabah": {"...": "..."} },
  "estimasi": {
    "setoranAwalMinimal": "25000000",
    "sudahMemenuhiSetoranAwal": true,
    "kekuranganSetoran": "0",
    "nomorPorsi": 1000000,
    "kuotaTahunan": 221000,
    "tahunSekarang": 2026,
    "tahunTunggu": 5,
    "estimasiTahunBerangkat": 2031
  }
}
```
Bila saldo < 25 juta: `sudahMemenuhiSetoranAwal=false`, `kekuranganSetoran` terisi,
`tahunTunggu` & `estimasiTahunBerangkat` bernilai `null`. `404 NOT_FOUND` bila rekening tidak ada.

> Catatan: `kuotaTahunan` & `nomorPorsi` adalah asumsi yang dapat diatur, bukan integrasi data Kemenag.

### `PATCH /api/v1/tabungan-haji/:id/status` 🔒
Request: `{ "status": "AKTIF" | "TUTUP" | "SUSPEND" }`. Error: `400`, `404 NOT_FOUND`.

### `DELETE /api/v1/tabungan-haji/:id` 🔒
Response `204`. Error: `404 NOT_FOUND`, `422 SALDO_TIDAK_NOL`, `422 HAS_TRANSAKSI`.

---

## Transaksi (Setor / Tarik / Mutasi)

### `POST /api/v1/tabungan-haji/:id/setor` — Setor (idempotent) 🔒
Header opsional: `Idempotency-Key: <8–50 karakter>`.
Request:
```json
{ "nominal": 250000, "metode": "QRIS" }
```
| Aturan | Nilai |
|---|---|
| `nominal` | integer, **minimum Rp100.000** |
| `metode` | string opsional (≤20), mis. `QRIS`, `TELLER` |

**Idempotency:** bila `Idempotency-Key` dikirim ulang dengan request sama, transaksi **tidak**
digandakan — server mengembalikan transaksi yang sama. Status `201` untuk transaksi baru, `200`
untuk replay. Key sama dengan nominal/rekening berbeda → `409 IDEMPOTENCY_CONFLICT`.

Response `201`:
```json
{
  "id": "...", "tabunganId": "...", "jenis": "SETOR",
  "nominal": "250000", "saldoSebelum": "0", "saldoSesudah": "250000",
  "referensi": "STR1779943587042703", "metode": "QRIS", "waktu": "..."
}
```
| Kondisi | Status |
|---|---|
| Sukses (baru) | `201` |
| Replay idempotent | `200` |
| Nominal < 100rb / invalid | `400 VALIDATION_ERROR` |
| Rekening tidak ada | `404 NOT_FOUND` |
| Rekening tidak `AKTIF` | `422 TABUNGAN_NOT_AKTIF` |
| Idempotency-Key dipakai untuk transaksi beda | `409 IDEMPOTENCY_CONFLICT` |

### `POST /api/v1/tabungan-haji/:id/tarik` — Tarik 🔒
Request: `{ "nominal": 100000, "metode": "TELLER" }` (`nominal` integer positif).
| Kondisi | Status |
|---|---|
| Sukses | `201` |
| Rekening tidak ada | `404 NOT_FOUND` |
| Rekening tidak `AKTIF` | `422 TABUNGAN_NOT_AKTIF` |
| Saldo tidak cukup | `422 SALDO_TIDAK_CUKUP` |

### `GET /api/v1/tabungan-haji/:id/transaksi` 🔒
`{ "data": [...], "total": n }` — daftar transaksi mentah, urut terbaru dulu.

### `GET /api/v1/tabungan-haji/:id/mutasi` — Rekening koran 🔒
Response `200`:
```json
{
  "rekening": { "id": "...", "nomorRekening": "...", "saldo": "650000", "status": "AKTIF",
                "nasabah": { "id": "...", "nik": "...", "nama": "..." } },
  "mutasi": [ { "jenis": "TARIK", "nominal": "100000", "saldoSebelum": "750000", "saldoSesudah": "650000", "...": "..." } ],
  "total": 3
}
```
Mutasi urut terbaru dulu, dengan saldo berjalan (`saldoSebelum`/`saldoSesudah`).
`404 NOT_FOUND` bila rekening tidak ada (dibedakan dari rekening kosong yang membalas `total: 0`).

### `GET /api/v1/transaksi` 🔒
Query opsional: `tabunganId`, `jenis` (`SETOR`/`TARIK`). `{ "data": [...], "total": n }`.

### `GET /api/v1/transaksi/:id` 🔒
Detail satu transaksi (+ `tabungan`). `404 NOT_FOUND` bila tidak ada.

---

## Kode Error

| HTTP | `error` | Makna |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input gagal validasi Zod (lihat `details`) |
| 401 | `UNAUTHORIZED` | Token tidak ada / tidak valid / kedaluwarsa |
| 401 | `TOKEN_REVOKED` | Token sudah di-logout (ada di blocklist) |
| 401 | `INVALID_CREDENTIALS` | Email atau password salah |
| 403 | `NASABAH_NOT_REGISTERED` | Buka rekening untuk nasabah yang belum terdaftar |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 409 | `DUPLICATE_ENTRY` | Nilai unik bentrok (nik/email/nomor rekening) |
| 409 | `DUPLICATE_TABUNGAN` | Nasabah sudah memiliki rekening tabungan haji |
| 409 | `IDEMPOTENCY_CONFLICT` | `Idempotency-Key` dipakai untuk transaksi berbeda |
| 422 | `TABUNGAN_NOT_AKTIF` | Operasi pada rekening non-AKTIF |
| 422 | `SALDO_TIDAK_CUKUP` | Saldo kurang untuk penarikan |
| 422 | `SALDO_TIDAK_NOL` | Hapus rekening yang masih bersaldo |
| 422 | `HAS_TRANSAKSI` | Hapus rekening yang punya riwayat transaksi |
| 422 | `HAS_TABUNGAN` | Hapus nasabah yang masih punya rekening |
| 503 | `REKENING_GENERATION_FAILED` | Gagal membuat nomor rekening unik setelah beberapa percobaan |
