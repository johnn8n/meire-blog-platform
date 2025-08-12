# 메르 블로그 플랫폼 - 백엔드 API 설계 및 통합 시스템

## 개요

본 시스템은 공공데이터와 주식 데이터를 통합하여 포괄적인 금융 분석 플랫폼을 제공하는 고급 백엔드 API입니다. Google 백엔드 엔지니어의 아키텍처 원칙을 적용하여 확장 가능하고 안정적인 시스템으로 구축되었습니다.

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Next.js App   │    │  API Gateway    │
│                 │◄──►│                 │◄──►│                 │
│ Web, Mobile, AI │    │  Frontend/API   │    │ Rate Limiting   │
└─────────────────┘    └─────────────────┘    │ Caching         │
                                              │ Error Handling  │
                                              └─────────┬───────┘
                                                        │
                               ┌────────────────────────┼────────────────────────┐
                               │                        │                        │
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │ Public Data APIs│    │ Stock Data APIs │    │   MCP Servers   │
                    │                 │    │                 │    │                 │
                    │ • 국민연금 API   │    │ • Yahoo Finance │    │ • Fetch Server  │
                    │ • 한국거래소 API │    │ • Alpha Vantage │    │ • Memory Server │
                    │ • 금융감독원 API │    │ • Finnhub       │    │ • Time Server   │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
                               │                        │                        │
                               └────────────────────────┼────────────────────────┘
                                                        │
                               ┌────────────────────────┼────────────────────────┐
                               │                        │                        │
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │   Database      │    │   Redis Cache   │    │   Monitoring    │
                    │                 │    │                 │    │                 │
                    │ • Portfolio     │    │ • API Responses │    │ • Error Tracking│
                    │ • Market Data   │    │ • User Sessions │    │ • Performance   │
                    │ • User Data     │    │ • Rate Limits   │    │ • Health Checks │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 핵심 기능

### 1. 통합 API 게이트웨이
- **단일 진입점**: 모든 데이터 소스를 통합하는 일관된 API
- **지능형 캐싱**: Redis 기반 다계층 캐싱 전략
- **Rate Limiting**: IP 및 클라이언트별 요청 제한
- **에러 처리**: 자동 재시도 및 fallback 메커니즘
- **실시간 모니터링**: 성능 메트릭 및 상태 추적

### 2. 공공데이터 API 통합
- **국민연금 투자현황**: 펀드별 보유 종목 및 비중 데이터
- **한국거래소 시장데이터**: 상장 종목 정보 및 거래 데이터  
- **금융감독원 공시**: 기업 공시 정보 및 규제 데이터

### 3. 주식 데이터 API 통합
- **실시간 주가**: Yahoo Finance, Alpha Vantage 등 다중 소스
- **기업 재무제표**: 손익계산서, 재무상태표, 현금흐름표
- **뉴스 및 센티멘트**: 주식 관련 뉴스 및 감정 분석

### 4. MCP 서버 통합
- **Fetch Server**: 고급 웹 요청 및 데이터 수집
- **Memory Server**: 지식 그래프 기반 관계 데이터 저장
- **Time Server**: 시간대 관리 및 거래 시간 추적

## 📚 API 엔드포인트

### 주식 시세 조회
```http
GET /api/gateway/stock-quotes?symbols=AAPL,MSFT,GOOGL
GET /api/gateway/stock-quotes?symbol=AAPL&fields=price,change,volume
```

### 공공데이터 조회
```http
GET /api/gateway/public-data?type=nps&basDt=20240101&fundNm=적극투자형
GET /api/gateway/public-data?type=krx&mrktCls=KOSPI&numOfRows=100
GET /api/gateway/public-data?type=fss&bgn_de=20240101&end_de=20240131
```

### 포트폴리오 분석
```http
GET /api/gateway/portfolio-analysis?symbols=AAPL,MSFT&includeNPS=true
POST /api/gateway/portfolio-analysis
{
  "portfolio": {
    "holdings": [
      {"symbol": "AAPL", "shares": 100, "avgPurchasePrice": 150.00},
      {"symbol": "MSFT", "shares": 50, "avgPurchasePrice": 300.00}
    ]
  },
  "analysisOptions": {
    "includeNPS": true,
    "includeFinancials": true,
    "riskAnalysis": true
  }
}
```

### 시스템 헬스 체크
```http
GET /api/gateway/health
POST /api/gateway/health {"diagnosticLevel": "comprehensive"}
```

## 🛠️ 설치 및 설정

### 1. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd meire-blog-platform

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 API 키 및 설정 값 입력
```

### 2. 데이터베이스 설정
```bash
# 데이터베이스 스키마 생성
sqlite3 database.db < database/portfolio_schema.sql
sqlite3 database.db < database/external_data_schema.sql

# 또는 MySQL 사용 시
mysql -u username -p database_name < database/portfolio_schema.sql
mysql -u username -p database_name < database/external_data_schema.sql
```

### 3. Redis 설정 (선택사항)
```bash
# Redis 서버 실행
redis-server

# 또는 Docker 사용
docker run -d -p 6379:6379 redis:alpine
```

### 4. MCP 서버 설정 (선택사항)
```bash
# MCP 서버들 실행 (별도 터미널에서)
npx @modelcontextprotocol/server-fetch
npx @modelcontextprotocol/server-memory
npx @modelcontextprotocol/server-time
```

### 5. 개발 서버 실행
```bash
npm run dev
```

## 🔑 API 키 발급

### 공공데이터 API
1. [공공데이터포털](https://data.go.kr) 회원가입
2. 다음 API 신청:
   - 국민연금 투자현황 서비스
   - 한국거래소 시장정보 서비스
3. [금융감독원 DART](https://opendart.fss.or.kr) API 키 발급

### 주식 데이터 API
1. [Alpha Vantage](https://alphavantage.co) 무료 API 키 발급
2. [Finnhub](https://finnhub.io) API 키 발급 (선택사항)
3. Yahoo Finance는 API 키 불필요

## 📊 캐싱 전략

### 캐시 계층 구조
```
Level 1: 메모리 캐시 (즉시 응답)
   ↓
Level 2: Redis 캐시 (밀리초 응답)
   ↓  
Level 3: 데이터베이스 (초 단위 응답)
   ↓
Level 4: 외부 API (초-분 단위 응답)
```

### TTL 설정
- **주식 시세**: 5분 (실시간성 중요)
- **포트폴리오 분석**: 10분 (복합 데이터)
- **공공데이터**: 30분-1시간 (업데이트 빈도 낮음)
- **재무제표**: 24시간 (분기별 업데이트)

## 🚨 에러 처리 및 모니터링

### 구조화된 에러 처리
```typescript
// 에러 생성 예시
const error = new StructuredError(
  'API rate limit exceeded',
  ErrorLevel.WARNING,
  ErrorCategory.RATE_LIMIT,
  'RATE_LIMIT_EXCEEDED',
  { endpoint: '/api/stock-quotes', clientId: 'user123' },
  { statusCode: 429 }
);
```

### 모니터링 메트릭
- **응답 시간**: P50, P95, P99 백분위수
- **에러율**: 시간당 에러 발생 비율
- **캐시 히트율**: 캐시 효율성 측정
- **외부 API 상태**: 의존성 서비스 건강도

### 알림 시스템
- **Slack 통합**: 크리티컬 에러 즉시 알림
- **이메일 알림**: 일일/주간 상태 리포트
- **대시보드**: 실시간 시스템 상태 모니터링

## 🔒 보안 고려사항

### API 보안
- **Rate Limiting**: IP별, 클라이언트별 요청 제한
- **Input Validation**: Zod 스키마를 통한 엄격한 검증
- **CORS 설정**: 허용된 도메인만 API 접근 가능
- **API 키 보호**: 환경 변수를 통한 민감 정보 관리

### 데이터 보안
- **데이터 암호화**: 중요 데이터 AES 암호화
- **액세스 로그**: 모든 API 요청 로깅
- **개인정보 보호**: GDPR 및 개인정보보호법 준수

## ⚡ 성능 최적화

### 데이터베이스 최적화
- **인덱스 전략**: 쿼리 패턴 기반 인덱스 생성
- **연결 풀링**: 효율적인 데이터베이스 연결 관리
- **쿼리 최적화**: N+1 문제 해결 및 배치 처리

### 캐싱 최적화
- **압축**: 1KB 이상 데이터 자동 압축
- **프리페칭**: 예상 요청 데이터 미리 캐싱
- **무효화 전략**: 데이터 변경 시 관련 캐시 무효화

### 네트워크 최적화
- **HTTP/2**: 다중 요청 병렬 처리
- **CDN 통합**: 정적 리소스 지역별 캐싱
- **응답 압축**: Gzip/Brotli 압축 적용

## 🧪 테스트 전략

### 단위 테스트
```bash
npm run test:unit
```

### 통합 테스트
```bash
npm run test:integration
```

### 성능 테스트
```bash
npm run test:performance
```

### API 테스트
```bash
npm run test:api
```

## 📈 확장성 고려사항

### 수평적 확장
- **로드 밸런싱**: 여러 인스턴스 간 요청 분산
- **데이터베이스 샤딩**: 데이터 분할을 통한 성능 향상
- **마이크로서비스**: 기능별 서비스 분리

### 수직적 확장
- **메모리 최적화**: 효율적인 메모리 사용 패턴
- **CPU 최적화**: 비동기 처리 및 워커 스레드 활용
- **스토리지 최적화**: SSD 및 고성능 스토리지 활용

## 🚀 배포 가이드

### 개발 환경
```bash
npm run dev
```

### 스테이징 환경
```bash
npm run build
npm run start:staging
```

### 프로덕션 환경
```bash
npm run build
npm run start:production
```

### Docker 배포
```bash
docker build -t meire-blog-platform .
docker run -p 3000:3000 --env-file .env meire-blog-platform
```

### Kubernetes 배포
```bash
kubectl apply -f k8s/
```

## 📋 트러블슈팅

### 일반적인 문제

1. **API 키 관련 오류**
   - `.env` 파일에 올바른 API 키 설정 확인
   - API 키 유효성 및 권한 확인

2. **데이터베이스 연결 오류**
   - 데이터베이스 서버 실행 상태 확인
   - 연결 문자열 및 자격 증명 확인

3. **Redis 연결 오류**
   - Redis 서버 실행 상태 확인
   - 메모리 캐시로 fallback 동작 확인

4. **외부 API 타임아웃**
   - 네트워크 연결 상태 확인
   - API 제공업체 서비스 상태 확인

### 로그 분석
```bash
# 에러 로그 확인
tail -f logs/error.log

# API 요청 로그 확인
tail -f logs/api.log

# 성능 로그 확인
tail -f logs/performance.log
```

## 🤝 기여 가이드

1. **이슈 제기**: GitHub Issues를 통한 버그 리포트 및 기능 제안
2. **코드 스타일**: ESLint 및 Prettier 설정 준수
3. **테스트 작성**: 새로운 기능에 대한 테스트 코드 작성
4. **문서 업데이트**: 변경사항에 대한 문서 업데이트

## 📞 지원 및 연락처

- **이메일**: support@meireblog.com
- **GitHub Issues**: [프로젝트 이슈 페이지]
- **Slack**: #backend-api 채널
- **문서**: [상세 API 문서]

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

**버전**: 1.0.0  
**마지막 업데이트**: 2025-01-15  
**작성자**: 메르 블로그 플랫폼 개발팀