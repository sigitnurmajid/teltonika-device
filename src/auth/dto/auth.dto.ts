import { IsEmail, IsNotEmpty, IS_LENGTH, Length } from 'class-validator';

export class AuthDto {
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @Length(7)
  password: string;
}