import { IsString, IsDateString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, EventRepeatType } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty({
    description: '이벤트 제목',
    example: '팀 미팅',
  })
  @IsString()
  @MinLength(1, { message: '제목을 입력해주세요.' })
  @MaxLength(100, { message: '제목은 최대 100자까지 가능합니다.' })
  title: string;

  @ApiProperty({
    description: '이벤트 설명',
    example: '주간 팀 미팅입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '설명은 최대 1000자까지 가능합니다.' })
  description?: string;

  @ApiProperty({
    description: '시작 날짜 및 시간',
    example: '2024-01-15T09:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '종료 날짜 및 시간',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: '장소',
    example: '회의실 A',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '장소는 최대 200자까지 가능합니다.' })
  location?: string;

  @ApiProperty({
    description: '이벤트 상태',
    example: EventStatus.CONFIRMED,
    enum: EventStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({
    description: '하루 종일 이벤트 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty({
    description: '알림 시간 (분 단위)',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  reminder?: number;

  @ApiProperty({
    description: '반복 타입',
    example: EventRepeatType.WEEKLY,
    enum: EventRepeatType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventRepeatType)
  repeatType?: EventRepeatType;

  @ApiProperty({
    description: '반복 종료 날짜',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  repeatUntil?: string;

  @ApiProperty({
    description: '공개 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: '캘린더 ID',
    example: 'uuid-string',
  })
  @IsString()
  calendarId: string;

  @ApiProperty({
    description: '참석자 이메일 목록',
    example: ['user1@example.com', 'user2@example.com'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendeeEmails?: string[];
}
