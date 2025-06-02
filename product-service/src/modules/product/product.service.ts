import { DocumentType } from '@typegoose/typegoose';
import { Product, ProductModel } from './product.model';
import { NotFoundError, AuthorizationError } from '../../common/utils/errors';
import { CreateProductDto, UpdateProductDto } from './product.dto';

export class ProductService {
  async createProduct(productData: CreateProductDto): Promise<DocumentType<Product>> {
    const product = await ProductModel.create(productData);
    return product;
  }

  async getProducts(userId?: string): Promise<DocumentType<Product>[]> {
    const query = userId ? { userId, isActive: true } : { isActive: true };
    return ProductModel.find(query);
  }

  async getProductById(productId: string): Promise<DocumentType<Product>> {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async updateProduct(
    productId: string,
    userId: string,
    updateData: UpdateProductDto
  ): Promise<DocumentType<Product>> {
    const product = await this.getProductById(productId);

    // Check if the user owns the product
    if (product.userId !== userId) {
      throw new AuthorizationError('Not authorized to update this product');
    }

    Object.assign(product, updateData);
    await product.save();

    return product;
  }

  async deleteProduct(productId: string, userId: string): Promise<void> {
    const product = await this.getProductById(productId);

    // Check if the user owns the product
    if (product.userId !== userId) {
      throw new AuthorizationError('Not authorized to delete this product');
    }

    await ProductModel.findByIdAndDelete(productId);
  }

  // Method to handle user deletion event
  async handleUserDeleted(userId: string): Promise<void> {
    await ProductModel.deleteMany({ userId });
  }
}

export default new ProductService();