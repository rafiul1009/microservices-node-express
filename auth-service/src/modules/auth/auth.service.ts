import jwt, { SignOptions } from 'jsonwebtoken';
import { DocumentType } from '@typegoose/typegoose';
import config from '@/config';
import { ValidationError } from '@/common/utils/errors';
import userService from '../user/user.service';
import { User } from '../user/user.model';
import { TokenPayload, LoginResponse, TokenResponse } from './auth.dto';

export class AuthService {
  private generateAccessToken(payload: TokenPayload): string {
    if (!config.jwt.accessSecret) {
      throw new Error('JWT access secret is not defined');
    }
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiration,
    } as SignOptions);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    if (!config.jwt.refreshSecret || !config.jwt.refreshExpiration) {
      throw new Error('JWT refresh secret is not defined');
    }
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration,
    } as SignOptions);
  }

  private generateAuthTokens(user: DocumentType<User>) {
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await userService.validateCredentials(email, password);
    const tokens = this.generateAuthTokens(user);

    return {
      user: user.toPublicProfile(),
      tokens,
    };
  }

  async refreshToken(token: string): Promise<TokenResponse> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
      const user = await userService.getUserById(decoded.id);

      return this.generateAuthTokens(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ValidationError('Refresh token expired');
      }
      throw new ValidationError('Invalid refresh token');
    }
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ValidationError('Access token expired');
      }
      throw new ValidationError('Invalid access token');
    }
  }
}

export default new AuthService();