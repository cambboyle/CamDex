import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpsertTeamMemberDto } from './dto/upsert-team-member.dto';

/** Games that use SP instead of EVs */
const CHAMPIONS_GAMES = new Set(['champions']);

/** Per-game EV/SP limits */
function getEvLimits(game: string) {
  return CHAMPIONS_GAMES.has(game)
    ? { max: 32, total: 66 }
    : { max: 252, total: 508 };
}

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,
  ) {}

  // ── Teams CRUD ──────────────────────────────────────────────────────────

  findAll(userId: string): Promise<Team[]> {
    return this.teamRepo.find({
      where: { userId },
      relations: ['members', 'members.form', 'members.form.species'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: { id: teamId, userId },
      relations: ['members', 'members.form', 'members.form.species'],
      order: { members: { slot: 'ASC' } },
    });
    if (!team) throw new NotFoundException(`Team ${teamId} not found`);
    return team;
  }

  async create(userId: string, dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepo.create({
      userId,
      name: dto.name,
      game: dto.game,
      battleFormat: dto.battleFormat ?? 'singles',
      notes: dto.notes ?? null,
    });
    return this.teamRepo.save(team);
  }

  async update(
    userId: string,
    teamId: string,
    dto: UpdateTeamDto,
  ): Promise<Team> {
    const team = await this.assertOwner(userId, teamId);
    Object.assign(team, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.game !== undefined && { game: dto.game }),
      ...(dto.battleFormat !== undefined && { battleFormat: dto.battleFormat }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });
    return this.teamRepo.save(team);
  }

  async remove(userId: string, teamId: string): Promise<void> {
    const team = await this.assertOwner(userId, teamId);
    await this.teamRepo.remove(team);
  }

  // ── Team members ────────────────────────────────────────────────────────

  async upsertMember(
    userId: string,
    teamId: string,
    slot: number,
    dto: UpsertTeamMemberDto,
  ): Promise<TeamMember> {
    const team = await this.assertOwner(userId, teamId);

    if (slot < 1 || slot > 6) {
      throw new BadRequestException('Slot must be between 1 and 6');
    }

    // EV / SP validation
    const limits = getEvLimits(team.game);
    const evStats = [
      dto.evHp ?? 0,
      dto.evAtk ?? 0,
      dto.evDef ?? 0,
      dto.evSpa ?? 0,
      dto.evSpd ?? 0,
      dto.evSpe ?? 0,
    ];
    const statLabel = CHAMPIONS_GAMES.has(team.game) ? 'SP' : 'EV';

    if (evStats.some((v) => v > limits.max)) {
      throw new BadRequestException(
        `Max ${statLabel} per stat is ${limits.max} for ${team.game}`,
      );
    }
    if (evStats.reduce((a, b) => a + b, 0) > limits.total) {
      throw new BadRequestException(
        `Total ${statLabel} cannot exceed ${limits.total} for ${team.game}`,
      );
    }

    // Item Clause for Champions — no two members can hold the same item
    if (CHAMPIONS_GAMES.has(team.game) && dto.heldItem) {
      const existing = await this.memberRepo.find({ where: { teamId } });
      const duplicate = existing.find(
        (m) => m.slot !== slot && m.heldItem === dto.heldItem,
      );
      if (duplicate) {
        throw new BadRequestException(
          `Item Clause: "${dto.heldItem}" is already held by slot ${duplicate.slot}`,
        );
      }
    }

    let member = await this.memberRepo.findOne({ where: { teamId, slot } });
    if (!member) {
      member = this.memberRepo.create({ teamId, slot });
    }

    Object.assign(member, {
      formId: dto.formId ?? member.formId,
      nickname: dto.nickname !== undefined ? dto.nickname : member.nickname,
      isShiny: dto.isShiny ?? member.isShiny,
      heldItem: dto.heldItem !== undefined ? dto.heldItem : member.heldItem,
      ability: dto.ability !== undefined ? dto.ability : member.ability,
      nature: dto.nature !== undefined ? dto.nature : member.nature,
      move1: dto.move1 !== undefined ? dto.move1 : member.move1,
      move2: dto.move2 !== undefined ? dto.move2 : member.move2,
      move3: dto.move3 !== undefined ? dto.move3 : member.move3,
      move4: dto.move4 !== undefined ? dto.move4 : member.move4,
      evHp: dto.evHp ?? member.evHp,
      evAtk: dto.evAtk ?? member.evAtk,
      evDef: dto.evDef ?? member.evDef,
      evSpa: dto.evSpa ?? member.evSpa,
      evSpd: dto.evSpd ?? member.evSpd,
      evSpe: dto.evSpe ?? member.evSpe,
      ivHp: dto.ivHp !== undefined ? dto.ivHp : member.ivHp,
      ivAtk: dto.ivAtk !== undefined ? dto.ivAtk : member.ivAtk,
      ivDef: dto.ivDef !== undefined ? dto.ivDef : member.ivDef,
      ivSpa: dto.ivSpa !== undefined ? dto.ivSpa : member.ivSpa,
      ivSpd: dto.ivSpd !== undefined ? dto.ivSpd : member.ivSpd,
      ivSpe: dto.ivSpe !== undefined ? dto.ivSpe : member.ivSpe,
      teraType: dto.teraType !== undefined ? dto.teraType : member.teraType,
      megaStone: dto.megaStone !== undefined ? dto.megaStone : member.megaStone,
      zCrystal: dto.zCrystal !== undefined ? dto.zCrystal : member.zCrystal,
      dynamaxLevel:
        dto.dynamaxLevel !== undefined ? dto.dynamaxLevel : member.dynamaxLevel,
    });

    return this.memberRepo.save(member);
  }

  async clearMember(
    userId: string,
    teamId: string,
    slot: number,
  ): Promise<void> {
    await this.assertOwner(userId, teamId);
    const member = await this.memberRepo.findOne({ where: { teamId, slot } });
    if (member) await this.memberRepo.remove(member);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async assertOwner(userId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team ${teamId} not found`);
    if (team.userId !== userId) throw new ForbiddenException();
    return team;
  }
}
