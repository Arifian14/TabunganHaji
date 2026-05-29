"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.post("/login", auth_controller_1.authController.login);
exports.authRoutes.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.authController.logout);
