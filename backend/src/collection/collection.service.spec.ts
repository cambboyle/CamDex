import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionService } from './collection.service';
import { UserPokemon } from './entities/user-pokemon.entity';
import { PokemonForm } from '../pokemon/entities/pokemon-form.entity';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_FORM = {
  id: 'form-1',
  displayName: 'Bulbasaur',
  species: { id: 'species-1' },
}

const MOCK_POKEMON = {
  id: 'up-1',
  userId: 'user-1',
  formId: 'form-1',
  speciesId: 'species-1',
  isShiny: false,
  nickname: null,
  ball: null,
  gender: null,
  gameOfOrigin: null,
  otName: null,
  level: null,
  nature: null,
  notes: null,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
})

// ── CollectionService unit tests ──────────────────────────────────────────────

describe('CollectionService', () => {
  let service: CollectionService;
  let userPokemonRepo: ReturnType<typeof mockRepo>;
  let formRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        { provide: getRepositoryToken(UserPokemon), useValue: mockRepo() },
        { provide: getRepositoryToken(PokemonForm), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
    userPokemonRepo = module.get(getRepositoryToken(UserPokemon));
    formRepo = module.get(getRepositoryToken(PokemonForm));
  });

  // ── getCollection ────────────────────────────────────────────────────────────

  describe('getCollection', () => {
    it('returns result of userPokemonRepo.find with userId filter and relations', async () => {
      userPokemonRepo.find.mockResolvedValue([MOCK_POKEMON]);

      const result = await service.getCollection('user-1');

      expect(userPokemonRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['species', 'form'],
        order: { caughtAt: 'DESC' },
      });
      expect(result).toEqual([MOCK_POKEMON]);
    });
  });

  // ── addToCollection ──────────────────────────────────────────────────────────

  describe('addToCollection', () => {
    it('throws NotFoundException when form not found', async () => {
      formRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addToCollection('user-1', { formId: 'form-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when duplicate exists (same userId, formId, isShiny=false)', async () => {
      formRepo.findOne.mockResolvedValue(MOCK_FORM);
      userPokemonRepo.findOne.mockResolvedValue(MOCK_POKEMON); // duplicate found

      await expect(
        service.addToCollection('user-1', { formId: 'form-1', isShiny: false }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates and returns UserPokemon on success', async () => {
      formRepo.findOne.mockResolvedValue(MOCK_FORM);
      userPokemonRepo.findOne.mockResolvedValue(null); // no duplicate
      userPokemonRepo.create.mockReturnValue(MOCK_POKEMON);
      userPokemonRepo.save.mockResolvedValue(MOCK_POKEMON);

      const result = await service.addToCollection('user-1', { formId: 'form-1' });

      expect(userPokemonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          formId: 'form-1',
          speciesId: 'species-1',
          isShiny: false,
        }),
      );
      expect(userPokemonRepo.save).toHaveBeenCalled();
      expect(result).toEqual(MOCK_POKEMON);
    });

    it('isShiny defaults to false when not provided in dto', async () => {
      formRepo.findOne.mockResolvedValue(MOCK_FORM);
      userPokemonRepo.findOne.mockResolvedValue(null);
      userPokemonRepo.create.mockReturnValue(MOCK_POKEMON);
      userPokemonRepo.save.mockResolvedValue(MOCK_POKEMON);

      await service.addToCollection('user-1', { formId: 'form-1' }); // no isShiny

      // Duplicate check should be called with isShiny=false (the default)
      expect(userPokemonRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', formId: 'form-1', isShiny: false },
      });
      expect(userPokemonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isShiny: false }),
      );
    });

    it('a shiny catch does not conflict with a non-shiny catch of the same form', async () => {
      formRepo.findOne.mockResolvedValue(MOCK_FORM);
      // No shiny duplicate exists
      userPokemonRepo.findOne.mockResolvedValue(null);
      const shinyPokemon = { ...MOCK_POKEMON, id: 'up-2', isShiny: true };
      userPokemonRepo.create.mockReturnValue(shinyPokemon);
      userPokemonRepo.save.mockResolvedValue(shinyPokemon);

      const result = await service.addToCollection('user-1', { formId: 'form-1', isShiny: true });

      // Duplicate check should use isShiny=true, not false
      expect(userPokemonRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', formId: 'form-1', isShiny: true },
      });
      expect(result.isShiny).toBe(true);
    });
  });

  // ── updatePokemon ────────────────────────────────────────────────────────────

  describe('updatePokemon', () => {
    it('throws NotFoundException when pokemon not found', async () => {
      userPokemonRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePokemon('user-1', 'up-1', { nickname: 'Buddy' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when pokemon belongs to different user', async () => {
      userPokemonRepo.findOneBy.mockResolvedValue({ ...MOCK_POKEMON, userId: 'other-user' });

      await expect(
        service.updatePokemon('user-1', 'up-1', { nickname: 'Buddy' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('saves and returns updated pokemon on success', async () => {
      const existingPokemon = { ...MOCK_POKEMON };
      const updatedPokemon = { ...existingPokemon, nickname: 'Buddy' };
      userPokemonRepo.findOneBy.mockResolvedValue(existingPokemon);
      userPokemonRepo.save.mockResolvedValue(updatedPokemon);

      const result = await service.updatePokemon('user-1', 'up-1', { nickname: 'Buddy' });

      expect(userPokemonRepo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedPokemon);
    });
  });

  // ── removePokemon ────────────────────────────────────────────────────────────

  describe('removePokemon', () => {
    it('throws NotFoundException when pokemon not found', async () => {
      userPokemonRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.removePokemon('user-1', 'up-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when pokemon belongs to different user', async () => {
      userPokemonRepo.findOneBy.mockResolvedValue({ ...MOCK_POKEMON, userId: 'other-user' });

      await expect(
        service.removePokemon('user-1', 'up-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('calls userPokemonRepo.remove on success', async () => {
      userPokemonRepo.findOneBy.mockResolvedValue(MOCK_POKEMON);
      userPokemonRepo.remove.mockResolvedValue(undefined);

      await service.removePokemon('user-1', 'up-1');

      expect(userPokemonRepo.remove).toHaveBeenCalledWith(MOCK_POKEMON);
    });
  });
});
