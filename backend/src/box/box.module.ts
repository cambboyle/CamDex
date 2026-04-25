import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Box } from './entities/box.entity';
import { BoxSlot } from './entities/box-slot.entity';
import { UserPokemon } from '../collection/entities/user-pokemon.entity';
import { BoxService } from './box.service';
import { BoxController } from './box.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Box, BoxSlot, UserPokemon])],
  providers: [BoxService],
  controllers: [BoxController],
  exports: [BoxService],
})
export class BoxModule {}
