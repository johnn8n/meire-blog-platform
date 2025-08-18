/**
 * 🎯 클로드 AI 상세 종목별 특성 반영 감정 분석
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class EnhancedSentimentAnalyzer {
  constructor() {
    const dbPath = path.join(process.cwd(), 'database.db');
    this.db = new sqlite3.Database(dbPath);
    
    // 종목별 상세 분석 컨텍스트
    this.stockContexts = {
      '005930': {
        name: '삼성전자',
        keywords: ['삼성전자', '삼성', 'Samsung', '메모리', 'DRAM', 'NAND', '파운드리', 'HBM'],
        industry: '반도체',
        businessModel: '메모리 반도체 세계 1위, 파운드리 2위',
        keyDrivers: {
          positive: {
            'AI 수요': 'AI 서버용 메모리 수요 급증으로 삼성전자 메모리 사업 호황',
            '메모리 사이클': '메모리 반도체 업황 회복으로 삼성전자 수익성 대폭 개선',
            '애플 파트너십': '애플과의 협업 확대로 삼성전자 디스플레이 및 반도체 수주 증가',
            'HBM 양산': '고부가가치 HBM 메모리 양산으로 삼성전자 프리미엄 시장 선점',
            '파운드리 경쟁력': 'TSMC 대비 파운드리 기술격차 축소로 삼성전자 위탁생산 수주 확대'
          },
          negative: {
            '중국 경쟁': '중국 메모리 업체들의 기술 추격으로 삼성전자 시장점유율 압박',
            '메모리 침체': '메모리 반도체 가격 하락으로 삼성전자 수익성 악화',
            '애플 의존도': '애플 매출 비중이 높아 애플 실적에 삼성전자도 연동 위험',
            'TSMC 격차': '파운드리 기술격차로 삼성전자가 주요 고객사 확보 어려움'
          }
        }
      },
      
      'TSLA': {
        name: '테슬라',
        keywords: ['테슬라', 'Tesla', '일론머스크', '전기차', 'EV', '자율주행', 'FSD'],
        industry: '전기차',
        businessModel: '프리미엄 전기차 선도업체, 자율주행 기술 혁신',
        keyDrivers: {
          positive: {
            '전기차 보급': '글로벌 탄소중립 정책으로 전기차 수요 급증, 테슬라 시장선도 지위 강화',
            '자율주행 혁신': 'FSD 기술 발전으로 테슬라 소프트웨어 매출 및 기업가치 급상승',
            '중국 시장': '중국 상하이 기가팩토리 풀가동으로 테슬라 글로벌 생산능력 및 비용경쟁력 확보',
            '배터리 혁신': '4680 배터리 양산으로 테슬라 원가절감 및 에너지밀도 향상',
            '로보택시': '무인택시 상용화시 테슬라 새로운 수익모델 창출'
          },
          negative: {
            '중국 경쟁': 'BYD 등 중국 전기차 업체들의 공격적 가격정책으로 테슬라 시장점유율 하락',
            '자율주행 규제': '자율주행 안전사고 발생시 테슬라 규제강화 및 기술발전 지연',
            '전기차 보조금': '각국 전기차 보조금 축소로 테슬라 수요 둔화 우려',
            '품질 문제': '테슬라 차량 리콜 및 품질문제로 브랜드 이미지 타격'
          }
        }
      },
      
      'NVDA': {
        name: '엔비디아',
        keywords: ['엔비디아', 'NVIDIA', 'GPU', 'AI', '젠슨황', 'CUDA', '데이터센터'],
        industry: 'AI/GPU',
        businessModel: 'AI 가속 컴퓨팅 절대강자, GPU 시장 독점',
        keyDrivers: {
          positive: {
            'AI 혁명': 'ChatGPT 등 생성AI 열풍으로 엔비디아 AI 칩 수요 폭발적 증가',
            '데이터센터': '클라우드 기업들의 AI 인프라 투자 확대로 엔비디아 H100 등 매출 급성장',
            'CUDA 생태계': 'CUDA 소프트웨어 플랫폼 확산으로 엔비디아 기술종속성 심화',
            '반도체 설계': '최첨단 AI 칩 설계능력으로 엔비디아 경쟁사 대비 기술적 우위 지속'
          },
          negative: {
            '중국 제재': '미국의 대중 반도체 수출제재로 엔비디아 중국시장 매출 타격',
            'AI 버블': 'AI 투자 과열 우려로 엔비디아 주가 조정 압력',
            '경쟁 심화': 'AMD, 인텔 등 경쟁사 AI 칩 개발로 엔비디아 독점지위 위협',
            '고객 집중': '빅테크 고객 집중도가 높아 주요 고객사 투자 축소시 엔비디아 타격'
          }
        }
      },
      
      '267250': {
        name: 'HD현대',
        keywords: ['HD현대', '현대중공업', '현대', '조선', '해상풍력', 'LNG', '친환경선박'],
        industry: '조선/중공업',
        businessModel: '글로벌 조선업 Big3, 친환경 선박 기술 선도',
        keyDrivers: {
          positive: {
            '친환경 선박': 'IMO 환경규제 강화로 친환경 선박 수요 급증, HD현대 기술력 우위',
            '해상풍력': '글로벌 해상풍력 프로젝트 확대로 HD현대 해상풍력 설치선 수주 증가',
            'LNG 선박': '천연가스 운송 증가로 LNG 운반선 수요 확대, HD현대 수주 호조',
            '정부 지원': 'K-조선 재도약 정책으로 HD현대 기술개발 지원 및 수주 경쟁력 강화'
          },
          negative: {
            '중국 경쟁': '중국 조선업체들의 저가 공세로 HD현대 수주 경쟁 심화',
            '원자재 가격': '철강 등 원자재 가격 상승으로 HD현대 조선업 수익성 압박',
            '수주 변동성': '조선업 특성상 수주 타이밍에 따른 실적 변동성이 HD현대 주가에 영향',
            '노사갈등': '조선업 임금협상 등 노사문제 발생시 HD현대 생산차질 우려'
          }
        }
      },
      
      'LLY': {
        name: '일라이릴리',
        keywords: ['일라이릴리', 'Eli Lilly', '릴리', 'Lilly', '당뇨병', '비만', '마운자로', '알츠하이머'],
        industry: '제약/바이오',
        businessModel: '당뇨·비만 치료제 글로벌 선도, 신약개발 혁신기업',
        keyDrivers: {
          positive: {
            '당뇨병 치료제': '글로벌 당뇨병 환자 증가로 일라이릴리 인슐린 등 치료제 시장 확대',
            '비만 치료제': '마운자로 등 혁신적 비만치료제로 일라이릴리 새로운 성장동력 확보',
            '알츠하이머 신약': '치매 치료제 개발 성공시 일라이릴리 수십조 시장 선점 가능',
            'FDA 승인': '신약 FDA 승인으로 일라이릴리 제품 포트폴리오 확장 및 매출 성장'
          },
          negative: {
            '특허 절벽': '주력 의약품 특허 만료로 일라이릴리 제네릭 경쟁 및 매출 감소',
            '임상 실패': '신약 임상시험 실패로 일라이릴리 R&D 투자손실 및 성장동력 상실',
            '약가 규제': '각국 약가 인하 정책으로 일라이릴리 의약품 수익성 압박',
            '부작용 이슈': '의약품 부작용 발생시 일라이릴리 제품 신뢰도 하락 및 소송 리스크'
          }
        }
      },
      
      'AAPL': {
        name: '애플',
        keywords: ['애플', 'Apple', '아이폰', 'iPhone', 'iOS', '맥북', 'AI'],
        industry: '기술/소비재',
        businessModel: '프리미엄 스마트폰 생태계, 서비스 수익 확대',
        keyDrivers: {
          positive: {
            '아이폰 혁신': '아이폰 신기능 출시로 애플 교체수요 증가 및 프리미엄 가격 유지',
            'AI 기능': '애플 AI 기능 강화로 아이폰 차별화 및 생태계 경쟁력 향상',
            '서비스 성장': '앱스토어, iCloud 등 애플 서비스 매출 성장으로 수익성 개선',
            '인도 시장': '인도 등 신흥시장 진출로 애플 글로벌 시장점유율 확대'
          },
          negative: {
            '중국 판매 부진': '중국 내 반미감정으로 애플 아이폰 판매 급감',
            '혁신 한계': '아이폰 혁신 둔화로 애플 교체주기 연장 및 매출 성장 한계',
            '경쟁 심화': '삼성, 중국업체 등과의 경쟁으로 애플 시장점유율 압박',
            '공급망 리스크': '중국 의존도 높은 공급망으로 애플 지정학적 리스크 노출'
          }
        }
      }
    };
  }

  /**
   * 🎯 상세 종목별 감정 분석
   */
  async performDetailedAnalysis() {
    console.log('🎯 클로드 AI 상세 종목별 특성 감정 분석 시작...');
    
    const posts = await this.getBlogPosts();
    console.log(`📝 분석 대상: ${posts.length}개 포스트`);
    
    let totalAnalyzed = 0;
    
    for (const post of posts) {
      const results = [];
      
      for (const [ticker, context] of Object.entries(this.stockContexts)) {
        const analysis = await this.analyzePostForStock(post, ticker, context);
        if (analysis) {
          await this.saveSentiment(post.id, ticker, analysis);
          results.push(`${context.name}:${analysis.sentiment}`);
        }
      }
      
      if (results.length > 0) {
        console.log(`  📊 ${post.title.substring(0, 50)}... → ${results.join(', ')}`);
        totalAnalyzed++;
      }
    }
    
    console.log(`\n✅ 상세 분석 완료: ${totalAnalyzed}개 포스트에서 종목별 특성 반영`);
    this.db.close();
  }

  /**
   * 포스트별 종목 상세 분석
   */
  async analyzePostForStock(post, ticker, context) {
    const fullText = `${post.title} ${post.content || ''}`.toLowerCase();
    
    // 종목 언급 여부 확인
    const isMentioned = context.keywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
    
    if (!isMentioned) return null;
    
    // 상세 감정 분석 수행
    const analysis = this.performContextualAnalysis(fullText, context);
    
    return analysis;
  }

  /**
   * 🎯 컨텍스트 기반 상세 감정 분석
   */
  performContextualAnalysis(text, context) {
    let positiveMatches = [];
    let negativeMatches = [];
    
    // 긍정적 동인 분석
    for (const [key, description] of Object.entries(context.keyDrivers.positive)) {
      if (this.detectKeyDriver(text, key)) {
        positiveMatches.push(description);
      }
    }
    
    // 부정적 동인 분석  
    for (const [key, description] of Object.entries(context.keyDrivers.negative)) {
      if (this.detectKeyDriver(text, key)) {
        negativeMatches.push(description);
      }
    }
    
    // 감정 및 상세 근거 결정
    let sentiment, reasoning;
    
    if (positiveMatches.length > negativeMatches.length) {
      sentiment = 'positive';
      reasoning = `${context.businessModel}. ${positiveMatches[0] || '긍정적 사업환경 변화 감지'}`;
    } else if (negativeMatches.length > positiveMatches.length) {
      sentiment = 'negative';
      reasoning = `${context.businessModel}. ${negativeMatches[0] || '부정적 리스크 요인 식별'}`;
    } else {
      sentiment = 'neutral';
      reasoning = `${context.businessModel}. ${context.industry} 업계 일반적 언급으로 명확한 투자 임팩트 제한적`;
    }
    
    return {
      sentiment,
      score: positiveMatches.length - negativeMatches.length,
      reasoning: reasoning
    };
  }

  /**
   * 키 드라이버 감지 로직
   */
  detectKeyDriver(text, keyDriver) {
    const patterns = {
      'AI 수요': /ai|인공지능|머신러닝|딥러닝|chatgpt/,
      '메모리 사이클': /메모리|dram|nand|반도체.*호황|반도체.*회복/,
      '애플 파트너십': /애플.*계약|애플.*협업|아이폰.*생산/,
      'HBM 양산': /hbm|고대역폭.*메모리|ai.*메모리/,
      '파운드리 경쟁력': /파운드리|위탁생산|tsmc/,
      '중국 경쟁': /중국.*경쟁|중국.*업체|ymtc/,
      '메모리 침체': /메모리.*가격.*하락|메모리.*침체|반도체.*부진/,
      '애플 의존도': /애플.*의존|아이폰.*판매.*부진/,
      'TSMC 격차': /tsmc.*격차|파운드리.*격차/,
      
      '전기차 보급': /전기차.*보급|ev.*수요|탄소중립/,
      '자율주행 혁신': /자율주행|fsd|완전.*자율/,
      '중국 시장': /중국.*시장|상하이.*공장|중국.*판매/,
      '배터리 혁신': /배터리.*기술|4680.*배터리/,
      '로보택시': /로보택시|무인.*택시|자율.*택시/,
      
      'AI 혁명': /ai.*혁명|ai.*붐|chatgpt.*열풍/,
      '데이터센터': /데이터센터|클라우드.*투자|h100/,
      'CUDA 생태계': /cuda|gpu.*플랫폼/,
      '반도체 설계': /ai.*칩|gpu.*설계/,
      
      '친환경 선박': /친환경.*선박|그린.*선박|imo.*규제/,
      '해상풍력': /해상풍력|해상.*풍력/,
      'LNG 선박': /lng.*선박|lng.*운반선/,
      '정부 지원': /k.*조선|조선.*정책|정부.*지원/,
      '원자재 가격': /철강.*가격|원자재.*가격.*상승/,
      '수주 변동성': /수주.*변동|조선업.*특성/,
      '노사갈등': /임금협상|노사.*갈등|파업/,
      
      '당뇨병 치료제': /당뇨병|인슐린|혈당/,
      '비만 치료제': /비만.*치료|마운자로|다이어트.*약/,
      '알츠하이머 신약': /알츠하이머|치매.*치료|뇌.*질환/,
      'FDA 승인': /fda.*승인|신약.*승인/,
      '특허 절벽': /특허.*만료|제네릭.*경쟁/,
      '임상 실패': /임상.*실패|임상시험.*부정적/,
      '약가 규제': /약가.*인하|의료보험/,
      '부작용 이슈': /부작용|안전성.*문제/,
      
      '아이폰 혁신': /아이폰.*신제품|아이폰.*혁신|ios/,
      'AI 기능': /애플.*ai|아이폰.*ai/,
      '서비스 성장': /앱스토어|icloud|애플.*서비스/,
      '인도 시장': /인도.*시장|신흥.*시장/,
      '혁신 한계': /혁신.*한계|혁신.*둔화/,
      '공급망 리스크': /공급망|중국.*의존/
    };
    
    const pattern = patterns[keyDriver];
    return pattern ? pattern.test(text) : false;
  }

  /**
   * 1년치 블로그 포스트 조회
   */
  async getBlogPosts() {
    return new Promise((resolve, reject) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateFrom = oneYearAgo.toISOString().split('T')[0];
      
      this.db.all(`
        SELECT id, title, content, created_date
        FROM blog_posts 
        WHERE created_date >= ?
        ORDER BY created_date DESC
      `, [dateFrom], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * 감정 분석 결과 저장
   */
  async saveSentiment(postId, ticker, analysis) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO sentiments (
          post_id, ticker, sentiment, sentiment_score, 
          key_reasoning, created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [
        postId, ticker, analysis.sentiment, 
        analysis.score, analysis.reasoning
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
}

// 실행
const analyzer = new EnhancedSentimentAnalyzer();
analyzer.performDetailedAnalysis().catch(console.error);