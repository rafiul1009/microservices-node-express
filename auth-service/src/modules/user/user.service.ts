import { DocumentType } from '@typegoose/typegoose';
import { User, UserModel } from './user.model';
import { ConflictError, NotFoundError, ValidationError } from '../../common/utils/errors';
import rabbitmq from '../../common/services/rabbitmq';
import { CreateUserDto, UpdateUserDto } from './user.dto';

export class UserService {
  async createUser(userData: CreateUserDto): Promise<DocumentType<User>> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const user = await UserModel.create(userData);

    // Publish user.created event
    await rabbitmq.publishEvent('user.created', user.toPublicProfile());

    return user;
  }

  async getUserById(id: string): Promise<DocumentType<User>> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<DocumentType<User>> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async updateUser(id: string, updateData: UpdateUserDto): Promise<DocumentType<User>> {
    if (updateData.email) {
      const existingUser = await UserModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }
    }

    const user = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Publish user.updated event
    await rabbitmq.publishEvent('user.updated', user.toPublicProfile());

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Publish user.deleted event
    await rabbitmq.publishEvent('user.deleted', { id });
  }

  async validateCredentials(email: string, password: string): Promise<DocumentType<User>> {
    const user = await this.getUserByEmail(email);
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new ValidationError('Invalid credentials');
    }

    return user;
  }
}

export default new UserService();