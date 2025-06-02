import { prop, getModelForClass, pre, DocumentType } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import { ValidationError } from '../../common/utils/errors';

@pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
})
export class User {
  @prop({ required: true })
  public firstName!: string;

  @prop({ required: true })
  public lastName!: string;

  @prop({ required: true, unique: true, lowercase: true })
  public email!: string;

  @prop({ required: true, minlength: 6 })
  public password!: string;

  @prop({ default: 'user' })
  public role?: string;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;

  // Instance method to compare password
  public async comparePassword(this: DocumentType<User>, candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw new ValidationError('Error comparing passwords');
    }
  }

  // Instance method to get public profile
  public toPublicProfile(this: DocumentType<User>) {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const UserModel = getModelForClass(User);