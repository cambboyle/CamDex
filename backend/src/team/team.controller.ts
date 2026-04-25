import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpsertTeamMemberDto } from './dto/upsert-team-member.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SupabaseJwtPayload } from '../auth/auth.guard';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll(@CurrentUser() user: SupabaseJwtPayload) {
    return this.teamService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.teamService.findOne(user.sub, id);
  }

  @Post()
  create(@CurrentUser() user: SupabaseJwtPayload, @Body() dto: CreateTeamDto) {
    return this.teamService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.teamService.remove(user.sub, id);
  }

  @Put(':id/members/:slot')
  upsertMember(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Param('slot', ParseIntPipe) slot: number,
    @Body() dto: UpsertTeamMemberDto,
  ) {
    return this.teamService.upsertMember(user.sub, id, slot, dto);
  }

  @Delete(':id/members/:slot')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearMember(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Param('slot', ParseIntPipe) slot: number,
  ) {
    return this.teamService.clearMember(user.sub, id, slot);
  }
}
