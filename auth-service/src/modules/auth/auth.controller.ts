import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../common/utils/errors';
import authService from './auth.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        status: 'success',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();