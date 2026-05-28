// Blocklist token in-memory (jti -> exp epoch detik).
// Catatan: state hilang saat server restart & tidak berbagi antar instance.
// Untuk produksi gunakan Redis atau tabel DB.
const revoked = new Map<string, number>();

export const tokenBlocklist = {
  revoke(jti: string, expEpochSeconds: number): void {
    revoked.set(jti, expEpochSeconds);
  },

  isRevoked(jti: string): boolean {
    const exp = revoked.get(jti);
    if (exp === undefined) return false;
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
    if (exp * 1000 <= now) revoked.delete(jti);
  }
}, 60_000).unref();
