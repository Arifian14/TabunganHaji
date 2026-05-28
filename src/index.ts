import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.route";
import { nasabahRoutes } from "./modules/nasabah/nasabah.route";
import { tabunganRoutes } from "./modules/tabungan/tabungan.route";
import { transaksiRoutes } from "./modules/transaksi/transaksi.route";

(BigInt.prototype as any).toJSON = function () { return this.toString(); };

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
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

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});