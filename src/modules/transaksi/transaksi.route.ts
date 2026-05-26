import { Router } from "express";
import { transaksiController } from "./transaksi.controller";

export const transaksiRoutes = Router();

transaksiRoutes.get("/", transaksiController.findAll);
transaksiRoutes.get("/:id", transaksiController.findById);
