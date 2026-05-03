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
  Query,
} from '@nestjs/common';
import { DexService } from './dex.service';
import { CreateDexDto } from './dto/create-dex.dto';
import { UpdateDexDto } from './dto/update-dex.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SupabaseJwtPayload } from '../auth/auth.guard';

@Controller('dex')
export class DexController {
  constructor(private readonly dexService: DexService) {}

  @Get()
  findAll(@CurrentUser() user: SupabaseJwtPayload) {
    return this.dexService.findAll(user.sub);
  }

  @Post()
  create(@CurrentUser() user: SupabaseJwtPayload, @Body() dto: CreateDexDto) {
    return this.dexService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDexDto,
  ) {
    return this.dexService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.dexService.remove(user.sub, id);
  }

  @Get(':id/page')
  getPage(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.dexService.getPage(user.sub, id, page);
  }

  @Get(':id/all')
  getAll(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.dexService.getAll(user.sub, id);
  }

  @Get(':id/stats')
  getStats(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.dexService.getStats(user.sub, id);
  }

  /** Check caught status for a set of form IDs in this dex.
   *  GET /dex/:id/entries/check?formIds=uuid1,uuid2,...
   *  Returns { [formId]: boolean }
   */
  @Get(':id/entries/check')
  checkCaught(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Query('formIds') formIds: string,
  ) {
    const ids = (formIds ?? '').split(',').filter(Boolean);
    return this.dexService.checkCaught(user.sub, id, ids);
  }

  @Post(':id/entries/:formId')
  @HttpCode(HttpStatus.NO_CONTENT)
  markCaught(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Param('formId') formId: string,
  ) {
    return this.dexService.markCaught(user.sub, id, formId);
  }

  @Delete(':id/entries/:formId')
  @HttpCode(HttpStatus.NO_CONTENT)
  markUncaught(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Param('formId') formId: string,
  ) {
    return this.dexService.markUncaught(user.sub, id, formId);
  }
}
