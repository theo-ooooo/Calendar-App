import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('사용자')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Put('profile')
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put('deactivate')
  @ApiOperation({ summary: '계정 비활성화' })
  @ApiResponse({ status: 200, description: '계정 비활성화 성공' })
  async deactivateUser(@Request() req) {
    await this.userService.deactivateUser(req.user.id);
    return { message: '계정이 비활성화되었습니다.' };
  }
}
