import { Router } from "express";
import { transaksiController } from "./transaksi.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const transaksiRoutes = Router();

transaksiRoutes.use(requireAuth);

transaksiRoutes.get("/", transaksiController.findAll);
transaksiRoutes.get("/:id", transaksiController.findById);
