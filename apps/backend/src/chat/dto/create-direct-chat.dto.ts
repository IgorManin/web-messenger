import { IsInt, Min } from "class-validator";

export class CreateDirectChatDto {
  @IsInt()
  @Min(1)
  targetUserId!: number;
}
