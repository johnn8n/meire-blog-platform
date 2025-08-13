// sqlite3를 사용한 종가 데이터베이스 유틸리티
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class StockDB {
  constructor() {
    const dbPath = path.join(process.cwd(), 'database.db');
    this.db = null;
    this.isConnected = false;
  }

  // DB 연결
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path.join(process.cwd(), 'database.db'), (err) => {
        if (err) {
          console.error('SQLite3 연결 실패:', err);
          reject(err);
        } else {
          this.isConnected = true;
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
        SELECT is_merry_mentioned 
        FROM stocks 
        WHERE ticker = ?
      `, [ticker], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.is_merry_mentioned === 1);
        }
      });
    });
  }

  // 종목 정보 가져오기
  async getStockInfo(ticker) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT ticker, company_name_kr, market, currency, is_merry_mentioned
        FROM stocks 
        WHERE ticker = ?
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
  async getStockPrices(ticker, period = '6m') {
    if (!this.isConnected) await this.connect();
    
    // 기간 계산
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
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
    
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT date, close_price, volume
        FROM stock_prices 
        WHERE ticker = ? AND date >= ? AND date <= ?
        ORDER BY date ASC
      `, [ticker, startDateStr, endDateStr], (err, rows) => {
        if (err) {
          reject(err);
        } else {
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
        SELECT mentioned_date, mention_type, sentiment_score
        FROM merry_mentioned_stocks
        WHERE ticker = ?
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

  // 메르's Pick 종목 가져오기 (최근 언급 순)
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
          s.mention_count as postCount,
          s.last_mentioned_date as lastMention,
          s.first_mentioned_date as firstMention,
          'positive' as sentiment,
          s.sector
        FROM stocks s
        WHERE s.is_merry_mentioned = 1
        ORDER BY s.last_mentioned_date DESC
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
            let description = companyDescriptions[ticker] || companyDescriptions[name];
            
            // 회사 설명이 없으면 기본 설명 생성
            if (!description) {
              if (row.sector) {
                description = `${row.sector} 분야의 주요 기업`;
              } else {
                description = `${name}의 사업 정보`;
              }
            }
            
            return {
              ticker: row.ticker,
              name: name,
              market: row.market || 'NASDAQ',
              currency: row.currency || 'USD',
              postCount: row.postCount || 0,
              firstMention: row.firstMention,
              lastMention: row.lastMention,
              sentiment: row.sentiment || 'neutral',
              tags: [],
              description: description,
              recentPosts: [],
              mentions: row.postCount || 0
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
        SELECT s.ticker, s.company_name, s.company_name_kr, s.market, 
               s.currency, s.mention_count, s.last_mentioned_date,
               COUNT(sp.id) as price_data_count
        FROM stocks s
        LEFT JOIN stock_prices sp ON s.ticker = sp.ticker
        WHERE s.is_merry_mentioned = 1
        GROUP BY s.ticker
        ORDER BY s.last_mentioned_date DESC
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
        SELECT *
        FROM stocks
        WHERE ticker = ?
      `, [ticker], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 관련 포스트 가져오기 (페이지네이션 지원)
  async getRelatedPosts(ticker, limit = 5, offset = 0) {
    if (!this.isConnected) await this.connect();
    
    return new Promise((resolve, reject) => {
      // 전체 포스트 수 먼저 조회
      this.db.get(`
        SELECT COUNT(*) as total
        FROM posts p
        JOIN post_mentions pm ON p.id = pm.post_id
        WHERE pm.ticker = ?
      `, [ticker], (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }
        
        const total = countResult?.total || 0;
        
        // 포스트 목록 조회
        this.db.all(`
          SELECT p.id, p.title, p.excerpt, p.published_date
          FROM posts p
          JOIN post_mentions pm ON p.id = pm.post_id
          WHERE pm.ticker = ?
          ORDER BY p.published_date DESC
          LIMIT ? OFFSET ?
        `, [ticker, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
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

  // DB 연결 종료
  close() {
    if (this.db && this.isConnected) {
      this.db.close((err) => {
        if (err) {
          console.error('SQLite3 연결 종료 실패:', err);
        } else {
          this.isConnected = false;
          console.log('📪 SQLite3 연결 종료');
        }
      });
    }
  }
}

module.exports = StockDB;