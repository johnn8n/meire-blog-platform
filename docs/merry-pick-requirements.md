# 🎯 메르's Pick 요구사항 명세서

> **메르가 최근에 언급한 종목들을 우선순위로 표시하는 핵심 기능**  
> 메인 페이지와 종목 관련 페이지에서 활용됩니다.

---

## 📋 핵심 기능 요구사항

### 기능 개요
- **목적**: 메르가 최근에 언급한 종목들을 우선순위로 표시
- **위치**: 메인 페이지 및 종목 관련 페이지
- **데이터 소스**: `stocks` 테이블의 `is_merry_mentioned = 1` 레코드

### 표시 순서 (핵심 요구사항)
1. **메르가 언급한 최신 날짜 순으로 랭킹** (lastMention 기준 내림차순)
2. 언급 횟수 (postCount/mention_count) 참고
3. 메르가 언급한 종목만 표시 (postCount > 0)

---

## 🗄️ 데이터 요구사항

### 데이터베이스 연동
**테이블**: `stocks`  
**핵심 필드**:
- `ticker`: 종목 코드
- `company_name_kr`: 한국어 회사명
- `is_merry_mentioned`: 메르 언급 여부 (1: 언급, 0: 미언급)
- `last_mentioned_date`: 최근 언급일
- `mention_count`: 총 언급 횟수
- `market`: 거래소 (KOSPI, KOSDAQ, NASDAQ)
- `currency`: 통화 (KRW, USD)

### SQL 쿼리 구조
```sql
SELECT 
  s.ticker,
  s.company_name as name,
  s.company_name_kr as nameKr,
  s.market,
  s.currency,
  s.mention_count as postCount,
  s.last_mentioned_date as lastMention,
  s.first_mentioned_date as firstMention,
  'positive' as sentiment,
  s.sector as description
FROM stocks s
WHERE s.is_merry_mentioned = 1
ORDER BY s.last_mentioned_date DESC
LIMIT 5;
```

### API 엔드포인트
- **경로**: `/api/merry/stocks`
- **메서드**: GET
- **파라미터**: `limit` (기본값: 5, 최대: 10)
- **캐싱**: 12시간 TTL
- **응답 시간**: < 500ms

---

## 🎨 UI/UX 요구사항

### 레이아웃
- **제목**: "메르's Pick" 
- **최대 표시 개수**: 5-10개 종목
- **배치**: 카드 형태 또는 리스트 형태

### 각 종목당 표시 정보
- **티커 코드**: 종목 식별자 (예: TSLA, 005930)
- **종목명**: 한국어 회사명 우선, 영어명 fallback
- **최근 언급일**: YYYY-MM-DD 또는 상대 시간 표시
- **현재가**: 실시간 가격 (있는 경우)
- **등락률**: 전일 대비 등락률 (색상 구분)
- **회사 소개**: 한 줄 소개 (postCount가 아닌 실제 회사 설명)

### 스타일 가이드
- **배지 위치**: 종목 위에 배치 (종목 아래 X)
- **색상 구분**: 
  - 상승: 빨간색 (#dc2626)
  - 하락: 파란색 (#2563eb)
  - 보합: 회색 (#6b7280)
- **반응형**: 모바일에서 스크롤 가능한 카드 형태

### 인터랙션
- **클릭 이벤트**: 해당 종목 상세 페이지로 이동
- **호버 효과**: 카드 elevation 증가
- **로딩 상태**: 스켈레톤 UI 표시

---

## 📊 실시간 데이터 연동

### 주가 정보 (선택사항)
- **데이터 소스**: Yahoo Finance API
- **업데이트 주기**: 15분 지연 또는 실시간
- **한국 주식**: `{ticker}.KS` 형태로 호출
- **미국 주식**: `{ticker}` 그대로 호출
- **에러 처리**: API 실패 시 null 값으로 처리, 가격 미표시

### 캐싱 전략
- **종목 목록**: 12시간 캐시 (서버 메모리)
- **실시간 가격**: 5분 캐시 (Redis 권장)
- **API 호출 실패**: 이전 캐시 데이터 사용

---

## ⚡ 성능 요구사항

### 로딩 성능
- **초기 로딩**: < 500ms
- **메인 페이지 영향**: 전체 로딩에 영향 주지 않음
- **API 응답**: < 500ms
- **실시간 업데이트**: 페이지 새로고침시에만 갱신 (불필요한 실시간 업데이트 금지)

### 메모리 최적화
- **캐시 크기**: 최대 100개 종목 데이터
- **이미지 최적화**: WebP 포맷 사용
- **번들 크기**: 메르's Pick 컴포넌트 < 50KB

---

## 🔗 관련 컴포넌트 및 파일

### 주요 컴포넌트
- **`src/components/merry/MerryPickSection.tsx`**: 메인 메르's Pick 컴포넌트
- **`src/components/merry/MerryPickCard.tsx`**: 개별 종목 카드 컴포넌트

### API 파일
- **`src/app/api/merry/stocks/route.ts`**: 메르's Pick 데이터 API
- **`src/lib/stock-db-sqlite3.js`**: 데이터베이스 연동 로직

### 타입 정의
```typescript
interface MerryPickStock {
  ticker: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE';
  currency: 'KRW' | 'USD';
  postCount: number;
  firstMention: string; // ISO date
  lastMention: string; // ISO date
  sentiment: 'positive' | 'neutral' | 'negative';
  description: string;
  currentPrice?: number;
  priceChange?: string; // "+2.5%" or "-1.3%"
}
```

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **데이터 로딩**: 5개 종목이 최근 언급일 순으로 표시되는지 확인
2. **클릭 이벤트**: 각 종목 클릭 시 올바른 상세 페이지로 이동하는지 확인
3. **실시간 가격**: 가격 정보가 있는 종목은 현재가 표시 확인
4. **빈 데이터**: 메르 언급 종목이 없을 때 적절한 메시지 표시

### 성능 테스트
1. **로딩 시간**: 500ms 이내 렌더링 완료
2. **API 응답**: 데이터베이스 쿼리 + API 응답 < 500ms
3. **캐시 효과**: 12시간 캐시로 인한 빠른 로딩 확인

### 에러 처리 테스트
1. **데이터베이스 연결 실패**: 적절한 fallback 메시지
2. **API 타임아웃**: 이전 캐시 데이터 사용
3. **잘못된 데이터**: 데이터 유효성 검증 통과

---

## 📱 모바일 최적화

### 반응형 디자인
- **데스크톱**: 5개 종목을 한 줄에 표시
- **태블릿**: 3개 종목을 한 줄에 표시
- **모바일**: 1-2개 종목을 한 줄에 표시, 가로 스크롤

### 터치 최적화
- **최소 터치 영역**: 44px × 44px
- **스와이프 제스처**: 좌우 스크롤 지원
- **터치 피드백**: 0.1초 지연 시각적 피드백

---

## 🔧 개발 가이드라인

### 상태 관리
```typescript
// React 상태 관리 예시
interface MerryPickState {
  stocks: MerryPickStock[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}
```

### 에러 바운더리
```typescript
// 메르's Pick 전용 에러 바운더리
<ErrorBoundary fallback={<MerryPickErrorFallback />}>
  <MerryPickSection />
</ErrorBoundary>
```

### 접근성 (a11y)
- **스크린 리더**: `aria-label` 및 `role` 속성 추가
- **키보드 네비게이션**: Tab, Enter 키 지원
- **고대비 모드**: 색상 대비 4.5:1 이상 유지

---

> 📝 **마지막 업데이트**: 2025-08-13  
> 💬 **문의사항**: 메르's Pick 관련 질문이나 개선사항이 있으면 언제든지 알려주세요.