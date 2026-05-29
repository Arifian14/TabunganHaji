"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenBlocklist = void 0;
// Blocklist token in-memory (jti -> exp epoch detik).
// Catatan: state hilang saat server restart & tidak berbagi antar instance.
// Untuk produksi gunakan Redis atau tabel DB.
const revoked = new Map();
exports.tokenBlocklist = {
    revoke(jti, expEpochSeconds) {
        revoked.set(jti, expEpochSeconds);
    },
    isRevoked(jti) {
        const exp = revoked.get(jti);
        if (exp === undefined)
            return false;
        if (exp * 1000 <= Date.now()) {
            revoked.delete(jti);
            return false;
        }
        return true;
    },
};
// Bersihkan entri kedaluwarsa secara berkala; unref agar tidak menahan proses.
setInterval(() => {
    const now = Date.now();
    for (const [jti, exp] of revoked) {
        if (exp * 1000 <= now)
            revoked.delete(jti);
    }
}, 60_000).unref();
