import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
