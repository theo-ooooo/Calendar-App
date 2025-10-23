import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Calendar } from "../../modules/calendar/entities/calendar.entity";
import { User } from "../../modules/user/entities/user.entity";

// Express Request 타입 확장
interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class EnsurePersonalCalendarMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // 인증된 사용자인 경우에만 체크
    if (req.user && req.user.id) {
      try {
        const userId = req.user.id;

        // 사용자의 개인 캘린더가 있는지 확인
        const personalCalendar = await this.calendarRepository.findOne({
          where: {
            ownerId: userId,
            type: "personal",
          },
        });

        // 개인 캘린더가 없으면 생성
        if (!personalCalendar) {
          console.log(`Creating personal calendar for user ${userId}`);

          const newPersonalCalendar = this.calendarRepository.create({
            name: "개인 캘린더",
            description: "개인 일정을 관리하는 캘린더입니다.",
            color: "#3B82F6", // 파란색
            type: "personal",
            ownerId: userId,
            isActive: true,
          });

          await this.calendarRepository.save(newPersonalCalendar);
          console.log(`Personal calendar created for user ${userId}`);
        }
      } catch (error) {
        console.error("Error ensuring personal calendar:", error);
        // 에러가 발생해도 요청은 계속 진행
      }
    }

    next();
  }
}
