import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { JwtAccessGuard } from "../auth/guards/jwt-access.guard.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { SearchUsersDto } from "./dto/search-users.dto.js";

type CurrentAuthUser = {
  id: number;
  login: string;
};

@UseGuards(JwtAccessGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
