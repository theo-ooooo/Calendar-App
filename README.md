# 일정공유 서비스

팀과 개인 일정을 효율적으로 관리하는 웹 애플리케이션입니다.

## 🚀 기술 스택

### Backend

- **NestJS** - Node.js 프레임워크
- **TypeScript** - 타입 안전성
- **MySQL** - 메인 데이터베이스
- **Redis** - 세션 및 캐시 관리
- **TypeORM** - ORM
- **JWT** - 인증 토큰
- **Passport.js** - 인증 전략

### Frontend

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

## 📁 프로젝트 구조

```
Calendar/
├── apps/
│   ├── backend/          # NestJS 백엔드
│   │   ├── src/
│   │   │   ├── modules/  # 기능별 모듈
│   │   │   │   ├── auth/     # 인증
│   │   │   │   ├── user/     # 사용자
│   │   │   │   ├── team/     # 팀 관리
│   │   │   │   ├── calendar/ # 캘린더
│   │   │   │   └── event/    # 이벤트
│   │   │   └── database/ # 데이터베이스 설정
│   │   └── package.json
│   └── frontend/         # Next.js 프론트엔드
│       ├── src/
│       │   ├── app/      # App Router
│       │   ├── components/ # React 컴포넌트
│       │   ├── lib/      # 유틸리티 및 API
│       │   └── stores/   # Zustand 스토어
│       └── package.json
├── package.json          # 루트 패키지
└── pnpm-workspace.yaml   # pnpm 워크스페이스
```

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/theo-ooooo/Calendar-App.git
cd Calendar-App
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

```bash
# Backend
cp apps/backend/env.example apps/backend/.env

# Frontend
cp apps/frontend/env.example apps/frontend/.env.local
```

### 4. 데이터베이스 설정

- MySQL 데이터베이스 생성
- Redis 서버 실행
- 환경 변수에 데이터베이스 정보 입력

### 5. 애플리케이션 실행

```bash
# 개발 모드 (백엔드 + 프론트엔드 동시 실행)
pnpm dev

# 또는 개별 실행
pnpm dev:backend
pnpm dev:frontend
```

## 🔧 개발 스크립트

```bash
# 전체 개발 서버 실행
pnpm dev

# 백엔드만 실행
pnpm dev:backend

# 프론트엔드만 실행
pnpm dev:frontend

# 빌드
pnpm build

# 테스트
pnpm test

# 린트
pnpm lint
```

## 📋 주요 기능

### 인증 시스템

- 일반 로그인/회원가입
- 소셜 로그인 (Google, Kakao, Naver)
- JWT 기반 인증
- 리프레시 토큰 관리

### 팀 관리

- 팀 생성 및 관리
- 팀 멤버 초대
- 권한 관리 (소유자, 관리자, 멤버)
- 초대 코드 시스템

### 캘린더 관리

- 개인 캘린더
- 팀 캘린더
- 캘린더 공유
- 색상 및 설정 관리

### 이벤트 관리

- 이벤트 생성/수정/삭제
- 참석자 관리
- 반복 이벤트
- 이벤트 검색 및 필터링
- 알림 설정

## 🌐 API 문서

백엔드 서버 실행 후 `http://localhost:3001/api/docs`에서 Swagger API 문서를 확인할 수 있습니다.

## 📝 라이선스

MIT License
