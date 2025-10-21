import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { KakaoAuthGuard } from "./guards/kakao-auth.guard";
import { NaverAuthGuard } from "./guards/naver-auth.guard";

@ApiTags("인증")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "회원가입" })
  @ApiResponse({ status: 201, description: "회원가입 성공" })
  @ApiResponse({ status: 409, description: "이미 사용 중인 이메일" })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(registerDto);

    // 쿠키 설정
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return { user: result.user, message: "회원가입이 완료되었습니다." };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그인" })
  @ApiResponse({ status: 200, description: "로그인 성공" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req,
    @Res({ passthrough: true }) res: Response
  ) {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await this.authService.login(
      loginDto,
      deviceInfo,
      ipAddress
    );

    // 쿠키 설정
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return { user: result.user, message: "로그인되었습니다." };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "토큰 갱신" })
  @ApiResponse({ status: 200, description: "토큰 갱신 성공" })
  @ApiResponse({ status: 401, description: "유효하지 않은 리프레시 토큰" })
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // 새로운 토큰을 쿠키에 설정
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return { message: "토큰이 갱신되었습니다." };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그아웃" })
  @ApiResponse({ status: 200, description: "로그아웃 성공" })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // 쿠키 삭제
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return { message: "로그아웃되었습니다." };
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "모든 기기 로그아웃" })
  @ApiResponse({ status: 200, description: "모든 기기 로그아웃 성공" })
  @ApiResponse({ status: 401, description: "인증 필요" })
  async logoutAll(@Request() req) {
    await this.authService.logoutAll(req.user.id);
    return { message: "모든 기기에서 로그아웃되었습니다." };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "프로필 조회" })
  @ApiResponse({ status: 200, description: "프로필 조회 성공" })
  @ApiResponse({ status: 401, description: "인증 필요" })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get("tokens")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "활성 토큰 목록 조회" })
  @ApiResponse({ status: 200, description: "활성 토큰 목록 조회 성공" })
  @ApiResponse({ status: 401, description: "인증 필요" })
  async getActiveTokens(@Request() req) {
    return this.authService.getUserActiveTokens(req.user.id);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "구글 로그인" })
  async googleAuth() {
    // Passport가 자동으로 처리
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "구글 로그인 콜백" })
  async googleAuthCallback(@Request() req) {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip || req.connection.remoteAddress;

    return this.authService.findOrCreateSocialUser(
      req.user.provider,
      req.user.providerId,
      req.user.email,
      req.user.name,
      req.user.profileImage,
      deviceInfo,
      ipAddress
    );
  }

  @Get("kakao")
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: "카카오 로그인" })
  async kakaoAuth() {
    // Passport가 자동으로 처리
  }

  @Get("kakao/callback")
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: "카카오 로그인 콜백" })
  async kakaoAuthCallback(@Request() req) {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip || req.connection.remoteAddress;

    return this.authService.findOrCreateSocialUser(
      req.user.provider,
      req.user.providerId,
      req.user.email,
      req.user.name,
      req.user.profileImage,
      deviceInfo,
      ipAddress
    );
  }

  @Get("naver")
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: "네이버 로그인" })
  async naverAuth() {
    // Passport가 자동으로 처리
  }

  @Get("naver/callback")
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: "네이버 로그인 콜백" })
  async naverAuthCallback(@Request() req) {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip || req.connection.remoteAddress;

    return this.authService.findOrCreateSocialUser(
      req.user.provider,
      req.user.providerId,
      req.user.email,
      req.user.name,
      req.user.profileImage,
      deviceInfo,
      ipAddress
    );
  }
}
