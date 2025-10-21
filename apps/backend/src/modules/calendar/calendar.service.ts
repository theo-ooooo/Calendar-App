import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar, CalendarType } from './entities/calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { TeamMember } from '../team/entities/team-member.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  async createCalendar(userId: string, createCalendarDto: CreateCalendarDto): Promise<Calendar> {
    const calendar = this.calendarRepository.create({
      ...createCalendarDto,
      ownerId: userId,
      type: createCalendarDto.teamId ? CalendarType.TEAM : CalendarType.PERSONAL,
    });

    return this.calendarRepository.save(calendar);
  }

  async getCalendarsByUser(userId: string): Promise<Calendar[]> {
    return this.calendarRepository.find({
      where: { ownerId: userId },
      relations: ['team'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllUserCalendars(userId: string): Promise<Calendar[]> {
    // 개인 캘린더 조회
    const personalCalendars = await this.calendarRepository.find({
      where: { ownerId: userId, type: CalendarType.PERSONAL },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });

    // 사용자가 속한 팀들의 캘린더 조회
    const userTeams = await this.teamMemberRepository.find({
      where: { 
        userId, 
        status: 'accepted' 
      },
      relations: ['team'],
    });

    const teamCalendars = await Promise.all(
      userTeams.map(async (teamMember) => {
        return this.calendarRepository.find({
          where: { teamId: teamMember.team.id },
          relations: ['team', 'owner'],
          order: { createdAt: 'DESC' },
        });
      })
    );

    // 모든 캘린더를 하나의 배열로 합치기
    const allCalendars = [
      ...personalCalendars,
      ...teamCalendars.flat(),
    ];

    return allCalendars;
  }

  async getCalendarById(id: string, userId: string): Promise<Calendar> {
    const calendar = await this.calendarRepository.findOne({
      where: { id },
      relations: ['team', 'events'],
    });

    if (!calendar) {
      throw new NotFoundException('캘린더를 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('캘린더에 접근할 권한이 없습니다.');
    }

    return calendar;
  }

  async updateCalendar(id: string, userId: string, updateCalendarDto: UpdateCalendarDto): Promise<Calendar> {
    const calendar = await this.getCalendarById(id, userId);
    
    Object.assign(calendar, updateCalendarDto);
    return this.calendarRepository.save(calendar);
  }

  async deleteCalendar(id: string, userId: string): Promise<void> {
    const calendar = await this.getCalendarById(id, userId);
    await this.calendarRepository.remove(calendar);
  }

  async getTeamCalendars(teamId: string, userId: string): Promise<Calendar[]> {
    // TODO: 팀 멤버 권한 확인 로직 추가
    return this.calendarRepository.find({
      where: { teamId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }
}
