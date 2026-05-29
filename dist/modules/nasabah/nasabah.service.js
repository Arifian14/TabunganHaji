"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nasabahService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../lib/prisma");
const BCRYPT_ROUNDS = 10;
exports.nasabahService = {
    create: async (data) => {
        const password = await bcrypt_1.default.hash(data.password, BCRYPT_ROUNDS);
        return prisma_1.prisma.nasabah.create({ data: { ...data, password } });
    },
    findAll: () => prisma_1.prisma.nasabah.findMany({ orderBy: { createdAt: 'desc' } }),
    findById: (id) => prisma_1.prisma.nasabah.findUnique({ where: { id }, include: { tabungan: true } }),
    update: (id, data) => prisma_1.prisma.nasabah.update({ where: { id }, data }),
    remove: async (id) => {
        const nasabah = await prisma_1.prisma.nasabah.findUnique({
            where: { id },
            include: { _count: { select: { tabungan: true } } },
        });
        if (!nasabah)
            throw new Error('NOT_FOUND');
        if (nasabah._count.tabungan > 0)
            throw new Error('HAS_TABUNGAN');
        return prisma_1.prisma.nasabah.delete({ where: { id } });
    },
};
