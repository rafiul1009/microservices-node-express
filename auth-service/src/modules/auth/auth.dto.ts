import { DocumentType } from '@typegoose/typegoose';
import { User } from '../user/user.model';

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  user: ReturnType<DocumentType<User>['toPublicProfile']>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}