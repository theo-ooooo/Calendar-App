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
import { TeamMember } from './team-member.entity';
import { Calendar } from '../../calendar/entities/calendar.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true, unique: true })
  inviteCode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedTeams)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => TeamMember, (member) => member.team)
  members: TeamMember[];

  @OneToMany(() => Calendar, (calendar) => calendar.team)
  calendars: Calendar[];
}