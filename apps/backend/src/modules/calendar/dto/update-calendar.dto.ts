import { IsString, IsOptional, MinLength, MaxLength, IsHexColor, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCalendarDto {
  @ApiProperty({
    description: '캘린더 이름',
    example: '개인 일정',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '캘린더 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '캘린더 이름은 최대 50자까지 가능합니다.' })
  name?: string;

  @ApiProperty({
    description: '캘린더 설명',
    example: '개인적인 일정을 관리하는 캘린더입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '캘린더 설명은 최대 500자까지 가능합니다.' })
  description?: string;

  @ApiProperty({
    description: '캘린더 색상 (HEX 코드)',
    example: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsHexColor({ message: '올바른 HEX 색상 코드를 입력해주세요.' })
  color?: string;

  @ApiProperty({
    description: '공개 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
