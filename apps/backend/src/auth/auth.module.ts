import { Module } from '@nestjs/common'
import {UsersModule} from "../users/users.module.js";
import {AuthController} from "./auth.controller.js";
import {AuthService} from "./auth.service.js";
import { JwtModule } from '@nestjs/jwt'
import {JwtAccessStrategy} from "./strategies/jwt-access.strategy.js";
import {JwtRefreshStrategy} from "./strategies/jwt-refresh.strategy.js";



@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}