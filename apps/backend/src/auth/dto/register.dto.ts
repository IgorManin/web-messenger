import { IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(3, {
    message: "Имя должно иметь больше 3 символов, если вы не Яо Минг",
  })
  login!: string;

  @IsString()
  @MinLength(4, { message: "Пароль должен содержать более 4 символов" })
  password!: string;
}
