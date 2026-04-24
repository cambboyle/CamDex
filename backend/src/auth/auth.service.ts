import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserProfile } from '../user/entities/user-profile.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async syncUser(supabaseUserId: string): Promise<UserProfile> {
    return this.userService.findOrCreate(supabaseUserId);
  }
}
