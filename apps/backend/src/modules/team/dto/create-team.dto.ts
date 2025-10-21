import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    description: '팀 이름',
    example: '개발팀',
  })
  @IsString()
  @MinLength(2, { message: '팀 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '팀 이름은 최대 50자까지 가능합니다.' })
  name: string;

  @ApiProperty({
    description: '팀 설명',
    example: '프로젝트 개발을 담당하는 팀입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '팀 설명은 최대 500자까지 가능합니다.' })
  description?: string;

  @ApiProperty({
    description: '팀 로고 URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;
}
