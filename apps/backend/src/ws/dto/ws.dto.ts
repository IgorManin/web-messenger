import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class ChatJoinDto {
  @IsString()
  @Transform(({ value }) => String(value))
  chatId!: string
}

export class SendMessageDto {
  @IsString()
  @Transform(({ value }) => String(value))
  chatId!: string

  @IsString()
  @MaxLength(4000, { message: 'Сообщение не может быть длиннее 4000 символов' })
  text!: string

  @IsString()
  @IsOptional()
  clientMessageId?: string
}

export class TypingUpdateDto {
  @IsString()
  @Transform(({ value }) => String(value))
  chatId!: string

  @IsBoolean()
  isTyping!: boolean
}

export class ChatReadDto {
  @IsString()
  @Transform(({ value }) => String(value))
  chatId!: string
}
