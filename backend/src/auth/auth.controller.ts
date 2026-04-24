import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { SupabaseJwtPayload } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  async sync(@CurrentUser() user: SupabaseJwtPayload) {
    return this.authService.syncUser(user.sub);
  }

  @Get('me')
  async me(@CurrentUser() user: SupabaseJwtPayload) {
    return this.authService.syncUser(user.sub);
  }
}
