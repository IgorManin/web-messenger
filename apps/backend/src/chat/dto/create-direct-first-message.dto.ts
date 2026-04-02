import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateDirectFirstMessageDto {
  @IsInt()
  @Min(1)
  targetUserId!: number;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  clientMessageId?: string;
}
