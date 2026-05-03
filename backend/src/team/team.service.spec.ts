import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamService } from './team.service';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTeam(overrides: Partial<Team> = {}): Team {
  return Object.assign(new Team(), {
    id: 'team-1',
    userId: 'user-1',
    name: 'Test Team',
    game: 'scarlet-violet',
    battleFormat: 'singles',
    notes: null,
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

// ── TeamService unit tests ────────────────────────────────────────────────────

describe('TeamService', () => {
  let service: TeamService;

  const mockTeamRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockMemberRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getRepositoryToken(Team), useValue: mockTeamRepo },
        { provide: getRepositoryToken(TeamMember), useValue: mockMemberRepo },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  // ── Slot boundary ────────────────────────────────────────────────────────────

  describe('upsertMember — slot validation', () => {
    it('throws when slot is 0 (below minimum)', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 0, { evHp: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when slot is 7 (above maximum)', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 7, { evHp: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts slot 1', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam());
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, {}),
      ).resolves.not.toThrow();
    });

    it('accepts slot 6', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam());
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 6 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 6, {}),
      ).resolves.not.toThrow();
    });
  });

  // ── Standard EV validation (max 252 / total 508) ─────────────────────────────

  describe('upsertMember — standard game EV limits', () => {
    const standardTeam = () => makeTeam({ game: 'scarlet-violet' });

    it('rejects a single EV stat above 252', async () => {
      mockTeamRepo.findOne.mockResolvedValue(standardTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 1, { evHp: 253 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects total EVs above 508', async () => {
      mockTeamRepo.findOne.mockResolvedValue(standardTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 1, {
          evHp: 252,
          evAtk: 252,
          evSpe: 8, // 512 total
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts maximum valid spread (252/252/4 = 508)', async () => {
      mockTeamRepo.findOne.mockResolvedValue(standardTeam());
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, {
          evHp: 252,
          evAtk: 252,
          evSpe: 4, // 508 total
        }),
      ).resolves.not.toThrow();
    });

    it('accepts all-zero EVs', async () => {
      mockTeamRepo.findOne.mockResolvedValue(standardTeam());
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, {}),
      ).resolves.not.toThrow();
    });
  });

  // ── Champions SP validation (max 32 / total 66) ───────────────────────────────

  describe('upsertMember — Champions SP limits', () => {
    const champTeam = () => makeTeam({ game: 'champions' });

    it('rejects a single SP stat above 32', async () => {
      mockTeamRepo.findOne.mockResolvedValue(champTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 1, { evHp: 33 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects total SP above 66', async () => {
      mockTeamRepo.findOne.mockResolvedValue(champTeam());
      await expect(
        service.upsertMember('user-1', 'team-1', 1, {
          evHp: 32,
          evAtk: 32,
          evSpe: 3, // 67 total
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts maximum valid Champions spread (32/32/2 = 66)', async () => {
      mockTeamRepo.findOne.mockResolvedValue(champTeam());
      mockMemberRepo.find.mockResolvedValue([]); // Item Clause check
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, {
          evHp: 32,
          evAtk: 32,
          evSpe: 2, // 66 total
        }),
      ).resolves.not.toThrow();
    });

    it('allows up to 252 per stat in a standard game (not champions)', async () => {
      // 32 should be fine for scarlet-violet — the Champions limit should not apply
      mockTeamRepo.findOne.mockResolvedValue(standardTeam());
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, { evHp: 32, evAtk: 252 }),
      ).resolves.not.toThrow();

      function standardTeam() {
        return makeTeam({ game: 'scarlet-violet' });
      }
    });
  });

  // ── Item Clause (Champions only) ─────────────────────────────────────────────

  describe('upsertMember — Item Clause', () => {
    it('rejects a duplicate held item on a different slot', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam({ game: 'champions' }));
      // Slot 2 already holds the same item
      mockMemberRepo.find.mockResolvedValue([
        Object.assign(new TeamMember(), { slot: 2, heldItem: 'life-orb' }),
      ]);
      await expect(
        service.upsertMember('user-1', 'team-1', 1, { heldItem: 'life-orb' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows updating the item on the same slot', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam({ game: 'champions' }));
      // Existing member on slot 1 holds the item — same slot should be OK
      mockMemberRepo.find.mockResolvedValue([
        Object.assign(new TeamMember(), { slot: 1, heldItem: 'life-orb' }),
      ]);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1, heldItem: 'life-orb' });
      mockMemberRepo.findOne.mockResolvedValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await expect(
        service.upsertMember('user-1', 'team-1', 1, { heldItem: 'life-orb' }),
      ).resolves.not.toThrow();
    });

    it('does not enforce Item Clause in non-Champions games', async () => {
      mockTeamRepo.findOne.mockResolvedValue(makeTeam({ game: 'scarlet-violet' }));
      // Even if another slot has the same item, it should be allowed
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = Object.assign(new TeamMember(), { teamId: 'team-1', slot: 1 });
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      // mockMemberRepo.find should NOT be called for non-champions games
      await service.upsertMember('user-1', 'team-1', 1, { heldItem: 'life-orb' });
      expect(mockMemberRepo.find).not.toHaveBeenCalled();
    });
  });

  // ── assertOwner ─────────────────────────────────────────────────────────────

  describe('assertOwner', () => {
    it('throws NotFoundException when team does not exist', async () => {
      mockTeamRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'ghost-team')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when team belongs to another user', async () => {
      // findOne (for assertOwner in remove) returns a team owned by another user
      mockTeamRepo.findOne.mockResolvedValue(makeTeam({ userId: 'other-user' }));
      await expect(service.remove('user-1', 'team-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
