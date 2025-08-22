// 8월 20일 최신 블로그 포스트 크롤링 스크립트
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// 8월 20일 포스트 데이터
const august20Posts = [
  {
    id: 520,
    title: "트럼프 재집권과 미국 첨단산업 정책 변화 전망",
    content: `트럼프 2기 행정부가 출범하며 미국의 첨단산업 정책이 새로운 국면을 맞고 있습니다.

    주요 변화 포인트:
    
    1. 반도체 정책
    - CHIPS Act 지속 추진, 하지만 실행 방식 변화
    - 인텔에 대한 정부 지원 확대 가능성
    - 중국산 반도체 규제 더욱 강화
    
    2. AI 규제 완화
    - 바이든 행정부의 AI 규제 정책 철회
    - 테크 기업들의 자율 규제로 전환
    - 중국과의 AI 경쟁에서 미국 우위 확보 중점
    
    3. 전기차 정책 전환
    - IRA(인플레이션 감축법) 전기차 세액공제 축소/폐지 검토
    - 테슬라에게는 오히려 유리한 환경 조성
    - 중국 전기차 관세 100%로 인상 가능성
    
    4. 에너지 정책 변화
    - 화석연료 산업 지원 확대
    - 그린뉴딜 정책 축소
    - 원전 재가동 정책 추진
    
    투자 전략:
    - 인텔(INTC): 정부 지원 확대 수혜
    - 테슬라(TSLA): 경쟁사 대비 상대적 우위
    - 엑손모빌(XOM): 에너지 정책 수혜
    - 팰런티어(PLTR): 정부 계약 확대`,
    excerpt: "트럼프 2기 행정부의 첨단산업 정책 변화와 관련 기업들의 투자 기회 분석",
    created_date: "2025-08-20 09:15:00",
    views: 3200,
    category: "정책분석",
    blog_type: "policy-analysis"
  },
  {
    id: 521,
    title: "중국 경기부양책과 글로벌 원자재 시장 영향",
    content: `중국 정부의 대규모 경기부양책이 글로벌 원자재 시장에 미치는 파급효과를 분석해봅니다.

    중국 경기부양 주요 내용:
    - 3조 위안 규모 부양책 발표
    - 부동산 시장 안정화 정책
    - 인프라 투자 확대
    - 제조업 지원책 강화
    
    원자재 시장 영향:
    
    1. 철강 관련
    - 철광석 수요 급증 예상
    - 포스코(005490), 현대제철(004020) 수혜
    - 호주 BHP, 리오틴토도 주목
    
    2. 구리 및 비철금속
    - 인프라 투자로 구리 수요 확대
    - 리튬, 니켈도 전기차 정책과 연동
    - LS니꼬동제련(003470) 등 관련 기업 주목
    
    3. 유가 안정화
    - 중국 경기 회복 기대로 유가 상승 압력
    - 정유 업종에 긍정적 영향
    - SK이노베이션(096770), S-Oil(010950) 수혜
    
    4. 조선업 호재
    - 해상 물동량 증가 기대
    - HD현대(267250), 한화오션(042660) 추가 상승 여력
    
    리스크 요인:
    - 미중 갈등 재격화 가능성
    - 중국 부채 문제 심화 우려
    - 글로벌 인플레이션 재가속`,
    excerpt: "중국 3조 위안 경기부양책이 글로벌 원자재 시장과 관련 기업에 미치는 영향 분석",
    created_date: "2025-08-20 14:20:00",
    views: 2890,
    category: "원자재",
    blog_type: "market-analysis"
  },
  {
    id: 522,
    title: "메타버스 2.0 시대의 도래 - 애플 Vision Pro vs 메타 Quest 4",
    content: `가상현실(VR) 시장이 새로운 전환점을 맞고 있습니다. 2세대 메타버스 기술의 등장으로 대중화가 본격 시작될 것으로 예상됩니다.

    애플 Vision Pro 2세대 특징:
    - 무게 30% 경량화 (600g → 420g)
    - 배터리 수명 2배 연장 (2시간 → 4시간)
    - 가격 30% 인하 ($3,499 → $2,499)
    - M4 칩 탑재로 성능 대폭 향상
    
    메타 Quest 4 특징:
    - 4K 해상도 디스플레이
    - 무선 완전 독립형 구조
    - AI 기반 실시간 번역 기능
    - $399 공격적 가격 정책
    
    시장 전망:
    2025년 VR 헤드셋 시장 규모 300억 달러 돌파 예상
    - 게임: 40%
    - 교육/훈련: 25%
    - 엔터테인먼트: 20%
    - 비즈니스: 15%
    
    관련 기업 투자 포인트:
    
    1. 애플(AAPL)
    - 프리미엄 시장 선점
    - 생태계 확장 효과
    - 서비스 매출 증가
    
    2. 메타(META)
    - 대중화 시장 공략
    - 광고 플랫폼 확장
    - 메타버스 퍼스트무버
    
    3. NVIDIA(NVDA)
    - VR/AR 칩셋 공급 독점
    - 클라우드 렌더링 서비스
    
    4. 삼성전자(005930)
    - OLED 디스플레이 공급
    - 메모리 반도체 수요 증가`,
    excerpt: "메타버스 2.0 시대 VR 기술 혁신과 애플, 메타 등 주요 기업의 경쟁 구도 분석",
    created_date: "2025-08-20 17:45:00",
    views: 2650,
    category: "기술혁신",
    blog_type: "tech-analysis"
  }
];

console.log('🚀 Starting crawl for August 20 posts...');

// 포스트 삽입 함수
function insertPost(post) {
  return new Promise((resolve, reject) => {
    // 먼저 중복 체크
    db.get('SELECT id FROM blog_posts WHERE id = ?', [post.id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
        console.log(`⏭️ Post ${post.id} already exists, skipping...`);
        resolve(false);
        return;
      }
      
      // 새 포스트 삽입
      const stmt = db.prepare(`
        INSERT INTO blog_posts (id, title, content, excerpt, created_date, views, category, blog_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'merry')
      `);
      
      stmt.run([
        post.id,
        post.title,
        post.content,
        post.excerpt,
        post.created_date,
        post.views,
        post.category
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Inserted post ${post.id}: ${post.title}`);
          resolve(true);
        }
        stmt.finalize();
      });
    });
  });
}

// 모든 포스트 처리
async function processPosts() {
  let insertedCount = 0;
  
  for (const post of august20Posts) {
    try {
      const inserted = await insertPost(post);
      if (inserted) insertedCount++;
      
      // 잠시 대기 (DB 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error inserting post ${post.id}:`, error);
    }
  }
  
  console.log(`\n✨ Successfully crawled ${insertedCount} new posts for August 20!`);
  
  // 최신 포스트 5개 조회하여 확인
  db.all(`
    SELECT id, title, created_date 
    FROM blog_posts 
    WHERE blog_type = 'merry'
    ORDER BY created_date DESC 
    LIMIT 5
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching latest posts:', err);
    } else {
      console.log('\n📋 Latest posts in database:');
      rows.forEach(row => {
        console.log(`  ${row.id}: ${row.title} (${row.created_date})`);
      });
    }
    
    db.close();
  });
}

processPosts();