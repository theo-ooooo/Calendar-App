import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Calendar } from '../../calendar/entities/calendar.entity';

export enum EventStatus {
  TENTATIVE = 'tentative',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum EventRepeatType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.CONFIRMED,
  })
  status: EventStatus;

  @Column({ default: false })
  isAllDay: boolean;

  @Column({ nullable: true })
  reminder?: number; // 분 단위

  @Column({
    type: 'enum',
    enum: EventRepeatType,
    default: EventRepeatType.NONE,
  })
  repeatType: EventRepeatType;

  @Column({ nullable: true })
  repeatUntil?: Date;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @Column()
  creatorId: string;

  @ManyToOne(() => User, (user) => user.createdEvents)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  calendarId: string;

  @ManyToOne(() => Calendar, (calendar) => calendar.events)
  @JoinColumn({ name: 'calendarId' })
  calendar: Calendar;

  @ManyToMany(() => User, (user) => user.attendingEvents)
  @JoinTable()
  attendees: User[];
}