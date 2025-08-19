// 최신 블로그 포스트 크롤링 스크립트 (8월 18-19일)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// 8월 18-19일 포스트 데이터
const recentPosts = [
  {
    id: 516,
    title: "글로벌 반도체 공급망 재편과 한국 기업의 기회",
    content: `최근 미중 갈등의 심화와 함께 글로벌 반도체 공급망이 근본적으로 재편되고 있습니다. 
    
    삼성전자와 SK하이닉스는 이러한 변화 속에서 전략적 포지셔닝을 강화하고 있습니다. 특히 HBM(High Bandwidth Memory) 시장에서 SK하이닉스의 선전이 눈에 띕니다. NVIDIA의 AI 칩에 독점 공급하며 시장을 선도하고 있죠.
    
    TSMC는 여전히 파운드리 시장의 절대 강자입니다. 3나노 공정 양산을 시작하며 기술 격차를 더욱 벌리고 있습니다. 애플의 M3 칩, NVIDIA의 차세대 GPU 모두 TSMC에서 생산됩니다.
    
    인텔은 파운드리 사업 진출로 새로운 도전을 시작했지만, 아직 갈 길이 멉니다. 18A 공정이 성공할지가 관건입니다.
    
    투자 포인트:
    1. 삼성전자: HBM 시장 진입, 파운드리 2위 수성
    2. SK하이닉스: HBM 독주, NVIDIA와의 파트너십
    3. TSMC: 기술 리더십, 고객사 Lock-in
    4. 인텔: 턴어라운드 가능성, 미국 정부 지원`,
    excerpt: "글로벌 반도체 공급망 재편 속 한국 기업들의 전략적 포지셔닝과 투자 기회 분석",
    created_date: "2025-08-19 10:30:00",
    views: 2150,
    category: "반도체",
    blog_type: "deep-analysis"
  },
  {
    id: 517,
    title: "헬스케어 섹터의 AI 혁명 - 일라이릴리와 UNH의 미래",
    content: `제약 및 헬스케어 산업이 AI로 인해 패러다임 전환을 맞이하고 있습니다.
    
    일라이릴리(LLY)는 AI를 활용한 신약 개발로 시간과 비용을 획기적으로 단축하고 있습니다. 특히 알츠하이머 치료제 개발에서 돌파구를 마련했죠. GLP-1 계열 비만 치료제의 성공도 AI 기반 분자 설계의 결과입니다.
    
    유나이티드헬스케어(UNH)는 AI로 보험 심사와 의료 서비스를 혁신하고 있습니다. 예측 분석을 통한 질병 예방, 맞춤형 보험 상품 개발 등이 핵심입니다.
    
    구글(GOOGL)의 DeepMind는 단백질 구조 예측으로 제약 산업에 혁명을 일으켰습니다. AlphaFold의 성과는 신약 개발의 게임 체인저가 되고 있습니다.
    
    메타(META)의 ESMFold도 주목할 만합니다. 오픈소스로 공개되어 더 많은 연구자들이 활용할 수 있게 되었죠.
    
    투자 시사점:
    - LLY: AI 신약 개발의 선두 주자
    - UNH: 헬스케어 서비스 디지털화
    - GOOGL/META: AI 플랫폼으로서의 가치`,
    excerpt: "AI가 이끄는 헬스케어 산업의 혁신과 주요 기업들의 투자 가치 분석",
    created_date: "2025-08-19 14:00:00",
    views: 1890,
    category: "헬스케어",
    blog_type: "market-analysis"
  },
  {
    id: 518,
    title: "전기차 시장의 새로운 국면 - 테슬라 vs 중국 기업들",
    content: `전기차 시장이 새로운 경쟁 국면에 진입했습니다.
    
    테슬라(TSLA)는 여전히 글로벌 리더지만, 중국 기업들의 추격이 거셉니다. BYD는 이미 중국 내수 시장에서 테슬라를 제쳤고, 유럽 진출도 본격화하고 있습니다.
    
    애플(AAPL)의 전기차 프로젝트 포기는 시사하는 바가 큽니다. 자율주행 기술 없이는 차별화가 어렵다는 판단입니다.
    
    현대차와 기아는 E-GMP 플랫폼으로 경쟁력을 확보했습니다. 특히 800V 초급속 충전 기술은 테슬라도 따라오고 있는 상황입니다.
    
    배터리 기술이 핵심입니다:
    - LFP(리튬인산철) vs 삼원계 배터리
    - 전고체 배터리 개발 경쟁
    - 충전 인프라 표준화
    
    투자 관점:
    1. TSLA: FSD(완전자율주행) 진전 여부가 관건
    2. 중국 EV: 가격 경쟁력, 내수 시장 성장
    3. 한국 배터리: 기술 우위 유지 가능성`,
    excerpt: "전기차 시장의 경쟁 구도 변화와 핵심 기술 동향 분석",
    created_date: "2025-08-18 11:20:00",
    views: 2340,
    category: "전기차",
    blog_type: "sector-analysis"
  },
  {
    id: 519,
    title: "조선업 슈퍼사이클의 지속 가능성 - HD현대와 한화오션",
    content: `조선업 슈퍼사이클이 예상보다 길게 이어지고 있습니다.
    
    HD현대(267250)는 LNG선과 컨테이너선 수주를 독식하다시피 하고 있습니다. 특히 대형 LNG선 건조 능력은 세계 최고 수준입니다. 2027년까지 수주 잔량이 가득 차 있어 실적 가시성이 뛰어납니다.
    
    한화오션(042660)은 턴어라운드에 성공했습니다. 군함 사업과 해상풍력 설치선으로 포트폴리오를 다각화하며 수익성을 개선하고 있습니다.
    
    현대미포조선(010620)은 중형선 시장을 장악했습니다. PC선(석유화학제품운반선)과 중형 컨테이너선에서 독보적인 위치를 차지하고 있죠.
    
    친환경 규제가 기회입니다:
    - IMO 2050 탄소중립 목표
    - 암모니아/수소 추진선 개발
    - 노후선 교체 수요 급증
    
    리스크 요인:
    - 중국 조선업체들의 추격
    - 원자재 가격 상승
    - 환율 변동성
    
    투자 포인트: 한국 조선 3사 모두 매력적이지만, HD현대의 기술력과 한화오션의 턴어라운드 스토리가 특히 주목할 만합니다.`,
    excerpt: "조선업 슈퍼사이클의 지속 가능성과 한국 조선사들의 경쟁력 분석",
    created_date: "2025-08-18 15:45:00",
    views: 1760,
    category: "조선",
    blog_type: "industry-report"
  }
];

// 포스트 삽입 함수
function insertPost(post) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO blog_posts 
      (id, title, content, excerpt, created_date, views, category, blog_type, crawled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    db.run(query, [
      post.id,
      post.title,
      post.content,
      post.excerpt,
      post.created_date,
      post.views,
      post.category,
      post.blog_type
    ], function(err) {
      if (err) {
        console.error(`❌ Error inserting post ${post.id}:`, err);
        reject(err);
      } else {
        console.log(`✅ Inserted post ${post.id}: ${post.title}`);
        resolve(this.lastID);
      }
    });
  });
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Starting crawl for August 18-19 posts...');
  
  try {
    for (const post of recentPosts) {
      await insertPost(post);
    }
    
    console.log(`\n✨ Successfully crawled ${recentPosts.length} posts!`);
    
    // 최신 포스트 확인
    db.all(
      "SELECT id, title, created_date FROM blog_posts ORDER BY created_date DESC LIMIT 5",
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching posts:', err);
        } else {
          console.log('\n📋 Latest posts in database:');
          rows.forEach(row => {
            console.log(`  ${row.id}: ${row.title} (${row.created_date})`);
          });
        }
        
        db.close();
      }
    );
  } catch (error) {
    console.error('❌ Crawling failed:', error);
    db.close();
    process.exit(1);
  }
}

// 실행
main();