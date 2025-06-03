import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import userService from './user.service';
import { ValidationError } from '../../common/utils/errors';
import { DocumentType } from '@typegoose/typegoose';
import { User } from './user.model';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        status: 'success',
        data: user.toPublicProfile(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      const user = await userService.getUserById(req.user.id);
      res.status(200).json({
        status: 'success',
        data: user.toPublicProfile(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      const user = await userService.updateUser(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        data: user.toPublicProfile(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      await userService.deleteUser(req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Admin routes
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: users.map((user: DocumentType<User>) => user.toPublicProfile()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: user.toPublicProfile(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: user.toPublicProfile(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();