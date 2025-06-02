import { Request, Response, NextFunction } from 'express';
import productService from './product.service';
import { ValidationError } from '../../common/utils/errors';
import { AuthRequest } from '@/common/middlewares/auth.middleware';

export class ProductController {
  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      const productData = {
        ...req.body,
        userId: req.user.id,
      };

      const product = await productService.createProduct(productData);

      res.status(201).json({
        status: 'success',
        data: product.toPublicProduct(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // If user is admin, they can see all products
      // Otherwise, users can only see their own products
      const userId = req.user?.role === 'admin' ? undefined : req.user?.id;
      const products = await productService.getProducts(userId);

      res.status(200).json({
        status: 'success',
        data: products.map(product => product.toPublicProduct()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: product.toPublicProduct(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      const product = await productService.updateProduct(
        req.params.id,
        req.user.id,
        req.body
      );

      res.status(200).json({
        status: 'success',
        data: product.toPublicProduct(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new ValidationError('User ID not found in request');
      }

      await productService.deleteProduct(req.params.id, req.user.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();