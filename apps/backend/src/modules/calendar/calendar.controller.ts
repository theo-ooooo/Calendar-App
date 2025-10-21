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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@ApiTags('캘린더 관리')
@Controller('calendars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: '캘린더 생성' })
  @ApiResponse({ status: 201, description: '캘린더 생성 성공' })
  async createCalendar(@Request() req, @Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.createCalendar(req.user.id, createCalendarDto);
  }

  @Get()
  @ApiOperation({ summary: '사용자의 모든 캘린더 목록 조회 (개인 + 팀)' })
  @ApiResponse({ status: 200, description: '캘린더 목록 조회 성공' })
  async getCalendars(@Request() req) {
    return this.calendarService.getAllUserCalendars(req.user.id);
  }

  @Get('personal')
  @ApiOperation({ summary: '사용자의 개인 캘린더 목록 조회' })
  @ApiResponse({ status: 200, description: '개인 캘린더 목록 조회 성공' })
  async getPersonalCalendars(@Request() req) {
    return this.calendarService.getCalendarsByUser(req.user.id);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀 캘린더 목록 조회' })
  @ApiResponse({ status: 200, description: '팀 캘린더 목록 조회 성공' })
  async getTeamCalendars(@Request() req, @Param('teamId') teamId: string) {
    return this.calendarService.getTeamCalendars(teamId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '캘린더 상세 조회' })
  @ApiResponse({ status: 200, description: '캘린더 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '캘린더를 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  async getCalendar(@Request() req, @Param('id') id: string) {
    return this.calendarService.getCalendarById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '캘린더 정보 수정' })
  @ApiResponse({ status: 200, description: '캘린더 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  async updateCalendar(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this.calendarService.updateCalendar(id, req.user.id, updateCalendarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '캘린더 삭제' })
  @ApiResponse({ status: 200, description: '캘린더 삭제 성공' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  async deleteCalendar(@Request() req, @Param('id') id: string) {
    await this.calendarService.deleteCalendar(id, req.user.id);
    return { message: '캘린더가 삭제되었습니다.' };
  }
}
