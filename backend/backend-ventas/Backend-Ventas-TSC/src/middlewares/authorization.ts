/**
 * Middleware de autenticación basado en Supabase JWT.
 *
 * Valida el token Bearer presente en el encabezado `Authorization` de cada
 * petición contra la API de Supabase.  Si el token es válido, adjunta el
 * objeto de usuario (`data.user`) a `req.user` y el token crudo a `req.token`
 * para que los controladores puedan acceder al contexto de sesión.
 *
 * Implementado como Singleton para compartir un único cliente de Supabase
 * entre todos los controladores.
 */
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

class AuthMiddleware {

  private static _instance: AuthMiddleware;

  /** Devuelve la única instancia del middleware (patrón Singleton). */
  public static get instance(): AuthMiddleware {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  /**
   * Middleware de Express que verifica el JWT de Supabase.
   *
   * Se define como arrow function para preservar el contexto de `this`
   * cuando Express la invoca fuera del ámbito de la clase.
   *
   * @param req  - Request de Express; recibirá `req.user` y `req.token` si el token es válido.
   * @param res  - Response de Express; devuelve 401 si el token falta o es inválido.
   * @param next - Función para continuar al siguiente middleware o handler.
   */
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