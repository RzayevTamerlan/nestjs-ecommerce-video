import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  INVALID_EMAIL_MESSAGE,
  INVALID_NAME_MESSAGE,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '../auth.constants';

export class RegisterDto {
  @IsEmail({}, { message: INVALID_EMAIL_MESSAGE })
  email: string;

  @IsString()
  @MinLength(2, { message: INVALID_NAME_MESSAGE })
  name: string;

  @IsString()
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_MESSAGE })
  @MaxLength(30, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  password: string;
}