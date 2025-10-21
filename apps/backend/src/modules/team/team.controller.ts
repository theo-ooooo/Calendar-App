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
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@ApiTags('팀 관리')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: '팀 생성' })
  @ApiResponse({ status: 201, description: '팀 생성 성공' })
  async createTeam(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(req.user.id, createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: '사용자의 팀 목록 조회' })
  @ApiResponse({ status: 200, description: '팀 목록 조회 성공' })
  async getTeams(@Request() req) {
    return this.teamService.getTeamsByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '팀 상세 조회' })
  @ApiResponse({ status: 200, description: '팀 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '팀을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  async getTeam(@Request() req, @Param('id') id: string) {
    return this.teamService.getTeamById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '팀 정보 수정' })
  @ApiResponse({ status: 200, description: '팀 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  async updateTeam(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(id, req.user.id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '팀 삭제' })
  @ApiResponse({ status: 200, description: '팀 삭제 성공' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  async deleteTeam(@Request() req, @Param('id') id: string) {
    await this.teamService.deleteTeam(id, req.user.id);
    return { message: '팀이 삭제되었습니다.' };
  }

  @Post('join')
  @ApiOperation({ summary: '초대 코드로 팀 참여' })
  @ApiResponse({ status: 200, description: '팀 참여 성공' })
  @ApiResponse({ status: 404, description: '유효하지 않은 초대 코드' })
  async joinTeam(@Request() req, @Query('code') inviteCode: string) {
    return this.teamService.joinTeamByCode(inviteCode, req.user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: '팀 멤버 초대' })
  @ApiResponse({ status: 201, description: '멤버 초대 성공' })
  @ApiResponse({ status: 403, description: '초대 권한 없음' })
  async inviteMember(
    @Request() req,
    @Param('id') teamId: string,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.teamService.inviteMember(teamId, req.user.id, inviteMemberDto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: '팀 초대 수락' })
  @ApiResponse({ status: 200, description: '초대 수락 성공' })
  @ApiResponse({ status: 404, description: '대기 중인 초대 없음' })
  async acceptInvitation(@Request() req, @Param('id') teamId: string) {
    return this.teamService.acceptInvitation(teamId, req.user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '팀 초대 거절' })
  @ApiResponse({ status: 200, description: '초대 거절 성공' })
  @ApiResponse({ status: 404, description: '대기 중인 초대 없음' })
  async rejectInvitation(@Request() req, @Param('id') teamId: string) {
    await this.teamService.rejectInvitation(teamId, req.user.id);
    return { message: '초대를 거절했습니다.' };
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: '팀 멤버 제거' })
  @ApiResponse({ status: 200, description: '멤버 제거 성공' })
  @ApiResponse({ status: 403, description: '제거 권한 없음' })
  async removeMember(
    @Request() req,
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.teamService.removeMember(teamId, req.user.id, memberId);
    return { message: '멤버가 제거되었습니다.' };
  }
}
