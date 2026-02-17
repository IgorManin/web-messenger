import { Body, Controller, Post } from '@nestjs/common'
import {RegisterDto} from "./dto/register.dto.js";
import {AuthService} from "./auth.service.js";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.login, dto.password)
    }
}