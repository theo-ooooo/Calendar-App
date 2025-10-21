import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Calendar } from '../calendar/entities/calendar.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
  ) {}

  async createEvent(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    // 캘린더 확인
    const calendar = await this.calendarRepository.findOne({
      where: { id: createEventDto.calendarId },
    });

    if (!calendar) {
      throw new NotFoundException('캘린더를 찾을 수 없습니다.');
    }

    // 캘린더 소유자 확인
    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('이벤트를 생성할 권한이 없습니다.');
    }

    // 참석자 찾기
    let attendees: User[] = [];
    if (createEventDto.attendeeEmails && createEventDto.attendeeEmails.length > 0) {
      attendees = await this.userRepository.find({
        where: createEventDto.attendeeEmails.map(email => ({ email })),
      });
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      creatorId: userId,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      repeatUntil: createEventDto.repeatUntil ? new Date(createEventDto.repeatUntil) : undefined,
      attendees,
    });

    return this.eventRepository.save(event);
  }

  async getEventsByCalendar(calendarId: string, userId: string): Promise<Event[]> {
    // 캘린더 접근 권한 확인
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new NotFoundException('캘린더를 찾을 수 없습니다.');
    }

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('캘린더에 접근할 권한이 없습니다.');
    }

    return this.eventRepository.find({
      where: { calendarId },
      relations: ['creator', 'attendees', 'calendar'],
      order: { startDate: 'ASC' },
    });
  }

  async getEventsByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        startDate: Between(startDate, endDate),
        creatorId: userId,
      },
      relations: ['creator', 'attendees', 'calendar'],
      order: { startDate: 'ASC' },
    });
  }

  async getEventById(id: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator', 'attendees', 'calendar'],
    });

    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    // 이벤트 접근 권한 확인
    if (event.creatorId !== userId && !event.attendees.some(attendee => attendee.id === userId)) {
      throw new ForbiddenException('이벤트에 접근할 권한이 없습니다.');
    }

    return event;
  }

  async updateEvent(id: string, userId: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.getEventById(id, userId);

    // 이벤트 생성자만 수정 가능
    if (event.creatorId !== userId) {
      throw new ForbiddenException('이벤트를 수정할 권한이 없습니다.');
    }

    // 참석자 업데이트
    if (updateEventDto.attendeeEmails) {
      const attendees = await this.userRepository.find({
        where: updateEventDto.attendeeEmails.map(email => ({ email })),
      });
      event.attendees = attendees;
    }

    Object.assign(event, {
      ...updateEventDto,
      startDate: updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate,
      endDate: updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate,
      repeatUntil: updateEventDto.repeatUntil ? new Date(updateEventDto.repeatUntil) : event.repeatUntil,
    });

    return this.eventRepository.save(event);
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await this.getEventById(id, userId);

    // 이벤트 생성자만 삭제 가능
    if (event.creatorId !== userId) {
      throw new ForbiddenException('이벤트를 삭제할 권한이 없습니다.');
    }

    await this.eventRepository.remove(event);
  }

  async searchEvents(query: string, userId: string): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('event.calendar', 'calendar')
      .where('event.creatorId = :userId', { userId })
      .andWhere('(event.title LIKE :query OR event.description LIKE :query)', {
        query: `%${query}%`,
      })
      .orderBy('event.startDate', 'ASC')
      .getMany();
  }

  async getUserUpcomingEvents(userId: string, limit: number = 10): Promise<Event[]> {
    const now = new Date();
    
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('event.calendar', 'calendar')
      .where('event.creatorId = :userId', { userId })
      .orWhere('attendees.id = :userId', { userId })
      .andWhere('event.startDate > :now', { now })
      .orderBy('event.startDate', 'ASC')
      .limit(limit)
      .getMany();
  }
}
