import { Router } from "express";
import { tabunganController } from "./tabungan.controller";
import { transaksiController } from "../transaksi/transaksi.controller";

export const tabunganRoutes = Router();

tabunganRoutes.post("/", tabunganController.create);
tabunganRoutes.get("/", tabunganController.findAll);
tabunganRoutes.get("/nasabah/:nasabahId", tabunganController.findByNasabah);
tabunganRoutes.get("/:id", tabunganController.findById);
tabunganRoutes.patch("/:id/status", tabunganController.updateStatus);
tabunganRoutes.delete("/:id", tabunganController.remove);
tabunganRoutes.post("/:id/setor", transaksiController.setor);
tabunganRoutes.post("/:id/tarik", transaksiController.tarik);
tabunganRoutes.get("/:id/transaksi", transaksiController.findByTabungan);
