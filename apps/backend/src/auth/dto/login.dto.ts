import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  login!: string;

  @IsString()
  // todo заменить потом на 4
  @MinLength(1)
  password!: string;
}
