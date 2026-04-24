import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SupabaseJwtPayload } from '../auth/auth.guard';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  getCollection(@CurrentUser() user: SupabaseJwtPayload) {
    return this.collectionService.getCollection(user.sub);
  }

  @Get('living-dex')
  getLivingDex(@CurrentUser() user: SupabaseJwtPayload) {
    return this.collectionService.getLivingDex(user.sub);
  }

  @Post()
  addToCollection(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: AddPokemonDto,
  ) {
    return this.collectionService.addToCollection(user.sub, dto);
  }

  @Patch(':id')
  updatePokemon(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePokemonDto,
  ) {
    return this.collectionService.updatePokemon(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePokemon(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
  ) {
    return this.collectionService.removePokemon(user.sub, id);
  }
}
