import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { TokenModule } from '../token/token.module.js'
import { AuthRepository } from './auth.repository.js'
import { AUTH_REPOSITORY } from './auth.repository.interface.js'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy.js'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js'

@Module({
  imports: [UsersModule, TokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_REPOSITORY, useClass: AuthRepository },
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
