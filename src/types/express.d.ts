export {};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        email: string;
        jti: string;
        exp: number;
      };
    }
  }
}
