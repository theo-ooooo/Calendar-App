import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Team } from '../../team/entities/team.entity';
import { TeamMember } from '../../team/entities/team-member.entity';
import { Calendar } from '../../calendar/entities/calendar.entity';
import { Event } from '../../event/entities/event.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  KAKAO = 'kakao',
  NAVER = 'naver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @OneToMany(() => Team, (team) => team.owner)
  ownedTeams: Team[];

  @OneToMany(() => TeamMember, (member) => member.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => Calendar, (calendar) => calendar.owner)
  calendars: Calendar[];

  @OneToMany(() => Event, (event) => event.creator)
  createdEvents: Event[];

  @ManyToMany(() => Event, (event) => event.attendees)
  @JoinTable()
  attendingEvents: Event[];

}