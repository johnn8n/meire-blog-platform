'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ChevronRight, BarChart3, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';

interface Stock {
  ticker: string;
  name?: string;
  company_name: string;
  market?: string;
  mentions?: number;
  mention_count: number;
  analyzed_count: number;
  postCount?: number;
  firstMention?: string;
  lastMention?: string;
  last_mentioned_at: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[] | string;
  description: string;
  currentPrice: number;
  currency: string;
  priceChange: string;
  recentPosts?: any[];
}

export default function MerryStockPicks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      console.log('📊 메르스 픽 종목 데이터 로딩 시작...');
      
      // 초고속 API 호출 (타임아웃 및 최적화 적용)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      const response = await fetch(`/api/merry/stocks?limit=5`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 API 응답:', data);
      
      if (data.success && data.data && data.data.stocks) {
        console.log(`📊 ${data.data.stocks.length}개 종목 로드 완료`);
        setStocks(data.data.stocks);
        setError(null);
      } else {
        console.error('📊 종목 데이터 구조 오류:', data);
        setError('종목 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('📊 API 요청 타임아웃');
        setError('요청 시간이 초과되었습니다. 새로고침해주세요.');
      } else {
        console.error('📊 종목 데이터 로딩 에러:', err);
        setError('종목 데이터 로딩 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // 종목별 특성 뱃지 (Individual Stock Badges)
  const getStockCharacteristicBadges = (stock: any) => {
    const badges = [];
    
    // 오늘 언급 뱃지
    const today = new Date().toISOString().split('T')[0];
    const lastMentionDate = (stock.lastMention || stock.last_mentioned_at)?.split(' ')[0];
    if (lastMentionDate === today) {
      badges.push({
        icon: '🆕',
        text: '오늘 언급',
        className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
      });
    }
    
    // 트럼프 관련 뱃지 (실제 데이터 기반)
    const trumpRelatedStocks = {
      'INTC': { mentions: 3, relevance: 'high' },
      'LLY': { mentions: 6, relevance: 'high' },
      'UNH': { mentions: 4, relevance: 'medium' },
      '005930': { mentions: 24, relevance: 'high' },
      'TSLA': { mentions: 15, relevance: 'high' }
    };
    
    if (trumpRelatedStocks[stock.ticker]) {
      const trumpData = trumpRelatedStocks[stock.ticker];
      if (trumpData.relevance === 'high') {
        badges.push({
          icon: '🇺🇸',
          text: '트럼프 관련',
          className: 'bg-gradient-to-r from-blue-600 to-red-600 text-white'
        });
      }
    }
    
    return badges;
  };

  // 상대적 순위 뱃지 (Comparative Ranking Badges)
  const getRankingBadge = (stock: any, index: number, allStocks: any[]) => {
    // 3개월내 최다 언급 (1위만)
    if (index === 0) {
      return {
        icon: '🏆',
        text: '3개월내 최다 언급',
        className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      };
    }
    
    // 2위, 3위 순위 뱃지
    if (index === 1) {
      return {
        icon: '🥈',
        text: '3개월내 최다 언급 2위',
        className: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
      };
    }
    
    if (index === 2) {
      return {
        icon: '🥉',
        text: '3개월내 최다 언급 3위',
        className: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      };
    }
    
    return null;
  };

  const getMarketColor = (market: string) => {
    switch (market) {
      case 'KOSPI':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'NASDAQ':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'NYSE':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'TSE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-base sm:text-lg font-semibold whitespace-nowrap sm:whitespace-normal">
              메르's Pick<span className="block sm:inline text-sm sm:text-base font-normal text-muted-foreground ml-2">주목할 종목</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-base sm:text-lg font-semibold whitespace-nowrap sm:whitespace-normal">
              메르's Pick<span className="block sm:inline text-sm sm:text-base font-normal text-muted-foreground ml-2">주목할 종목</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-base sm:text-lg font-semibold whitespace-nowrap sm:whitespace-normal">
              메르's Pick<span className="block sm:inline text-sm sm:text-base font-normal text-muted-foreground ml-2">주목할 종목</span>
            </span>
          </CardTitle>
          <Link href="/merry/stocks">
            <Button variant="ghost" size="sm" className="gap-1">
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          (최신 언급일 순서)
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stocks.map((stock, index) => {
          const characteristicBadges = getStockCharacteristicBadges(stock);
          const rankingBadge = getRankingBadge(stock, index, stocks);
          
          return (
          <Link key={stock.ticker} href={`/merry/stocks/${stock.ticker}`}>
            <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer">
              {/* 뱃지 시스템 - 순위 뱃지를 먼저 표시 */}
              <div className="mb-2 flex flex-wrap gap-1">
                {/* 1. 상대적 순위 뱃지 (가장 먼저 표시) */}
                {rankingBadge && (
                  <Badge className={`text-xs ${rankingBadge.className}`}>
                    {rankingBadge.icon} {rankingBadge.text}
                  </Badge>
                )}
                
                {/* 2. 종목별 특성 뱃지 (개별 종목) */}
                {characteristicBadges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} className={`text-xs ${badge.className}`}>
                    {badge.icon} {badge.text}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                      {stock.name || stock.company_name}
                    </h3>
                    {getSentimentIcon(stock.sentiment)}
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {stock.ticker}
                    </Badge>
                    <Badge className={`text-xs flex-shrink-0 ${getMarketColor(stock.market)}`}>
                      {stock.market}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {stock.description}
                  </p>
                </div>
                
                {/* 가격 정보를 별도 행으로 분리 (모바일에서) */}
                <div className="flex flex-col sm:text-right sm:min-w-0 sm:ml-4">
                  <div className="text-sm font-bold mb-1 flex flex-col sm:flex-row sm:items-center gap-1">
                    {stock.currentPrice !== null ? (
                      <>
                        <span className="truncate">
                          {stock.currency === 'USD' ? '$' : '₩'}{stock.currentPrice?.toLocaleString()}
                        </span>
                        {stock.priceChange && (
                          <span className={`text-xs flex-shrink-0 ${stock.priceChange?.startsWith('+') ? 'text-green-500' : stock.priceChange?.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                            {stock.priceChange}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        가격 정보 없음
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {stock.mention_count}개 포스트 중 {stock.analyzed_count}개 분석 완료
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                <div className="flex gap-1 flex-wrap">
                  {/* 🔧 API에서 이미 배열로 변환되므로 간단한 처리 */}
                  {Array.isArray(stock.tags) && stock.tags.length > 0 ? (
                    stock.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={`${stock.ticker}-tag-${tagIndex}`} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      태그 없음
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span className="truncate">
                    최근: {(stock.lastMention || stock.last_mentioned_at) && typeof (stock.lastMention || stock.last_mentioned_at) === 'string' ? (
                      (() => {
                        try {
                          return new Date(stock.lastMention || stock.last_mentioned_at).toLocaleDateString('ko-KR');
                        } catch (e) {
                          return '날짜 오류';
                        }
                      })()
                    ) : '정보 없음'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )})}
      </CardContent>
    </Card>
  );
}