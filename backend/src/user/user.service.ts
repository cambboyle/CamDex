import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly repo: Repository<UserProfile>,
  ) {}

  async findOrCreate(supabaseUserId: string): Promise<UserProfile> {
    const existing = await this.repo.findOne({ where: { id: supabaseUserId } });
    if (existing) return existing;
    const profile = this.repo.create({ id: supabaseUserId });
    return this.repo.save(profile);
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateUsername(id: string, username: string): Promise<UserProfile> {
    await this.repo.update(id, { username });
    return this.repo.findOneOrFail({ where: { id } });
  }
}
