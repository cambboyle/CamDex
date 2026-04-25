import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BoxService } from './box.service';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { MovePokemonDto } from './dto/move-pokemon.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SupabaseJwtPayload } from '../auth/auth.guard';

@Controller('boxes')
export class BoxController {
  constructor(private readonly boxService: BoxService) {}

  @Get()
  getBoxes(@CurrentUser() user: SupabaseJwtPayload) {
    return this.boxService.getBoxes(user.sub);
  }

  @Post()
  createBox(@CurrentUser() user: SupabaseJwtPayload, @Body() dto: CreateBoxDto) {
    return this.boxService.createBox(user.sub, dto);
  }

  @Patch(':id')
  updateBox(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBoxDto,
  ) {
    return this.boxService.updateBox(user.sub, id, dto);
  }

  @Delete(':id')
  deleteBox(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.boxService.deleteBox(user.sub, id);
  }

  @Get(':id/slots')
  getSlots(@CurrentUser() user: SupabaseJwtPayload, @Param('id') id: string) {
    return this.boxService.getSlots(user.sub, id);
  }

  @Post(':id/slots')
  placePokemon(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: MovePokemonDto,
  ) {
    return this.boxService.placePokemon(user.sub, id, dto);
  }

  @Delete(':id/slots/:slotPosition')
  clearSlot(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Param('slotPosition', ParseIntPipe) slotPosition: number,
  ) {
    return this.boxService.clearSlot(user.sub, id, slotPosition);
  }
}
