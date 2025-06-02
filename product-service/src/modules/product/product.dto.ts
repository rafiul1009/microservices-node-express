export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  userId: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}