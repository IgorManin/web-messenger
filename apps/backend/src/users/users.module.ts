import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { UsersService } from "./users.service.js";
import { UsersController } from "./users.controller.js";
import { CloudinaryModule } from "../cloudinary/cloudinary.module.js";

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
