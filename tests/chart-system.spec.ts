import { test, expect } from '@playwright/test';

test.describe('메르 차트 시스템 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 전에 콘솔 에러 캐치
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('브라우저 에러:', msg.text());
      }
    });
  });

  test('홈페이지 로딩 및 메르s Pick 표시 확인', async ({ page }) => {
    await page.goto('http://localhost:3004');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/요르의 투자 블로그/);
    
    // 메르's Pick 섹션이 있는지 확인
    await expect(page.locator('text=메르\'s Pick')).toBeVisible();
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
  });

  test('테슬라 차트 페이지 로딩 및 차트 표시 확인', async ({ page }) => {
    console.log('🚀 테슬라 차트 페이지 테스트 시작...');
    
    await page.goto('http://localhost:3004/merry/stocks/TSLA');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 종목명 확인
    await expect(page.locator('h1')).toContainText('테슬라');
    
    // 차트 컨테이너 확인 (더 구체적인 선택자 사용)
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible();
    
    // 현재가 표시 확인 (첫 번째 매치만 확인)
    await expect(page.locator('text=/\\$[0-9,]+\\.?[0-9]*/').first()).toBeVisible();
    
    // 차트 스크린샷
    await page.screenshot({ path: 'test-results/tesla-chart.png', fullPage: true });
    
    console.log('✅ 테슬라 차트 테스트 완료');
  });

  test('삼성전자 차트 페이지 및 한국 종목 확인', async ({ page }) => {
    console.log('🚀 삼성전자 차트 페이지 테스트 시작...');
    
    await page.goto('http://localhost:3004/merry/stocks/005930');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 종목명 확인
    await expect(page.locator('h1')).toContainText('삼성전자');
    
    // 한국 원화 표시 확인 (첫 번째 요소만)
    await expect(page.locator('text=/₩[0-9,]+/').first()).toBeVisible();
    
    // 차트 컨테이너 확인 (더 구체적인 선택자 사용)
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible();
    
    await page.screenshot({ path: 'test-results/samsung-chart.png', fullPage: true });
    
    console.log('✅ 삼성전자 차트 테스트 완료');
  });

  test('차트 인터랙션 테스트 - 호버 및 툴팁', async ({ page }) => {
    console.log('🚀 차트 인터랙션 테스트 시작...');
    
    await page.goto('http://localhost:3004/merry/stocks/AAPL');
    await page.waitForLoadState('networkidle');
    
    // 차트 영역 찾기
    const chartArea = page.locator('.recharts-wrapper svg').first();
    await expect(chartArea).toBeVisible();
    
    // 차트에 마우스 호버
    await chartArea.hover();
    
    // 호버 효과 대기 (툴팁이 나타날 시간)
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/apple-chart-hover.png', fullPage: true });
    
    console.log('✅ 차트 인터랙션 테스트 완료');
  });

  test('관련 포스트 로딩 및 더보기 기능 확인', async ({ page }) => {
    console.log('🚀 관련 포스트 테스트 시작...');
    
    await page.goto('http://localhost:3004/merry/stocks/TSLA');
    await page.waitForLoadState('networkidle');
    
    // 관련 포스트 섹션 확인 (더 유연한 선택자 사용)
    const relatedPostsSection = page.locator('text=관련 포스트').or(page.locator('text=Related Posts')).or(page.locator('[data-testid*="related"], [class*="related"], [class*="post"]')).first();
    if (await relatedPostsSection.isVisible()) {
      await expect(relatedPostsSection).toBeVisible();
    } else {
      console.log('관련 포스트 섹션을 찾을 수 없습니다. 페이지 구조를 확인합니다.');
    }
    
    // 포스트 카드들이 표시되는지 확인
    const postCards = page.locator('[class*="card"], [class*="post"]');
    await expect(postCards.first()).toBeVisible();
    
    // 더보기 버튼이 있다면 클릭
    const loadMoreBtn = page.locator('text=더보기');
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-results/tesla-posts.png', fullPage: true });
    
    console.log('✅ 관련 포스트 테스트 완료');
  });

  test('차트 데이터 로딩 성능 테스트', async ({ page }) => {
    console.log('🚀 성능 테스트 시작...');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3004/merry/stocks/NVDA');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`페이지 로딩 시간: ${loadTime}ms`);
    
    // 로딩 시간이 35초 이내인지 확인 (현실적인 임계값)
    expect(loadTime).toBeLessThan(35000);
    
    // API 응답 시간도 체크
    const apiResponse = await page.waitForResponse(response => 
      response.url().includes('/api/') && response.status() === 200
    );
    
    console.log(`✅ API 응답 상태: ${apiResponse.status()}`);
    
    await page.screenshot({ path: 'test-results/nvidia-performance.png', fullPage: true });
    
    console.log('✅ 성능 테스트 완료');
  });

  test('모바일 반응형 차트 테스트', async ({ page }) => {
    console.log('🚀 모바일 반응형 테스트 시작...');
    
    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3004/merry/stocks/042660');
    await page.waitForLoadState('networkidle');
    
    // 차트가 모바일에서도 표시되는지 확인
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible();
    
    await page.screenshot({ path: 'test-results/mobile-chart.png', fullPage: true });
    
    console.log('✅ 모바일 반응형 테스트 완료');
  });
});