import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { DexService, buildFormConditions } from './dex.service';
import { Dex } from './entities/dex.entity';
import { DexEntry } from './entities/dex-entry.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDex(overrides: Partial<Dex> = {}): Dex {
  return Object.assign(new Dex(), {
    id: 'dex-1',
    userId: 'user-1',
    name: 'Test Dex',
    game: 'home',
    isShiny: false,
    includeForms: false,
    includeCosmeticForms: false,
    entries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

// ── buildFormConditions (pure function) ───────────────────────────────────────

describe('buildFormConditions', () => {
  it('species-only: includes is_battle_only=FALSE and is_default=TRUE', () => {
    const conds = buildFormConditions(makeDex({ includeForms: false }));
    expect(conds).toContain('f.is_battle_only = FALSE');
    expect(conds).toContain('f.is_default = TRUE');
    expect(conds).toHaveLength(2);
  });

  it('alt-forms, no cosmetics: allows default OR non-cosmetic form', () => {
    const conds = buildFormConditions(
      makeDex({ includeForms: true, includeCosmeticForms: false }),
    );
    expect(conds).toContain('f.is_battle_only = FALSE');
    expect(conds).toContain(
      '(f.is_default = TRUE OR f.is_cosmetic_only = FALSE)',
    );
    expect(conds).toHaveLength(2);
  });

  it('all forms incl. cosmetics: only excludes battle-only forms', () => {
    const conds = buildFormConditions(
      makeDex({ includeForms: true, includeCosmeticForms: true }),
    );
    expect(conds).toHaveLength(1);
    expect(conds[0]).toBe('f.is_battle_only = FALSE');
  });
});

// ── DexService unit tests ─────────────────────────────────────────────────────

describe('DexService', () => {
  let service: DexService;

  const mockDexRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntryRepo = {
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DexService,
        { provide: getRepositoryToken(Dex), useValue: mockDexRepo },
        { provide: getRepositoryToken(DexEntry), useValue: mockEntryRepo },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DexService>(DexService);
  });

  // ── assertOwner ─────────────────────────────────────────────────────────────

  describe('assertOwner', () => {
    it('throws NotFoundException when dex does not exist', async () => {
      mockDexRepo.findOne.mockResolvedValue(null);
      await expect(service.getStats('user-1', 'missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when dex belongs to another user', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex({ userId: 'other-user' }));
      await expect(service.getStats('user-1', 'dex-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('sets defaults when optional fields are omitted', async () => {
      const dex = makeDex();
      mockDexRepo.create.mockReturnValue(dex);
      mockDexRepo.save.mockResolvedValue(dex);

      await service.create('user-1', { name: 'My Dex' });

      expect(mockDexRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          game: 'home',
          isShiny: false,
          includeForms: false,
          includeCosmeticForms: false,
        }),
      );
    });

    it('passes through provided flags', async () => {
      const dex = makeDex({
        isShiny: true,
        includeForms: true,
        includeCosmeticForms: true,
      });
      mockDexRepo.create.mockReturnValue(dex);
      mockDexRepo.save.mockResolvedValue(dex);

      await service.create('user-1', {
        name: 'Shiny Dex',
        isShiny: true,
        includeForms: true,
        includeCosmeticForms: true,
      });

      expect(mockDexRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isShiny: true,
          includeForms: true,
          includeCosmeticForms: true,
        }),
      );
    });
  });

  // ── markCaught / markUncaught ────────────────────────────────────────────────

  describe('markCaught', () => {
    it('upserts a dex entry with orIgnore', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());

      const mockQb = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      mockEntryRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.markCaught('user-1', 'dex-1', 'form-abc');

      expect(mockQb.values).toHaveBeenCalledWith({
        dexId: 'dex-1',
        formId: 'form-abc',
      });
      expect(mockQb.orIgnore).toHaveBeenCalled();
    });
  });

  describe('markUncaught', () => {
    it('deletes the dex entry', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockEntryRepo.delete.mockResolvedValue({ affected: 1 });

      await service.markUncaught('user-1', 'dex-1', 'form-abc');

      expect(mockEntryRepo.delete).toHaveBeenCalledWith({
        dexId: 'dex-1',
        formId: 'form-abc',
      });
    });
  });

  // ── computeStats (via getStats) ───────────────────────────────────────────────

  describe('getStats', () => {
    it('returns parsed total, caught, and completionPercent', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockDataSource.query.mockResolvedValue([{ total: '200', caught: '50' }]);

      const result = await service.getStats('user-1', 'dex-1');

      expect(result.total).toBe(200);
      expect(result.caught).toBe(50);
      expect(result.completionPercent).toBe(25);
    });

    it('returns 0% when total is 0', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockDataSource.query.mockResolvedValue([{ total: '0', caught: '0' }]);

      const result = await service.getStats('user-1', 'dex-1');

      expect(result.completionPercent).toBe(0);
    });
  });

  // ── checkCaught ───────────────────────────────────────────────────────────────

  describe('checkCaught', () => {
    it('returns an empty object when formIds array is empty', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());

      const result = await service.checkCaught('user-1', 'dex-1', []);
      expect(result).toEqual({});
      expect(mockEntryRepo.find).not.toHaveBeenCalled();
    });

    it('returns true for caught forms and false for uncaught forms', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      // Only form-a is in the dex entries
      mockEntryRepo.find.mockResolvedValue([{ formId: 'form-a' }]);

      const result = await service.checkCaught('user-1', 'dex-1', [
        'form-a',
        'form-b',
        'form-c',
      ]);

      expect(result).toEqual({
        'form-a': true,
        'form-b': false,
        'form-c': false,
      });
    });

    it('returns all true when every form is caught', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockEntryRepo.find.mockResolvedValue([
        { formId: 'form-a' },
        { formId: 'form-b' },
      ]);

      const result = await service.checkCaught('user-1', 'dex-1', [
        'form-a',
        'form-b',
      ]);

      expect(result).toEqual({ 'form-a': true, 'form-b': true });
    });

    it('returns all false when no forms are caught', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockEntryRepo.find.mockResolvedValue([]);

      const result = await service.checkCaught('user-1', 'dex-1', [
        'form-x',
        'form-y',
      ]);

      expect(result).toEqual({ 'form-x': false, 'form-y': false });
    });

    it('queries with all provided formId conditions', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex());
      mockEntryRepo.find.mockResolvedValue([]);

      await service.checkCaught('user-1', 'dex-1', ['form-a', 'form-b']);

      expect(mockEntryRepo.find).toHaveBeenCalledWith({
        where: [
          { dexId: 'dex-1', formId: 'form-a' },
          { dexId: 'dex-1', formId: 'form-b' },
        ],
        select: ['formId'],
      });
    });

    it('throws ForbiddenException for a dex owned by another user', async () => {
      mockDexRepo.findOne.mockResolvedValue(makeDex({ userId: 'other-user' }));
      await expect(
        service.checkCaught('user-1', 'dex-1', ['form-a']),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
