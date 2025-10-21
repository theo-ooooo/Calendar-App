# 환경 설정 가이드

## 1. 백엔드 환경 변수 설정

`apps/backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=calendar_sharing

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# 소셜 로그인 설정 (선택사항)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 서버 설정
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# CORS 설정
CORS_ORIGIN=http://localhost:3000
```

## 2. 프론트엔드 환경 변수 설정

`apps/frontend/.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Social Login Configuration (선택사항)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
```

## 3. 데이터베이스 설정

### MySQL 설정
1. MySQL 서버를 설치하고 실행하세요
2. `calendar_sharing` 데이터베이스를 생성하세요:
   ```sql
   CREATE DATABASE calendar_sharing;
   ```

### Redis 설정
1. Redis 서버를 설치하고 실행하세요
2. 기본 포트(6379)로 실행되면 됩니다

## 4. 서버 실행

```bash
# 전체 서버 실행 (백엔드 + 프론트엔드)
pnpm dev

# 또는 개별 실행
pnpm dev:backend
pnpm dev:frontend
```

## 5. 접속 확인

- **프론트엔드**: http://localhost:3000
- **백엔드 API 문서**: http://localhost:3001/api/docs

## 6. 문제 해결

### 프론트엔드가 실행되지 않는 경우
1. `apps/frontend/package.json`이 있는지 확인
2. `pnpm install` 실행
3. `pnpm dev` 실행

### 백엔드가 실행되지 않는 경우
1. `.env` 파일이 올바르게 설정되었는지 확인
2. MySQL과 Redis가 실행 중인지 확인
3. `pnpm install` 실행
4. `pnpm dev` 실행

### 데이터베이스 연결 오류
1. MySQL 서버가 실행 중인지 확인
2. 데이터베이스 이름과 사용자 정보가 올바른지 확인
3. 방화벽 설정 확인

### Redis 연결 오류
1. Redis 서버가 실행 중인지 확인
2. Redis 포트가 6379인지 확인
3. Redis 비밀번호가 설정되어 있다면 `.env`에 추가
