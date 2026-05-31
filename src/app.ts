import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.route";
import { nasabahRoutes } from "./modules/nasabah/nasabah.route";
import { tabunganRoutes } from "./modules/tabungan/tabungan.route";
import { transaksiRoutes } from "./modules/transaksi/transaksi.route";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () { return this.toString(); };

export const app = express();

/* ─── CORS ───
 * Whitelist origin yang boleh akses API.
 * Tambah lewat env CORS_ORIGINS="https://foo.com,https://bar.com" tanpa perlu ubah kode.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://tabungan-haji-fe.vercel.app",
];

const ALLOWED_ORIGINS = [
  ...DEFAULT_ALLOWED_ORIGINS,
  ...(process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

/* Regex untuk Vercel preview deployments (tabungan-haji-fe-<hash>-<user>.vercel.app) */
const VERCEL_PREVIEW_REGEX = /^https:\/\/tabungan-haji-fe(-[\w-]+)?\.vercel\.app$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Server-to-server / curl / mobile native: tanpa Origin header
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (VERCEL_PREVIEW_REGEX.test(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  maxAge: 86400, // cache preflight 24 jam
};

app.use(cors(corsOptions));
// Penanganan preflight eksplisit untuk semua route — defensive
app.options(/.*/, cors(corsOptions));

/* ─── Helmet ───
 * crossOriginResourcePolicy diubah ke cross-origin agar resource bisa diakses dari FE domain berbeda.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "tabungan_haji_api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/nasabah", nasabahRoutes);
app.use("/api/v1/tabungan-haji", tabunganRoutes);
app.use("/api/v1/transaksi", transaksiRoutes);
