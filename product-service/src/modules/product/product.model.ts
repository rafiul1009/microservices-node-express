import { prop, getModelForClass, Ref } from '@typegoose/typegoose';

export class Product {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public description!: string;

  @prop({ required: true, min: 0 })
  public price!: number;

  @prop({ required: true })
  public userId!: string;

  @prop({ default: true })
  public isActive?: boolean;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;

  // Method to get public product data
  public toPublicProduct() {
    return {
      id: this._id,
      name: this.name,
      description: this.description,
      price: this.price,
      userId: this.userId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const ProductModel = getModelForClass(Product);