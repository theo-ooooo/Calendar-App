import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Calendar } from "./entities/calendar.entity";
import { User } from "../user/entities/user.entity";
import { TeamMember } from "../team/entities/team-member.entity";
import { CalendarService } from "./calendar.service";
import { CalendarController } from "./calendar.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Calendar, User, TeamMember])],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
