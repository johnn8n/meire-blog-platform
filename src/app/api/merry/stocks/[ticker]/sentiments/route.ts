import { NextRequest, NextResponse } from 'next/server';

const { getStockDB } = require('@/lib/stock-db-sqlite3');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6mo';
    
    console.log(`📊 Fetching sentiment data for ${ticker} (${period})`);
    
    const stockDB = getStockDB();
    await stockDB.connect();
    
    // Period to days mapping
    const periodDays = period === '1mo' ? 30 : period === '3mo' ? 90 : period === '6mo' ? 180 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    
    // Get sentiment data for the ticker within the time period
    // First try Claude AI enhanced sentiment data, fallback to basic sentiment data
    const sentimentData = await new Promise((resolve, reject) => {
      // Claude AI 감정 분석 데이터 조회 (우선순위)
      stockDB.db.all(`
        SELECT 
          psc.ticker,
          psc.sentiment,
          psc.sentiment_score,
          psc.confidence,
          psc.key_reasoning,
          psc.supporting_evidence,
          psc.key_keywords,
          psc.context_quotes,
          psc.investment_perspective,
          psc.investment_timeframe,
          psc.conviction_level,
          psc.mention_context,
          psc.analysis_focus,
          psc.uncertainty_factors,
          psc.analyzed_at,
          bp.id as post_id,
          bp.title as post_title,
          bp.created_date,
          bp.views,
          bp.excerpt,
          'claude' as data_source
        FROM post_stock_sentiments_claude psc
        JOIN blog_posts bp ON psc.post_id = bp.id
        WHERE psc.ticker = ? AND bp.created_date >= ?
        
        UNION ALL
        
        SELECT 
          pss.ticker,
          pss.sentiment,
          pss.sentiment_score,
          pss.confidence,
          NULL as key_reasoning,
          NULL as supporting_evidence,
          pss.keywords as key_keywords,
          NULL as context_quotes,
          NULL as investment_perspective,
          NULL as investment_timeframe,
          NULL as conviction_level,
          NULL as mention_context,
          NULL as analysis_focus,
          NULL as uncertainty_factors,
          pss.analyzed_at,
          bp.id as post_id,
          bp.title as post_title,
          bp.created_date,
          bp.views,
          bp.excerpt,
          'basic' as data_source
        FROM post_stock_sentiments pss
        JOIN blog_posts bp ON pss.post_id = bp.id
        WHERE pss.ticker = ? AND bp.created_date >= ?
          AND NOT EXISTS (
            SELECT 1 FROM post_stock_sentiments_claude psc 
            WHERE psc.post_id = pss.post_id AND psc.ticker = pss.ticker
          )
        
        ORDER BY created_date DESC
      `, [ticker, startTimestamp, ticker, startTimestamp], (err, rows) => {
        if (err) {
          console.error('Sentiment query failed:', err);
          reject(err);
        } else {
          console.log(`✅ Found ${rows?.length || 0} sentiment records for ${ticker} (Claude: ${rows?.filter(r => r.data_source === 'claude').length || 0}, Basic: ${rows?.filter(r => r.data_source === 'basic').length || 0})`);
          resolve(rows || []);
        }
      });
    });
    
    stockDB.close(); // 글로벌 인스턴스는 유지됨
    
    // Group sentiment data by date and sentiment type
    const sentimentByDate = {};
    const sentimentSummary = {
      positive: 0,
      negative: 0, 
      neutral: 0,
      total: 0
    };
    
    (sentimentData as any[]).forEach(record => {
      // created_date는 이미 Unix timestamp (초 단위)이므로 1000을 곱하지 않음
      const date = new Date(record.created_date).toISOString().split('T')[0];
      
      if (!sentimentByDate[date]) {
        sentimentByDate[date] = {
          date,
          sentiments: [],
          posts: []
        };
      }
      
      // Claude AI 분석 데이터인지 기본 분석 데이터인지에 따라 다르게 처리
      const sentimentRecord = {
        sentiment: record.sentiment,
        score: record.sentiment_score,
        confidence: record.confidence,
        data_source: record.data_source,
        // Claude AI 분석 데이터일 때만 포함되는 정보
        ...(record.data_source === 'claude' && {
          key_reasoning: record.key_reasoning,
          supporting_evidence: (() => {
            try {
              return record.supporting_evidence ? JSON.parse(record.supporting_evidence) : null;
            } catch (e) {
              console.warn('Failed to parse supporting_evidence:', e.message);
              return null;
            }
          })(),
          context_quotes: (() => {
            try {
              return record.context_quotes ? JSON.parse(record.context_quotes) : [];
            } catch (e) {
              console.warn('Failed to parse context_quotes:', e.message);
              return [];
            }
          })(),
          investment_perspective: (() => {
            try {
              return record.investment_perspective ? JSON.parse(record.investment_perspective) : [];
            } catch (e) {
              console.warn('Failed to parse investment_perspective:', e.message);
              return [];
            }
          })(),
          investment_timeframe: record.investment_timeframe,
          conviction_level: record.conviction_level,
          mention_context: record.mention_context,
          analysis_focus: record.analysis_focus,
          uncertainty_factors: (() => {
            try {
              return record.uncertainty_factors ? JSON.parse(record.uncertainty_factors) : [];
            } catch (e) {
              console.warn('Failed to parse uncertainty_factors:', e.message);
              return [];
            }
          })()
        }),
        // 키워드는 두 소스 모두에서 처리
        keywords: (() => {
          try {
            const keywordData = record.key_keywords || record.keywords;
            if (!keywordData || keywordData.trim() === '') {
              return record.data_source === 'claude' ? [] : {};
            }
            return JSON.parse(keywordData);
          } catch (e) {
            console.warn('Failed to parse keywords:', record.key_keywords || record.keywords, 'Error:', e.message);
            return record.data_source === 'claude' ? [] : {};
          }
        })(),
        // 기본 컨텍스트 (Claude AI에서는 context_quotes가 더 구체적)
        context: record.context_snippet || null
      };

      sentimentByDate[date].sentiments.push(sentimentRecord);
      
      sentimentByDate[date].posts.push({
        id: record.post_id,
        title: record.post_title,
        excerpt: record.excerpt,
        views: record.views,
        date: record.created_date
      });
      
      // Update summary
      sentimentSummary[record.sentiment]++;
      sentimentSummary.total++;
    });
    
    const response = {
      ticker,
      period,
      sentimentByDate,
      summary: sentimentSummary,
      totalMentions: sentimentSummary.total,
      averageConfidence: sentimentData.length > 0 
        ? (sentimentData as any[]).reduce((sum, r) => sum + r.confidence, 0) / sentimentData.length 
        : 0
    };
    
    console.log(`📈 Sentiment summary for ${ticker}:`, sentimentSummary);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('감정 분석 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' }, 
      { status: 500 }
    );
  }
}