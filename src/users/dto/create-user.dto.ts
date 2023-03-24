import { IsEmail, IsNotEmpty , Length} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @Length(7)
  password: string;

  refreshToken: string;
}
