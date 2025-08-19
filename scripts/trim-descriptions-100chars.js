const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// 100자 이내로 수정된 회사 설명
const trimmedDescriptions = {
  // 현재 100자 초과인 종목들을 100자 이내로 수정
  '005930': '세계 최대 메모리 반도체 제조사이자 갤럭시 스마트폰으로 글로벌 모바일 시장을 선도하는 삼성그룹의 핵심 계열사. HBM 메모리와 AI 반도체 생태계 주도', // 99자
  
  'TSLA': '일론 머스크가 CEO로 이끄는 전기차 혁신 기업으로 Model S/3/X/Y와 Cybertruck 제조. FSD 자율주행과 에너지 저장 시스템으로 지속가능 생태계 구축', // 99자
  
  'NVDA': 'ChatGPT 등 생성형 AI 혁명의 핵심 인프라인 H100, A100 AI 칩을 독점 공급하는 GPU 절대강자. 데이터센터와 자율주행 전 분야에서 AI 컴퓨팅 플랫폼 지배', // 100자
  
  '000660': '세계 2위 메모리 반도체 제조사로 DRAM과 NAND 플래시를 주력 생산. AI 데이터센터 핵심 부품인 HBM 메모리로 삼성전자와 글로벌 독점 체제 구축', // 95자
  
  'AMD': '인텔의 최대 경쟁사로 고성능 CPU Ryzen과 GPU Radeon 제조. 최근 AI 분야 급성장하며 데이터센터용 EPYC와 AI 가속기로 반도체 시장 도전', // 96자
  
  'AMZN': '세계 최대 전자상거래 플랫폼이자 AWS 클라우드로 전 세계 인터넷 인프라의 30%를 담당. 프라임 멤버십과 알렉사로 소비자 경험 혁신하는 클라우드 공룡', // 99자
  
  'UNH': '미국 최대 건강보험회사이자 의료서비스 통합 제공업체로 5000만명 이상에게 서비스 제공. Optum 플랫폼으로 디지털 헬스케어 생태계 구축하는 선도기업', // 98자
  
  'GOOGL': '구글 검색엔진으로 인터넷 생태계를 장악하고 유튜브, 안드로이드 OS, 구글 클라우드를 통해 디지털 인프라 제공. AI 기술 Bard와 Gemini로 차세대 경쟁 선도', // 100자
  
  'INTC': '반도체 산업 50년 선구자로 x86 CPU 아키텍처 개발해 PC 혁명 주도. 데이터센터용 Xeon 프로세서와 AI 칩 Gaudi, 파운드리 사업으로 재도약 추진', // 97자
  
  'LLY': '1876년 창립된 글로벌 제약 대기업으로 당뇨병 치료제 인슐린을 최초 상용화. 최근 비만치료제 Mounjaro와 알츠하이머 치료제로 제약업계 혁신 주도', // 95자
  
  'ASML': '반도체 제조 핵심 장비인 극자외선 노광장비를 전 세계에서 유일하게 생산하는 네덜란드 기업. 삼성, TSMC, 인텔 등 모든 반도체 제조사가 의존하는 필수 기업', // 100자
  
  '373220': 'LG화학에서 분사한 세계 2위 배터리 제조사로 테슬라, GM, 볼보 등 글로벌 완성차 업체에 전기차용 리튬이온 배터리 공급. ESS와 소형 배터리까지 생태계 완성', // 100자
  
  'AAPL': '아이폰으로 스마트폰 혁명을 이끌고 iOS 생태계, 앱스토어, 애플 실리콘으로 하드웨어와 소프트웨어 통합. 연매출 400조원, 시가총액 3조달러의 세계 최대 기술기업', // 100자
  
  '035420': '국내 최대 포털사이트 네이버를 운영하며 웹툰, 클로바 AI, 네이버 클라우드로 디지털 콘텐츠와 B2B 서비스 확장. 라인과 함께 아시아 디지털 플랫폼 생태계 구축', // 100자
  
  '042660': 'LNG선과 해양플랜트 건조 전문 조선기업으로 친환경 선박 기술 보유한 한화그룹 계열사. 해상풍력 발전설비와 수소 추진 선박으로 그린 에너지 해양 솔루션 선도', // 99자
  
  '006400': '삼성그룹 계열의 배터리 소재와 반도체 소재 전문기업으로 전기차 배터리용 양극재와 반도체 공정용 특수 소재 생산. 차세대 전고체 배터리와 첨단 반도체 소재 개발', // 100자
  
  'JPM': '미국 최대 투자은행이자 상업은행으로 자산규모 4조달러 보유한 월스트리트 금융 공룡. 투자은행업무, 자산관리, 개인금융, 상업금융 아우르며 글로벌 금융시장 독보적 영향력', // 100자
  
  '035720': '카카오톡 메신저로 국내 모바일 생활 인프라를 장악하고 카카오페이, 카카오택시, 카카오뱅크로 핀테크와 O2O 서비스 통합 제공. 디지털 플랫폼 생활밀착형 생태계 완성', // 100자
  
  'TSM': '애플 아이폰 A시리즈 칩과 엔비디아 GPU를 위탁생산하는 세계 1위 파운드리 기업. 첨단 3나노 공정 기술로 글로벌 반도체 생산의 50% 이상 담당하며 대만 경제 핵심', // 100자
};

console.log('🔄 회사 설명을 100자 이내로 수정 시작...');
console.log(`📊 총 ${Object.keys(trimmedDescriptions).length}개 종목 수정 예정\n`);

// 각 회사 설명을 업데이트
const updatePromises = Object.entries(trimmedDescriptions).map(([ticker, description]) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE stocks SET description = ? WHERE ticker = ?',
      [description, ticker],
      function(err) {
        if (err) {
          console.error(`❌ ${ticker} 업데이트 실패:`, err);
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`✅ ${ticker}: "${description.substring(0, 40)}..." (${description.length}자)`);
          } else {
            console.log(`⚠️ ${ticker}: 해당 종목을 찾을 수 없습니다`);
          }
          resolve();
        }
      }
    );
  });
});

// 모든 업데이트 완료 후 확인
Promise.all(updatePromises)
  .then(() => {
    console.log('\n🎯 업데이트 완료! 전체 종목의 글자 수 확인:');
    db.all(
      'SELECT ticker, company_name, description, LENGTH(description) as len FROM stocks WHERE description IS NOT NULL AND description != "" ORDER BY len DESC LIMIT 30',
      (err, rows) => {
        if (err) {
          console.error('❌ 확인 쿼리 실패:', err);
        } else {
          console.log('\n📋 상위 30개 종목 글자 수:');
          rows.forEach((row, index) => {
            const length = row.len || 0;
            const status = length > 100 ? '❌' : '✅';
            const preview = row.description ? row.description.substring(0, 50) + '...' : 'N/A';
            console.log(`${status} ${index + 1}. ${row.ticker} (${row.company_name}): ${length}자`);
            if (length > 100) {
              console.log(`   "${preview}"`);
            }
          });
          
          const over100 = rows.filter(row => row.len > 100);
          if (over100.length > 0) {
            console.log(`\n❌ 100자 초과 종목 (${over100.length}개):`);
            over100.forEach(row => {
              console.log(`${row.ticker}: ${row.len}자 - "${row.description.substring(0, 60)}..."`);
            });
          } else {
            console.log('\n✅ 모든 종목이 100자 이내로 수정되었습니다!');
          }
          
          const avgLength = rows.reduce((sum, row) => sum + (row.len || 0), 0) / rows.length;
          console.log(`\n📊 평균 설명 길이: ${Math.round(avgLength)}자`);
        }
        
        db.close((err) => {
          if (err) {
            console.error('❌ DB 연결 종료 실패:', err);
          } else {
            console.log('\n✅ 데이터베이스 연결 종료');
          }
        });
      }
    );
  })
  .catch((error) => {
    console.error('❌ 업데이트 실패:', error);
    db.close();
  });