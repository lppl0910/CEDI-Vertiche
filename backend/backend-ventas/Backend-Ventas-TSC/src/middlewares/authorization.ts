import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

class AuthMiddleware {

  private static _instance: AuthMiddleware;
  public static get instance(): AuthMiddleware {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  // Arrow function — clave para que Express maneje el async correctamente
  // y para que no se pierda el contexto de 'this' al pasarlo como middleware
  public verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          code: 'NoTokenFound',
          message: 'The token is not present in the request',
        });
        return;
      }

      const token = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        res.status(401).json({
          code: 'InvalidTokenException',
          message: 'The token is not valid',
        });
        return;
      }

      req.user  = data.user;
      req.token = token;
      next();

    } catch (err) {
      res.status(401).json({
        code: 'InvalidTokenException',
        message: 'Error al validar el token',
      });
    }
  };
}

export default AuthMiddleware;