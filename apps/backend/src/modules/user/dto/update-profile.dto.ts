import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: '이름',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자까지 가능합니다.' })
  name?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
