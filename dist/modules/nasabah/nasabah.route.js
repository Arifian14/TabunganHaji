"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nasabahRoutes = void 0;
const express_1 = require("express");
const nasabah_controller_1 = require("./nasabah.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.nasabahRoutes = (0, express_1.Router)();
// Registrasi nasabah bersifat publik.
exports.nasabahRoutes.post("/", nasabah_controller_1.nasabahController.create);
// Endpoint di bawah ini wajib autentikasi.
exports.nasabahRoutes.use(auth_middleware_1.requireAuth);
exports.nasabahRoutes.get("/", nasabah_controller_1.nasabahController.findAll);
exports.nasabahRoutes.get("/:id", nasabah_controller_1.nasabahController.findById);
exports.nasabahRoutes.patch("/:id", nasabah_controller_1.nasabahController.update);
exports.nasabahRoutes.delete("/:id", nasabah_controller_1.nasabahController.remove);
