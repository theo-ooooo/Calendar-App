import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { ConfigService } from "@nestjs/config";

import { AuthProvider } from "../../user/entities/user.entity";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>("KAKAO_CLIENT_ID"),
      clientSecret: configService.get<string>("KAKAO_CLIENT_SECRET"),
      callbackURL: `${configService.get<string>("FRONTEND_URL")}/auth/kakao/callback`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) {
    const { id, username, _json } = profile;
    const user = {
      provider: AuthProvider.KAKAO,
      providerId: id.toString(),
      email: _json.kakao_account?.email || `${id}@kakao.com`,
      name:
        username || _json.kakao_account?.profile?.nickname || "카카오 사용자",
      profileImage: _json.kakao_account?.profile?.profile_image_url,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
