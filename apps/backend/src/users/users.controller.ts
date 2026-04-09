import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { JwtAccessGuard } from "../auth/guards/jwt-access.guard.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SearchUsersDto } from "./dto/search-users.dto.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

type CurrentAuthUser = {
  id: number;
  login: string;
};

@UseGuards(JwtAccessGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: CurrentAuthUser) {
    return this.usersService.findById(user.id);
  }

  @Get("search")
  searchUsers(
    @Query() queryDto: SearchUsersDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const login = queryDto.login?.trim();

    if (!login) {
      return [];
    }

    return this.usersService.searchUsers(login, user.id);
  }

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          cb(
            new BadRequestException("Допустимы только JPG, PNG и WEBP"),
            false,
          );
          return;
        }

        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    if (!file) {
      throw new BadRequestException("Файл не передан");
    }

    const avatarUrl = await this.cloudinaryService.uploadAvatar(file, user.id);

    const updatedUser = await this.usersService.updateAvatar(
      user.id,
      avatarUrl,
    );

    return {
      message: "Аватар обновлен",
      avatarUrl: updatedUser.avatarUrl,
      user: updatedUser,
    };
  }
}
