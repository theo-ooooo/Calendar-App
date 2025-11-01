import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EventService } from "./event.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@ApiTags("이벤트 관리")
@Controller("events")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: "이벤트 생성" })
  @ApiResponse({ status: 201, description: "이벤트 생성 성공" })
  @ApiResponse({ status: 403, description: "생성 권한 없음" })
  async createEvent(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventService.createEvent(req.user.id, createEventDto);
  }

  @Get("calendar/:calendarId")
  @ApiOperation({ summary: "캘린더별 이벤트 목록 조회" })
  @ApiResponse({ status: 200, description: "이벤트 목록 조회 성공" })
  @ApiResponse({ status: 403, description: "접근 권한 없음" })
  async getEventsByCalendar(
    @Request() req,
    @Param("calendarId") calendarId: string
  ) {
    return this.eventService.getEventsByCalendar(calendarId, req.user.id);
  }

  @Get("date-range")
  @ApiOperation({ summary: "날짜 범위별 이벤트 조회" })
  @ApiResponse({ status: 200, description: "이벤트 목록 조회 성공" })
  async getEventsByDateRange(
    @Request() req,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    return this.eventService.getEventsByDateRange(
      new Date(startDate),
      new Date(endDate),
      req.user.id
    );
  }

  @Get("search/:query")
  @ApiOperation({ summary: "이벤트 검색" })
  @ApiResponse({ status: 200, description: "검색 결과 조회 성공" })
  async searchEvents(@Request() req, @Param("query") query: string) {
    return this.eventService.searchEvents(query, req.user.id);
  }

  @Get("upcoming")
  @ApiOperation({ summary: "다가오는 이벤트 조회" })
  @ApiResponse({ status: 200, description: "다가오는 이벤트 조회 성공" })
  async getUpcomingEvents(@Request() req) {
    return this.eventService.getUserUpcomingEvents(req.user.id);
  }

  @Get("upcoming/:limit")
  @ApiOperation({ summary: "다가오는 이벤트 조회 (제한)" })
  @ApiResponse({ status: 200, description: "다가오는 이벤트 조회 성공" })
  async getUpcomingEventsWithLimit(
    @Request() req,
    @Param("limit") limit: string
  ) {
    return this.eventService.getUserUpcomingEvents(
      req.user.id,
      parseInt(limit, 10)
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "이벤트 상세 조회" })
  @ApiResponse({ status: 200, description: "이벤트 상세 조회 성공" })
  @ApiResponse({ status: 404, description: "이벤트를 찾을 수 없음" })
  @ApiResponse({ status: 403, description: "접근 권한 없음" })
  async getEvent(@Request() req, @Param("id") id: string) {
    return this.eventService.getEventById(id, req.user.id);
  }

  @Put(":id")
  @ApiOperation({ summary: "이벤트 수정" })
  @ApiResponse({ status: 200, description: "이벤트 수정 성공" })
  @ApiResponse({ status: 403, description: "수정 권한 없음" })
  async updateEvent(
    @Request() req,
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventService.updateEvent(id, req.user.id, updateEventDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "이벤트 삭제" })
  @ApiResponse({ status: 200, description: "이벤트 삭제 성공" })
  @ApiResponse({ status: 403, description: "삭제 권한 없음" })
  async deleteEvent(@Request() req, @Param("id") id: string) {
    await this.eventService.deleteEvent(id, req.user.id);
    return { message: "이벤트가 삭제되었습니다." };
  }
}
