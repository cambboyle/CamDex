import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dex } from './entities/dex.entity';
import { DexEntry } from './entities/dex-entry.entity';
import { DexService } from './dex.service';
import { DexController } from './dex.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dex, DexEntry])],
  providers: [DexService],
  controllers: [DexController],
})
export class DexModule {}
