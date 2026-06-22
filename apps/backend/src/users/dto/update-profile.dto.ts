import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, {
    message: "Логин должен быть больше 2 символов, если вы не Яо Минг",
  })
  @IsOptional()
  login?: string;

  @IsEmail({}, { message: "Некорректный email" })
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}
