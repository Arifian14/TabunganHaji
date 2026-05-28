import { Router } from "express";
import { nasabahController } from "./nasabah.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const nasabahRoutes = Router();

// Registrasi nasabah bersifat publik.
nasabahRoutes.post("/", nasabahController.create);

// Endpoint di bawah ini wajib autentikasi.
nasabahRoutes.use(requireAuth);

nasabahRoutes.get("/", nasabahController.findAll);
nasabahRoutes.get("/:id", nasabahController.findById);
nasabahRoutes.patch("/:id", nasabahController.update);
nasabahRoutes.delete("/:id", nasabahController.remove);
