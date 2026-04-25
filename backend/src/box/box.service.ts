import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Box } from './entities/box.entity';
import { BoxSlot } from './entities/box-slot.entity';
import { UserPokemon } from '../collection/entities/user-pokemon.entity';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { MovePokemonDto } from './dto/move-pokemon.dto';

@Injectable()
export class BoxService {
  constructor(
    @InjectRepository(Box)
    private readonly boxRepo: Repository<Box>,
    @InjectRepository(BoxSlot)
    private readonly slotRepo: Repository<BoxSlot>,
    @InjectRepository(UserPokemon)
    private readonly pokemonRepo: Repository<UserPokemon>,
  ) {}

  async getBoxes(userId: string): Promise<Box[]> {
    return this.boxRepo.find({
      where: { userId },
      order: { position: 'ASC' },
    });
  }

  async getBox(userId: string, id: string): Promise<Box> {
    const box = await this.boxRepo.findOneBy({ id });
    if (!box) throw new NotFoundException(`Box ${id} not found`);
    if (box.userId !== userId) throw new ForbiddenException();
    return box;
  }

  async createBox(userId: string, dto: CreateBoxDto): Promise<Box> {
    // Find highest position for this user
    const boxes = await this.boxRepo.find({
      where: { userId },
      order: { position: 'DESC' },
      take: 1,
    });
    const nextPosition = boxes.length > 0 ? boxes[0].position + 1 : 0;

    const box = this.boxRepo.create({
      userId,
      name: dto.name,
      position: nextPosition,
      wallpaper: dto.wallpaper ?? null,
    });
    return this.boxRepo.save(box);
  }

  async updateBox(userId: string, id: string, dto: UpdateBoxDto): Promise<Box> {
    const box = await this.getBox(userId, id);
    Object.assign(box, {
      name: dto.name ?? box.name,
      wallpaper: dto.wallpaper !== undefined ? dto.wallpaper : box.wallpaper,
    });
    return this.boxRepo.save(box);
  }

  async deleteBox(userId: string, id: string): Promise<void> {
    const box = await this.getBox(userId, id);

    const filledSlots = await this.slotRepo
      .createQueryBuilder('s')
      .where('s.box_id = :id AND s.user_pokemon_id IS NOT NULL', { id })
      .getCount();

    if (filledSlots > 0) {
      throw new BadRequestException(
        'Cannot delete a box that contains Pokémon',
      );
    }

    await this.boxRepo.remove(box);
  }

  async getSlots(userId: string, boxId: string): Promise<BoxSlot[]> {
    await this.getBox(userId, boxId); // verify ownership
    return this.slotRepo.find({
      where: { boxId },
      relations: ['pokemon', 'pokemon.form', 'pokemon.species'],
      order: { slotPosition: 'ASC' },
    });
  }

  async placePokemon(
    userId: string,
    boxId: string,
    dto: MovePokemonDto,
  ): Promise<BoxSlot> {
    await this.getBox(userId, boxId); // verify ownership

    if (dto.slotPosition < 0 || dto.slotPosition > 29) {
      throw new BadRequestException('Slot position must be 0-29');
    }

    // If clearing a slot
    if (!dto.userPokemonId) {
      const existing = await this.slotRepo.findOne({
        where: { boxId, slotPosition: dto.slotPosition },
      });
      if (existing) {
        existing.userPokemonId = null;
        return this.slotRepo.save(existing);
      }
      // Slot doesn't exist yet, create an empty one
      const slot = this.slotRepo.create({
        boxId,
        slotPosition: dto.slotPosition,
        userPokemonId: null,
      });
      return this.slotRepo.save(slot);
    }

    // Verify the Pokémon belongs to this user
    const pokemon = await this.pokemonRepo.findOneBy({ id: dto.userPokemonId });
    if (!pokemon) throw new NotFoundException(`Pokémon not found`);
    if (pokemon.userId !== userId) throw new ForbiddenException();

    // Check if this Pokémon is already in any slot
    const alreadySlotted = await this.slotRepo.findOne({
      where: { userPokemonId: dto.userPokemonId },
    });
    if (alreadySlotted) {
      // Remove from old slot first (allow move)
      alreadySlotted.userPokemonId = null;
      await this.slotRepo.save(alreadySlotted);
    }

    // Check if the target slot is occupied
    const targetSlot = await this.slotRepo.findOne({
      where: { boxId, slotPosition: dto.slotPosition },
    });

    if (targetSlot) {
      // If occupied, swap: move existing Pokémon back to where ours was
      if (targetSlot.userPokemonId && alreadySlotted) {
        alreadySlotted.userPokemonId = targetSlot.userPokemonId;
        await this.slotRepo.save(alreadySlotted);
      }
      targetSlot.userPokemonId = dto.userPokemonId;
      return this.slotRepo.save(targetSlot);
    }

    // Create new slot
    const slot = this.slotRepo.create({
      boxId,
      slotPosition: dto.slotPosition,
      userPokemonId: dto.userPokemonId,
    });
    return this.slotRepo.save(slot);
  }

  async clearSlot(
    userId: string,
    boxId: string,
    slotPosition: number,
  ): Promise<void> {
    await this.getBox(userId, boxId); // verify ownership

    const slot = await this.slotRepo.findOne({
      where: { boxId, slotPosition },
    });
    if (!slot) return; // already empty

    slot.userPokemonId = null;
    await this.slotRepo.save(slot);
  }
}
