import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { User } from "../user/entities/user.entity";
import { Calendar } from "../calendar/entities/calendar.entity";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Calendar])],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
