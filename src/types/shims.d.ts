// Deklarasi tipe lokal untuk dependency yang @types-nya belum bisa di-install
// (registry npm terblokir sertifikat TLS di jaringan ini). Ganti dengan
// @types/jsonwebtoken & @types/bcrypt saat instalasi memungkinkan.

declare module "jsonwebtoken" {
  export interface JwtPayload {
    [key: string]: unknown;
    sub?: string;
    jti?: string;
    exp?: number;
    iat?: number;
    email?: string;
  }

  export interface SignOptions {
    expiresIn?: number | string;
    jwtid?: string;
    [key: string]: unknown;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: SignOptions,
  ): string;

  export function verify(token: string, secretOrPublicKey: string): JwtPayload | string;

  const jwt: { sign: typeof sign; verify: typeof verify };
  export default jwt;
}

declare module "bcrypt" {
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;

  const bcrypt: { hash: typeof hash; compare: typeof compare; genSalt: typeof genSalt };
  export default bcrypt;
}
