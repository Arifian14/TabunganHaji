"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// import { Prisma } from "./generated/prisma/client";
const auth_route_1 = require("./modules/auth/auth.route");
const nasabah_route_1 = require("./modules/nasabah/nasabah.route");
const tabungan_route_1 = require("./modules/tabungan/tabungan.route");
const transaksi_route_1 = require("./modules/transaksi/transaksi.route");
BigInt.prototype.toJSON = function () { return this.toString(); };
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "tabungan_haji_api",
        timestamp: new Date().toISOString(),
    });
});
exports.app.use("/api/v1/auth", auth_route_1.authRoutes);
exports.app.use("/api/v1/nasabah", nasabah_route_1.nasabahRoutes);
exports.app.use("/api/v1/tabungan-haji", tabungan_route_1.tabunganRoutes);
exports.app.use("/api/v1/transaksi", transaksi_route_1.transaksiRoutes);
