import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoxService } from './box.service';
import { Box } from './entities/box.entity';
import { BoxSlot } from './entities/box-slot.entity';
import { UserPokemon } from '../collection/entities/user-pokemon.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeBox(overrides: Partial<Box> = {}): Box {
  return Object.assign(new Box(), {
    id: 'box-1',
    userId: 'user-1',
    name: 'Box 1',
    position: 0,
    wallpaper: null,
    ...overrides,
  });
}

function makePokemon(overrides: Partial<UserPokemon> = {}): UserPokemon {
  return Object.assign(new UserPokemon(), {
    id: 'pkmn-1',
    userId: 'user-1',
    ...overrides,
  });
}

// ── BoxService unit tests ─────────────────────────────────────────────────────

describe('BoxService', () => {
  let service: BoxService;

  const mockBoxRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSlotRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPokemonRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoxService,
        { provide: getRepositoryToken(Box), useValue: mockBoxRepo },
        { provide: getRepositoryToken(BoxSlot), useValue: mockSlotRepo },
        { provide: getRepositoryToken(UserPokemon), useValue: mockPokemonRepo },
      ],
    }).compile();

    service = module.get<BoxService>(BoxService);
  });

  // ── deleteBox ────────────────────────────────────────────────────────────────

  describe('deleteBox', () => {
    it('throws when box has Pokémon', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3), // 3 filled slots
      };
      mockSlotRepo.createQueryBuilder.mockReturnValue(mockQb);

      await expect(service.deleteBox('user-1', 'box-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deletes an empty box', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      mockBoxRepo.remove.mockResolvedValue(undefined);

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      mockSlotRepo.createQueryBuilder.mockReturnValue(mockQb);

      await expect(service.deleteBox('user-1', 'box-1')).resolves.not.toThrow();
      expect(mockBoxRepo.remove).toHaveBeenCalled();
    });

    it('throws ForbiddenException for a box owned by another user', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(
        makeBox({ userId: 'other-user' }),
      );
      await expect(service.deleteBox('user-1', 'box-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when box does not exist', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(null);
      await expect(service.deleteBox('user-1', 'missing-box')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── placePokemon ─────────────────────────────────────────────────────────────

  describe('placePokemon', () => {
    it('throws when slot position is below 0', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      await expect(
        service.placePokemon('user-1', 'box-1', {
          slotPosition: -1,
          userPokemonId: 'pkmn-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when slot position is above 29', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      await expect(
        service.placePokemon('user-1', 'box-1', {
          slotPosition: 30,
          userPokemonId: 'pkmn-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('places a Pokémon in an empty slot', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      mockPokemonRepo.findOneBy.mockResolvedValue(makePokemon());
      mockSlotRepo.findOne
        .mockResolvedValueOnce(null) // not already slotted
        .mockResolvedValueOnce(null); // target slot is empty
      const newSlot = Object.assign(new BoxSlot(), {
        boxId: 'box-1',
        slotPosition: 5,
        userPokemonId: 'pkmn-1',
      });
      mockSlotRepo.create.mockReturnValue(newSlot);
      mockSlotRepo.save.mockResolvedValue(newSlot);

      const result = await service.placePokemon('user-1', 'box-1', {
        slotPosition: 5,
        userPokemonId: 'pkmn-1',
      });

      expect(result.userPokemonId).toBe('pkmn-1');
      expect(result.slotPosition).toBe(5);
    });

    it('swaps Pokémon when target slot is occupied', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      mockPokemonRepo.findOneBy.mockResolvedValue(
        makePokemon({ id: 'pkmn-1' }),
      );

      // pkmn-1 is currently in slot 0
      const sourceSlot = Object.assign(new BoxSlot(), {
        boxId: 'box-1',
        slotPosition: 0,
        userPokemonId: 'pkmn-1',
      });
      // slot 5 is occupied by pkmn-2
      const targetSlot = Object.assign(new BoxSlot(), {
        boxId: 'box-1',
        slotPosition: 5,
        userPokemonId: 'pkmn-2',
      });

      mockSlotRepo.findOne
        .mockResolvedValueOnce(sourceSlot) // already slotted check
        .mockResolvedValueOnce(targetSlot); // target slot

      mockSlotRepo.save
        .mockResolvedValueOnce({ ...sourceSlot, userPokemonId: null }) // clear source
        .mockResolvedValueOnce({ ...sourceSlot, userPokemonId: 'pkmn-2' }) // swap back
        .mockResolvedValueOnce({ ...targetSlot, userPokemonId: 'pkmn-1' }); // place in target

      const result = await service.placePokemon('user-1', 'box-1', {
        slotPosition: 5,
        userPokemonId: 'pkmn-1',
      });

      expect(result.userPokemonId).toBe('pkmn-1');
      // The source slot should have been updated to hold pkmn-2
      expect(mockSlotRepo.save).toHaveBeenCalledTimes(3);
    });

    it('throws ForbiddenException when Pokémon belongs to another user', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());
      mockPokemonRepo.findOneBy.mockResolvedValue(
        makePokemon({ userId: 'other-user' }),
      );

      await expect(
        service.placePokemon('user-1', 'box-1', {
          slotPosition: 0,
          userPokemonId: 'pkmn-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('clears a slot when userPokemonId is null', async () => {
      mockBoxRepo.findOneBy.mockResolvedValue(makeBox());

      const existingSlot = Object.assign(new BoxSlot(), {
        boxId: 'box-1',
        slotPosition: 3,
        userPokemonId: 'pkmn-1',
      });
      mockSlotRepo.findOne.mockResolvedValue(existingSlot);
      mockSlotRepo.save.mockResolvedValue({
        ...existingSlot,
        userPokemonId: null,
      });

      await service.placePokemon('user-1', 'box-1', {
        slotPosition: 3,
        userPokemonId: null,
      });

      expect(mockSlotRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ userPokemonId: null }),
      );
    });
  });
});
