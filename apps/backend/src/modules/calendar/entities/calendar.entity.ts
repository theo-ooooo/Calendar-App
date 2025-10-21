import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Team } from '../../team/entities/team.entity';
import { Event } from '../../event/entities/event.entity';

export enum CalendarType {
  PERSONAL = 'personal',
  TEAM = 'team',
}

@Entity('calendars')
export class Calendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  color: string;

  @Column({
    type: 'enum',
    enum: CalendarType,
    default: CalendarType.PERSONAL,
  })
  type: CalendarType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.calendars)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  teamId?: string;

  @ManyToOne(() => Team, (team) => team.calendars)
  @JoinColumn({ name: 'teamId' })
  team?: Team;

  @OneToMany(() => Event, (event) => event.calendar)
  events: Event[];
}