import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: string };
    file?: Express.Multer.File;
  }
}
