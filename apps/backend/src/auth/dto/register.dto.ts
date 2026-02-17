import { IsString, MinLength } from 'class-validator'

export class RegisterDto {
    @IsString({message: 'Поле должно быть строкой'})
    @MinLength(3, {message: 'Имя должно иметь больше 3 символов, если вы не Яо Минг'})
    login!: string

    @IsString({message: 'Пароль должен быть строкой'})
    @MinLength(6, {message: 'Пароль должен содержать более 6 символов'})
    password!: string
}