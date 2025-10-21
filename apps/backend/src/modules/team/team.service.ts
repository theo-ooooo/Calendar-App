import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Team } from './entities/team.entity';
import { TeamMember, TeamMemberRole, TeamMemberStatus } from './entities/team-member.entity';
import { User } from '../user/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTeam(userId: string, createTeamDto: CreateTeamDto): Promise<Team> {
    const inviteCode = randomBytes(8).toString('hex');
    
    const team = this.teamRepository.create({
      ...createTeamDto,
      ownerId: userId,
      inviteCode,
    });

    const savedTeam = await this.teamRepository.save(team);

    // 팀 생성자를 관리자로 추가
    await this.addMember(savedTeam.id, userId, TeamMemberRole.ADMIN, TeamMemberStatus.ACCEPTED);

    return savedTeam;
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .where('team.ownerId = :userId', { userId })
      .orWhere('member.userId = :userId', { userId })
      .getMany();

    return teams;
  }

  async getTeamById(id: string, userId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'owner'],
    });

    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }

    // 팀 멤버인지 확인
    const isMember = team.members.some(member => member.userId === userId) || team.ownerId === userId;
    if (!isMember) {
      throw new ForbiddenException('팀에 접근할 권한이 없습니다.');
    }

    return team;
  }

  async updateTeam(id: string, userId: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.getTeamById(id, userId);
    
    // 팀 소유자만 수정 가능
    if (team.ownerId !== userId) {
      throw new ForbiddenException('팀을 수정할 권한이 없습니다.');
    }

    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async deleteTeam(id: string, userId: string): Promise<void> {
    const team = await this.getTeamById(id, userId);
    
    // 팀 소유자만 삭제 가능
    if (team.ownerId !== userId) {
      throw new ForbiddenException('팀을 삭제할 권한이 없습니다.');
    }

    await this.teamRepository.remove(team);
  }

  async joinTeamByCode(inviteCode: string, userId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { inviteCode },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException('유효하지 않은 초대 코드입니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = team.members.find(member => member.userId === userId);
    if (existingMember) {
      throw new ConflictException('이미 팀의 멤버입니다.');
    }

    await this.addMember(team.id, userId, TeamMemberRole.MEMBER, TeamMemberStatus.ACCEPTED);
    return this.getTeamById(team.id, userId);
  }

  async inviteMember(teamId: string, userId: string, inviteMemberDto: InviteMemberDto): Promise<TeamMember> {
    const team = await this.getTeamById(teamId, userId);
    
    // 팀 소유자 또는 관리자만 초대 가능
    const member = team.members.find(m => m.userId === userId);
    if (team.ownerId !== userId && (!member || member.role !== TeamMemberRole.ADMIN)) {
      throw new ForbiddenException('멤버를 초대할 권한이 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { email: inviteMemberDto.email } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = team.members.find(m => m.userId === user.id);
    if (existingMember) {
      throw new ConflictException('이미 팀의 멤버입니다.');
    }

    return this.addMember(teamId, user.id, TeamMemberRole.MEMBER, TeamMemberStatus.PENDING, userId);
  }

  async acceptInvitation(teamId: string, userId: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId, status: TeamMemberStatus.PENDING },
    });

    if (!member) {
      throw new NotFoundException('대기 중인 초대가 없습니다.');
    }

    member.status = TeamMemberStatus.ACCEPTED;
    member.joinedAt = new Date();
    return this.teamMemberRepository.save(member);
  }

  async rejectInvitation(teamId: string, userId: string): Promise<void> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId, status: TeamMemberStatus.PENDING },
    });

    if (!member) {
      throw new NotFoundException('대기 중인 초대가 없습니다.');
    }

    member.status = TeamMemberStatus.REJECTED;
    await this.teamMemberRepository.save(member);
  }

  async removeMember(teamId: string, userId: string, memberId: string): Promise<void> {
    const team = await this.getTeamById(teamId, userId);
    
    // 팀 소유자 또는 관리자만 제거 가능
    const requester = team.members.find(m => m.userId === userId);
    if (team.ownerId !== userId && (!requester || requester.role !== TeamMemberRole.ADMIN)) {
      throw new ForbiddenException('멤버를 제거할 권한이 없습니다.');
    }

    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
    });

    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    // 팀 소유자는 제거할 수 없음
    if (team.ownerId === member.userId) {
      throw new ForbiddenException('팀 소유자는 제거할 수 없습니다.');
    }

    await this.teamMemberRepository.remove(member);
  }

  private async addMember(
    teamId: string,
    userId: string,
    role: TeamMemberRole,
    status: TeamMemberStatus,
    invitedBy?: string,
  ): Promise<TeamMember> {
    const member = this.teamMemberRepository.create({
      teamId,
      userId,
      role,
      status,
      invitedBy,
      invitedAt: status === TeamMemberStatus.PENDING ? new Date() : undefined,
      joinedAt: status === TeamMemberStatus.ACCEPTED ? new Date() : undefined,
    });

    return this.teamMemberRepository.save(member);
  }
}
