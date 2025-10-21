import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar, CalendarType } from './entities/calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
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
