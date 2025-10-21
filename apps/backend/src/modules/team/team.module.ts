import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { User } from '../user/entities/user.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User])],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService],
})
export class TeamModule {}
