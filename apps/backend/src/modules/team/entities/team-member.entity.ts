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

export enum TeamMemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

export enum TeamMemberStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBER,
  })
  role: TeamMemberRole;

  @Column({
    type: 'enum',
    enum: TeamMemberStatus,
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