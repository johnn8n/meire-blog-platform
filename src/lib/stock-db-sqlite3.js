// sqlite3를 사용한 종가 데이터베이스 유틸리티
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class StockDB {
  constructor() {
    const dbPath = path.join(process.cwd(), 'database.db');
    this.db = null;
    this.isConnected = false;
    this.connecting = false;
  }

  // 연결 풀링 및 재사용을 위한 개선된 DB 연결
  async connect() {
    // 이미 연결된 경우 재사용
    if (this.isConnected && this.db) {
      return Promise.resolve();
    }

    // 연결 중인 경우 대기
    if (this.connecting) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.isConnected) {
            resolve();
          } else {
            setTimeout(checkConnection, 50);
          }
        };
        checkConnection();
      });
    }

    this.connecting = true;

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path.join(process.cwd(), 'database.db'), 
        sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error('SQLite3 연결 실패:', err);
          this.connecting = false;
          reject(err);
        } else {
          this.isConnected = true;
          this.connecting = false;
          
          // WAL 모드 활성화 (성능 향상)
          this.db.run("PRAGMA journal_mode = WAL;");
          this.db.run("PRAGMA synchronous = NORMAL;");
          this.db.run("PRAGMA cache_size = 5000;"); // 캐시 크기 증가
          this.db.run("PRAGMA temp_store = MEMORY;");
          this.db.run("PRAGMA wal_autocheckpoint = 1000;"); // 체크포인트 최적화
          this.db.run("PRAGMA busy_timeout = 30000;"); // 30초 대기
          
          console.log('🚀 SQLite3 고성능 모드 활성화 완료');
          
          resolve();
        }
      });
    });
  }

  // 메르 언급 종목인지 확인
  async isMerryMentionedStock(ticker) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT COUNT(*) as mention_count
        FROM stock_mentions_unified 
        WHERE ticker = ? AND mentioned_date IS NOT NULL
      `, [ticker], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.mention_count > 0);
        }
      });
    });
  }

  // 종목 정보 가져오기
  async getStockInfo(ticker) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          ticker, 
          company_name_kr, 
          market, 
          currency,
          CASE WHEN COUNT(CASE WHEN mentioned_date IS NOT NULL THEN 1 END) > 0 THEN 1 ELSE 0 END as is_merry_mentioned
        FROM stock_mentions_unified 
        WHERE ticker = ?
        GROUP BY ticker, company_name_kr, market, currency
      `, [ticker], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 6개월치 종가 데이터 가져오기
  async getStockPrices(ticker, period = '6mo') {
    if (!this.isConnected) await this.connect();
    
    // 한국 주식의 .KS 접미사 제거
    const cleanTicker = ticker.replace('.KS', '');
    
    // 기간 계산
    const endDate = new Date();
    const startDate = new Date();
    
    // period 형식 정규화 (1mo, 3mo, 6mo -> 숫자 추출)
    const normalizedPeriod = period.toLowerCase();
    
    switch (normalizedPeriod) {
      case '1y':
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '6mo':
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '3mo':
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '1mo':
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '1w':
        startDate.setDate(endDate.getDate() - 7);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`📊 Getting stock prices for ${cleanTicker} - Period: ${period} (${normalizedPeriod})`);
    console.log(`📅 Date range: ${startDateStr} ~ ${endDateStr}`);
    
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT date, close_price, volume
        FROM stock_prices 
        WHERE ticker = ? AND date >= ? AND date <= ?
        ORDER BY date ASC
      `, [cleanTicker, startDateStr, endDateStr], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Found ${rows?.length || 0} price records for ${ticker} in period ${period}`);
          resolve(rows || []);
        }
      });
    });
  }

  // 메르 언급 날짜 가져오기 (차트 마커용)
  async getMerryMentions(ticker) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT mentioned_date, mention_type, sentiment_score, post_id, context
        FROM stock_mentions_unified
        WHERE ticker = ? AND mentioned_date IS NOT NULL
        ORDER BY mentioned_date DESC
      `, [ticker], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // 메르's Pick 종목 가져오기 (최근 언급 순) - VIEW 사용
  async getMerryPickStocks(limit = 10) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          s.ticker,
          s.company_name as name,
          s.company_name_kr as nameKr,
          s.market,
          s.currency,
          COALESCE(s.real_mention_count, old.mention_count, 0) as postCount,
          s.last_mention_date as lastMention,
          s.first_mention_date as firstMention,
          'positive' as sentiment,
          s.sector,
          old.mention_count as legacy_mention_count
        FROM stock_stats_view s
        LEFT JOIN stocks old ON s.ticker = old.ticker
        WHERE s.is_merry_mentioned = 1
        ORDER BY s.last_mention_date DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // 회사별 실제 설명 매핑
          const companyDescriptions = {
            'TSLA': '전기차와 자율주행 기술의 글로벌 선도기업, 에너지 저장 및 태양광 사업도 운영',
            '005930': '세계 최대 반도체 메모리 제조사이자 스마트폰, 디스플레이 등 다양한 IT 제품 생산',
            'AAPL': '아이폰, 맥, 아이패드 등을 제조하는 세계 최대 기술 기업',
            'MSFT': '윈도우 운영체제와 오피스 소프트웨어, 클라우드 서비스를 제공하는 글로벌 IT 기업',
            'GOOGL': '구글 검색엔진과 유튜브, 안드로이드를 운영하는 인터넷 서비스 기업',
            'AMZN': '전자상거래와 클라우드 컴퓨팅(AWS)을 주력으로 하는 글로벌 기업',
            'META': '페이스북, 인스타그램, 왓츠앱을 운영하는 소셜미디어 플랫폼 기업',
            'NVDA': 'GPU와 AI 칩 분야의 글로벌 리더, 자율주행과 데이터센터용 프로세서 제조',
            '한와시스템': '방산 및 항공우주 분야의 종합 시스템 통합 업체',
            '한화오션': '해양플랜트, 선박건조, 해상풍력 등 해양 에너지 솔루션 전문기업'
          };
          
          // 데이터 형식 변환
          const formatted = (rows || []).map(row => {
            const ticker = row.ticker;
            const name = row.nameKr || row.name;
            // legacy_mention_count가 있으면 사용, 없으면 real_mention_count 사용
            const actualMentionCount = row.legacy_mention_count || row.postCount;
            let description = companyDescriptions[ticker] || companyDescriptions[name];
            
            // 회사 설명이 없으면 기본 설명 생성
            if (!description) {
              if (row.sector) {
                description = `${row.sector} 분야의 주요 기업`;
              } else {
                description = `${name}의 사업 정보`;
              }
            }
            
            // 날짜 정규화 (혼재된 형식 통일)
            const normalizeDate = (dateStr) => {
              if (!dateStr) return dateStr;
              // 타임스탬프가 포함된 경우 날짜 부분만 추출
              return dateStr.split(' ')[0];
            };

            return {
              ticker: row.ticker,
              name: name,
              market: row.market || 'NASDAQ',
              currency: row.currency || 'USD',
              postCount: actualMentionCount || 0,
              firstMention: normalizeDate(row.firstMention),
              lastMention: normalizeDate(row.lastMention),
              sentiment: row.sentiment || 'neutral',
              tags: [],
              description: description,
              recentPosts: [],
              mentions: actualMentionCount || 0
            };
          });
          resolve(formatted);
        }
      });
    });
  }

  // 모든 메르 언급 종목 목록 가져오기
  async getMerryMentionedStocks(limit = 10) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          s.ticker, 
          s.company_name, 
          s.company_name_kr, 
          s.market, 
          s.currency, 
          COUNT(CASE WHEN s.mentioned_date IS NOT NULL THEN 1 END) as mention_count, 
          MAX(s.mentioned_date) as last_mentioned_date,
          COUNT(sp.id) as price_data_count
        FROM stock_mentions_unified s
        LEFT JOIN stock_prices sp ON s.ticker = sp.ticker
        WHERE s.mentioned_date IS NOT NULL
        GROUP BY s.ticker, s.company_name, s.company_name_kr, s.market, s.currency
        ORDER BY MAX(s.mentioned_date) DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // 개별 종목 정보 가져오기
  async getStockByTicker(ticker) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          ticker,
          company_name,
          company_name_kr,
          market,
          currency,
          sector,
          industry,
          COUNT(CASE WHEN mentioned_date IS NOT NULL THEN 1 END) as mention_count,
          MIN(mentioned_date) as first_mentioned_date,
          MAX(mentioned_date) as last_mentioned_date,
          CASE WHEN COUNT(CASE WHEN mentioned_date IS NOT NULL THEN 1 END) > 0 THEN 1 ELSE 0 END as is_merry_mentioned
        FROM stock_mentions_unified
        WHERE ticker = ?
        GROUP BY ticker, company_name, company_name_kr, market, currency, sector, industry
      `, [ticker], (err, row) => {
        if (err) {
          reject(err);
        } else {
          // 날짜 정규화 적용
          if (row) {
            const normalizeDate = (dateStr) => {
              if (!dateStr) return dateStr;
              // 타임스탬프가 포함된 경우 날짜 부분만 추출
              return dateStr.split(' ')[0];
            };
            
            row.first_mentioned_date = normalizeDate(row.first_mentioned_date);
            row.last_mentioned_date = normalizeDate(row.last_mentioned_date);
          }
          resolve(row);
        }
      });
    });
  }

  // 관련 포스트 가져오기 (페이지네이션 지원)
  // blog_posts 테이블에서 ticker와 연관된 포스트 검색
  async getRelatedPosts(ticker, limit = 5, offset = 0) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      // 주식명 매핑 (ticker -> 회사명)
      const tickerToNameMap = {
        '005930': '삼성전자',
        'TSLA': '테슬라',
        'AAPL': '애플',
        'NVDA': '엔비디아',
        'INTC': '인텔',
        'TSMC': 'TSMC',
        '042660': '한화오션',
        '267250': 'HD현대',
        '010620': '현대미포조선',
        'LLY': '일라이릴리',
        'UNH': '유나이티드헬스케어',
        'BRK': '버크셔헤서웨이',
        'GOOGL': '구글',
        'MSFT': '마이크로소프트',
        'META': '메타',
        'AMD': 'AMD'
      };
      
      const stockName = tickerToNameMap[ticker] || ticker;
      const searchTerms = [ticker, stockName];
      
      // 검색어 패턴 생성 (ticker OR 회사명)
      const searchPattern = searchTerms.map(term => `%${term}%`).join(' OR ');
      const whereClause = searchTerms.map(() => '(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)').join(' OR ');
      const searchParams = [];
      searchTerms.forEach(term => {
        const pattern = `%${term}%`;
        searchParams.push(pattern, pattern, pattern);
      });
      
      console.log(`🔍 Searching for posts with ticker: ${ticker}, name: ${stockName}`);
      
      // 전체 포스트 수 먼저 조회
      this.db.get(`
        SELECT COUNT(*) as total
        FROM blog_posts
        WHERE ${whereClause}
      `, searchParams, (err, countResult) => {
        if (err) {
          console.error('Count query failed:', err);
          reject(err);
          return;
        }
        
        const total = countResult?.total || 0;
        console.log(`📊 Found ${total} posts mentioning ${ticker}/${stockName}`);
        
        // 포스트 목록 조회
        this.db.all(`
          SELECT id, title, excerpt, created_date, views, category, blog_type
          FROM blog_posts
          WHERE ${whereClause}
          ORDER BY created_date DESC
          LIMIT ? OFFSET ?
        `, [...searchParams, limit, offset], (err, rows) => {
          if (err) {
            console.error('Posts query failed:', err);
            reject(err);
          } else {
            console.log(`✅ Retrieved ${rows?.length || 0} posts for ${ticker}`);
            resolve({
              posts: rows || [],
              total: total,
              hasMore: (offset + limit) < total,
              limit: limit,
              offset: offset
            });
          }
        });
      });
    });
  }

  // 연결 풀링을 위한 개선된 연결 관리 (종료하지 않고 재사용)
  close() {
    // 성능 최적화: 연결을 유지하여 재사용 가능하도록 함
    // 프로세스 종료시에만 자동으로 연결이 종료됨
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 SQLite3 연결 유지 (성능 최적화)');
    }
  }

  // 강제 연결 종료 (필요한 경우만 사용)
  forceClose() {
    if (this.db && this.isConnected) {
      this.db.close((err) => {
        if (err) {
          console.error('SQLite3 연결 종료 실패:', err);
        } else {
          this.isConnected = false;
          this.db = null;
          console.log('📪 SQLite3 연결 강제 종료');
        }
      });
    }
  }
}

// 글로벌 인스턴스를 통한 연결 풀링 (성능 최적화)
let globalStockDB = null;

function getStockDB() {
  if (!globalStockDB) {
    globalStockDB = new StockDB();
  }
  return globalStockDB;
}

// 프로세스 종료 시 연결 정리
process.on('exit', () => {
  if (globalStockDB) {
    globalStockDB.forceClose();
  }
});

process.on('SIGINT', () => {
  if (globalStockDB) {
    globalStockDB.forceClose();
  }
  process.exit(0);
});

module.exports = StockDB;
module.exports.getStockDB = getStockDB;