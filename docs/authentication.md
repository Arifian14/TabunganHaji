# Autentikasi & Otorisasi

API menggunakan **JWT (JSON Web Token)** stateless untuk autentikasi, dengan **blocklist
in-memory** untuk mendukung logout (invalidasi token).

## Komponen

| Berkas | Peran |
|---|---|
| `src/lib/jwt.ts` | `signAccessToken()` & `verifyAccessToken()` |
| `src/lib/tokenBlocklist.ts` | Menyimpan `jti` token yang sudah logout (Map in-memory) |
| `src/middleware/auth.middleware.ts` | `requireAuth` — memverifikasi token & cek blocklist |
| `src/types/express.d.ts` | Menambahkan `req.auth` ke tipe Express Request |
| `src/modules/auth/*` | Endpoint `login` & `logout` |

## Alur

```
1. Registrasi   POST /api/v1/nasabah        (publik, password di-hash bcrypt)
2. Login        POST /api/v1/auth/login      → terima { token, nasabah }
3. Akses        Authorization: Bearer <token> pada endpoint terproteksi
4. Logout       POST /api/v1/auth/logout     → jti token masuk blocklist
5. Token sama setelah logout → 401 TOKEN_REVOKED
```

## Token

- Algoritma: HS256, ditandatangani dengan `JWT_SECRET`.
- Payload: `sub` (id nasabah), `email`, `jti` (UUID unik per token), `iat`, `exp`.
- Masa berlaku: `JWT_EXPIRES_SECONDS` (default 3600 detik / 1 jam).

## Login

`POST /api/v1/auth/login`
```json
{ "email": "siti.aminah@example.com", "password": "rahasia123" }
```
- Mengambil nasabah by email **termasuk** password (override global omit), lalu `bcrypt.compare`.
- Berhasil → `200 { token, nasabah }` (nasabah tanpa password).
- Gagal (email tidak ada / password salah / nasabah tanpa password) → `401 INVALID_CREDENTIALS`.

## Middleware `requireAuth`

Dipasang di level router untuk endpoint sensitif:

```ts
// contoh: src/modules/tabungan/tabungan.route.ts
tabunganRoutes.use(requireAuth);
```

Perilaku:
1. Tidak ada header `Authorization: Bearer ...` → `401 UNAUTHORIZED`.
2. Token gagal verifikasi / kedaluwarsa → `401 UNAUTHORIZED`.
3. `jti` token ada di blocklist → `401 TOKEN_REVOKED`.
4. Valid → menempelkan `req.auth = { id, email, jti, exp }` lalu `next()`.

### Cakupan proteksi

| Grup | Status |
|---|---|
| `/api/v1/tabungan-haji/*` | **Semua** terproteksi |
| `/api/v1/transaksi/*` | **Semua** terproteksi |
| `/api/v1/nasabah` `POST` (registrasi) | Publik |
| `/api/v1/nasabah` `GET`/`PATCH`/`DELETE` | Terproteksi |
| `/api/v1/auth/login` | Publik |
| `/api/v1/auth/logout` | Terproteksi |
| `/health` | Publik |

## Logout & Invalidasi Token

`POST /api/v1/auth/logout` (butuh token):
- `requireAuth` mengisi `req.auth` (termasuk `jti` & `exp`).
- `jti` dimasukkan ke blocklist sampai waktu `exp`.
- Permintaan berikutnya dengan token yang sama → `401 TOKEN_REVOKED`.

`tokenBlocklist` membersihkan entri kedaluwarsa secara berkala (interval `unref`, tidak menahan proses).

## Contoh (curl)

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siti.aminah@example.com","password":"rahasia123"}' \
  | python -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Akses terproteksi
curl http://localhost:3000/api/v1/tabungan-haji -H "Authorization: Bearer $TOKEN"

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout -H "Authorization: Bearer $TOKEN"

# Token sama → 401 TOKEN_REVOKED
curl http://localhost:3000/api/v1/tabungan-haji -H "Authorization: Bearer $TOKEN"
```

## Batasan yang Disengaja (Konteks Bootcamp)

- **Blocklist in-memory** — sederhana, namun **hilang saat server restart** dan tidak berbagi
  antar instance. Untuk produksi gunakan Redis atau tabel DB.
- **Belum ada otorisasi kepemilikan/role** — token valid mana pun bisa mengakses rekening
  nasabah mana pun. Belum ada pengecekan `req.auth.id === tabungan.nasabahId` maupun peran
  admin/compliance. Tambahkan bila diperlukan.
- **`JWT_SECRET` fallback dev** — bila env tidak diset, dipakai `dev-secret-change-me`.
  **Wajib** set secret kuat untuk selain pengembangan lokal.
