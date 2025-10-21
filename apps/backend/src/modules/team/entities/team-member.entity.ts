import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Team } from './team.entity';

export const TeamMemberRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type TeamMemberRole = (typeof TeamMemberRole)[keyof typeof TeamMemberRole];

export const TeamMemberStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type TeamMemberStatus = (typeof TeamMemberStatus)[keyof typeof TeamMemberStatus];

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TeamMemberRole.MEMBER,
  })
  role: TeamMemberRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: TeamMemberStatus.PENDING,
  })
  status: TeamMemberStatus;

  @Column({ nullable: true })
  invitedBy?: string;

  @Column({ nullable: true })
  invitedAt?: Date;

  @Column({ nullable: true })
  joinedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.teamMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  teamId: string;

  @ManyToOne(() => Team, (team) => team.members)
  @JoinColumn({ name: 'teamId' })
  team: Team;
}